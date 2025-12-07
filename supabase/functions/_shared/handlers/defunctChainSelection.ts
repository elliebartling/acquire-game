import { GamePhase, DisposalQueue, DefunctChain } from "../phases.ts";
import { HandlerResult, GameEvent } from "../events.ts";
import { GameStateRecord } from "../gameState.ts";
import { ChainRecord } from "../boardUtils.ts";
import { getPlayersInOrder } from "../gameLogic.ts";
import { handleBonusPayout } from "./bonusPayout.ts";
import { buildBuyPendingAction } from "./stockPurchase.ts";

/**
 * Handles the player's selection of which defunct chain to process next
 * when multiple defunct chains have the same size.
 */
export function handleDefunctChainSelection(
  gameState: GameStateRecord,
  playerId: string,
  selectedChainId: string,
  currentPhase: GamePhase | null,
): HandlerResult {
  if (currentPhase?.type !== "selectDefunctOrder") {
    throw new Error("No defunct chain selection pending.");
  }
  if (currentPhase.playerId !== playerId) {
    throw new Error("Only the merger maker may select the defunct chain order.");
  }

  const chains = gameState.chains as ChainRecord[];
  const players = gameState.players ?? [];
  const turnOrder = gameState.turnOrder ?? [];

  // Validate the selected chain is one of the options
  const selectedDefunct = currentPhase.defunctOptions.find(
    (chain) => chain.id === selectedChainId
  );
  if (!selectedDefunct) {
    throw new Error("Invalid defunct chain selection.");
  }

  const selectedChainRecord = chains.find((c) => c.id === selectedChainId);
  if (!selectedChainRecord) {
    throw new Error("Selected chain not found in game state.");
  }

  const events: GameEvent[] = [];

  // Pay bonuses for the selected defunct chain
  const bonusResult = handleBonusPayout(
    gameState,
    selectedChainRecord,
    selectedDefunct.size
  );
  events.push(...bonusResult.events);

  // Find players with stock in this defunct chain
  const playersWithStock = players.filter((p) => {
    const shares = p.stocks?.[selectedDefunct.name] ?? 0;
    return shares > 0;
  });

  let nextPhase: GamePhase | null = null;

  if (playersWithStock.length > 0) {
    // Set up disposal queue for this chain
    const disposalOrder = getPlayersInOrder(playerId, playersWithStock, turnOrder);

    const queue: DisposalQueue = {
      defunctChainId: selectedDefunct.id,
      defunctChainName: selectedDefunct.name,
      defunctChainSize: selectedDefunct.size,
      survivingChainId: currentPhase.survivingChainId,
      survivingChainName: currentPhase.survivingChainName,
      playerOrder: disposalOrder,
      mergerMakerId: playerId,
    };

    // Remove the selected chain from options and add to processed
    const remainingOptions = currentPhase.defunctOptions.filter(
      (c) => c.id !== selectedChainId
    );
    const updatedProcessed = [...currentPhase.processedDefuncts, selectedDefunct];

    // Determine what goes into defunctChains for the disposal phase
    let defunctChains: DefunctChain[] = [];

    if (remainingOptions.length > 0) {
      // More equal-sized chains to choose from - they'll need another selection
      defunctChains = [...remainingOptions, ...currentPhase.remainingDefuncts];
    } else {
      // No more equal-sized chains, just add the remaining smaller ones
      defunctChains = currentPhase.remainingDefuncts;
    }

    nextPhase = {
      type: "disposalLoop",
      queue,
      currentIndex: 0,
      defunctChains,
    };
  } else {
    // No players have stock in this chain, check for more chains
    const remainingOptions = currentPhase.defunctOptions.filter(
      (c) => c.id !== selectedChainId
    );
    const updatedProcessed = [...currentPhase.processedDefuncts, selectedDefunct];

    if (remainingOptions.length > 0) {
      // More equal-sized chains need selection
      nextPhase = {
        type: "selectDefunctOrder",
        playerId,
        survivingChainId: currentPhase.survivingChainId,
        survivingChainName: currentPhase.survivingChainName,
        tile: currentPhase.tile,
        defunctOptions: remainingOptions,
        processedDefuncts: updatedProcessed,
        remainingDefuncts: currentPhase.remainingDefuncts,
      };
    } else if (currentPhase.remainingDefuncts.length > 0) {
      // No more equal-sized chains, but there are smaller chains to process
      // Check if those need selection too
      const allDefuncts = currentPhase.remainingDefuncts;
      const maxSize = Math.max(...allDefuncts.map((d) => d.size));
      const equalSizedChains = allDefuncts.filter((d) => d.size === maxSize);

      if (equalSizedChains.length > 1) {
        // Multiple chains of the same size - need selection
        const smallerChains = allDefuncts.filter((d) => d.size < maxSize);
        nextPhase = {
          type: "selectDefunctOrder",
          playerId,
          survivingChainId: currentPhase.survivingChainId,
          survivingChainName: currentPhase.survivingChainName,
          tile: currentPhase.tile,
          defunctOptions: equalSizedChains,
          processedDefuncts: updatedProcessed,
          remainingDefuncts: smallerChains,
        };
      } else {
        // Single chain remaining - process it automatically
        const singleDefunct = equalSizedChains[0];
        const singleChainRecord = chains.find((c) => c.id === singleDefunct.id);
        
        if (singleChainRecord) {
          const singleBonusResult = handleBonusPayout(
            gameState,
            singleChainRecord,
            singleDefunct.size
          );
          events.push(...singleBonusResult.events);

          const singlePlayersWithStock = players.filter((p) => {
            const shares = p.stocks?.[singleDefunct.name] ?? 0;
            return shares > 0;
          });

          if (singlePlayersWithStock.length > 0) {
            const disposalOrder = getPlayersInOrder(playerId, singlePlayersWithStock, turnOrder);

            const queue: DisposalQueue = {
              defunctChainId: singleDefunct.id,
              defunctChainName: singleDefunct.name,
              defunctChainSize: singleDefunct.size,
              survivingChainId: currentPhase.survivingChainId,
              survivingChainName: currentPhase.survivingChainName,
              playerOrder: disposalOrder,
              mergerMakerId: playerId,
            };

            nextPhase = {
              type: "disposalLoop",
              queue,
              currentIndex: 0,
              defunctChains: allDefuncts.slice(1),
            };
          }
        }
      }
    } else {
      // No more defunct chains to process, offer stock buying
      const mergerMaker = players.find((p) => p.id === playerId);
      if (mergerMaker) {
        const buyAction = buildBuyPendingAction(
          playerId,
          mergerMaker.cash ?? 0,
          chains,
        );
        if (buyAction) {
          nextPhase = buyAction;
        }
      }
    }
  }

  events.push({
    type: "DefunctChainSelected",
    playerId,
    chainId: selectedChainId,
    chainName: selectedDefunct.name,
    description: `Player selected ${selectedDefunct.name} to process next`,
  });

  return {
    updatedState: gameState,
    events,
    nextPhase,
    moveDescription: `Selected ${selectedDefunct.name} for processing`,
  };
}


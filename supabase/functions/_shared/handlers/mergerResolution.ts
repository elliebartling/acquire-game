import { GamePhase, DisposalQueue, DefunctChain } from "../phases.ts";
import { HandlerResult, GameEvent } from "../events.ts";
import { GameStateRecord } from "../gameState.ts";
import { ChainRecord, assignConnectedClusterToChain, assignTilesToChain } from "../boardUtils.ts";
import { getPlayersInOrder, sortDefunctChainsBySize } from "../gameLogic.ts";
import { handleBonusPayout } from "./bonusPayout.ts";
import { dealTilesToPlayer } from "../gameState.ts";
import { buildBuyPendingAction } from "./stockPurchase.ts";

export function handleMergerResolution(
  gameState: GameStateRecord,
  playerId: string,
  survivorChainId: string,
  currentPhase: GamePhase | null,
): HandlerResult {
  if (currentPhase?.type !== "mergerChoice") {
    throw new Error("No merger to resolve.");
  }
  if (currentPhase.playerId !== playerId) {
    throw new Error("Only the active player may resolve this.");
  }

  const board = gameState.board!;
  const chains = gameState.chains as ChainRecord[];
  const players = gameState.players ?? [];
  const turnOrder = gameState.turnOrder ?? [];

  const survivor = chains.find((chain) => chain.id === survivorChainId);
  if (!survivor) {
    throw new Error("Unknown surviving chain.");
  }

  const mergeChainIds = currentPhase.options.map((option) => option.id);
  const mergingChains = chains.filter(
    (chain) => mergeChainIds.includes(chain.id) && chain.id !== survivorChainId,
  );

  // Sort all defunct chains by size (largest first)
  const sortedDefunctChains = sortDefunctChainsBySize(mergingChains);

  const events: GameEvent[] = [];

  // Merge chains - all defunct chains merge into survivor
  assignConnectedClusterToChain(survivorChainId, currentPhase.tile, board, chains);
  mergingChains.forEach((chain) => {
    assignTilesToChain(survivorChainId, chain.tiles ?? [], board.tiles, chains);
    chain.tiles = [];
    chain.founderId = null;
  });

  events.push({
    type: "MergerResolved",
    playerId,
    survivorId: survivorChainId,
    defunctChainIds: mergingChains.map((c) => c.id),
    description: `Player resolved merger: ${mergingChains.map((c) => c.name).join(", ")} merged into ${survivor.name}`,
  });

  // Check if we need player to choose order for equal-sized defunct chains
  let nextPhase: GamePhase | null = null;

  if (sortedDefunctChains.length > 0) {
    const largestSize = sortedDefunctChains[0].size;
    const equalSizedChains = sortedDefunctChains.filter((c) => c.size === largestSize);
    const smallerChains = sortedDefunctChains.filter((c) => c.size < largestSize);

    if (equalSizedChains.length > 1) {
      // Multiple chains of the same size - player must choose order
      nextPhase = {
        type: "selectDefunctOrder",
        playerId,
        survivingChainId: survivorChainId,
        survivingChainName: survivor.name,
        tile: currentPhase.tile,
        defunctOptions: equalSizedChains,
        processedDefuncts: [],
        remainingDefuncts: smallerChains,
      };
    } else {
      // Single largest defunct chain - process it automatically
      const firstDefunct = mergingChains.find((c) => c.id === sortedDefunctChains[0].id);
      
      if (firstDefunct) {
        // Pay bonuses for this defunct chain
        const bonusResult = handleBonusPayout(gameState, firstDefunct, sortedDefunctChains[0].size);
        events.push(...bonusResult.events);

        const playersWithStock = players.filter((p) => {
          const shares = p.stocks?.[firstDefunct.name] ?? 0;
          return shares > 0;
        });

        if (playersWithStock.length > 0) {
          const disposalOrder = getPlayersInOrder(playerId, playersWithStock, turnOrder);

          const queue: DisposalQueue = {
            defunctChainId: firstDefunct.id,
            defunctChainName: firstDefunct.name,
            defunctChainSize: sortedDefunctChains[0].size,
            survivingChainId: survivorChainId,
            survivingChainName: survivor.name,
            playerOrder: disposalOrder,
            mergerMakerId: playerId,
          };

          // Remaining defunct chains to process after this one
          const remainingDefunctChains = sortedDefunctChains.slice(1);

          nextPhase = {
            type: "disposalLoop",
            queue,
            currentIndex: 0,
            defunctChains: remainingDefunctChains,
          };
        } else {
          // No players with stock in this chain, check remaining chains
          const remainingDefunctChains = sortedDefunctChains.slice(1);
          
          if (remainingDefunctChains.length > 0) {
            // Check if next group needs selection
            const nextLargestSize = remainingDefunctChains[0].size;
            const nextEqualSized = remainingDefunctChains.filter((c) => c.size === nextLargestSize);
            const nextSmaller = remainingDefunctChains.filter((c) => c.size < nextLargestSize);

            if (nextEqualSized.length > 1) {
              nextPhase = {
                type: "selectDefunctOrder",
                playerId,
                survivingChainId: survivorChainId,
                survivingChainName: survivor.name,
                tile: currentPhase.tile,
                defunctOptions: nextEqualSized,
                processedDefuncts: [sortedDefunctChains[0]],
                remainingDefuncts: nextSmaller,
              };
            } else {
              // Continue with next single chain
              const nextDefunct = mergingChains.find((c) => c.id === remainingDefunctChains[0].id);
              if (nextDefunct) {
                const nextBonusResult = handleBonusPayout(gameState, nextDefunct, remainingDefunctChains[0].size);
                events.push(...nextBonusResult.events);

                const nextPlayersWithStock = players.filter((p) => {
                  const shares = p.stocks?.[nextDefunct.name] ?? 0;
                  return shares > 0;
                });

                if (nextPlayersWithStock.length > 0) {
                  const disposalOrder = getPlayersInOrder(playerId, nextPlayersWithStock, turnOrder);

                  const queue: DisposalQueue = {
                    defunctChainId: nextDefunct.id,
                    defunctChainName: nextDefunct.name,
                    defunctChainSize: remainingDefunctChains[0].size,
                    survivingChainId: survivorChainId,
                    survivingChainName: survivor.name,
                    playerOrder: disposalOrder,
                    mergerMakerId: playerId,
                  };

                  nextPhase = {
                    type: "disposalLoop",
                    queue,
                    currentIndex: 0,
                    defunctChains: remainingDefunctChains.slice(1),
                  };
                }
              }
            }
          }
          
          // If no disposal needed for any chain, offer stock buying
          if (!nextPhase) {
            const mergerMaker = players.find((p) => p.id === playerId);
            if (mergerMaker) {
              const buyAction = buildBuyPendingAction(
                playerId,
                mergerMaker.cash ?? 0,
                chains,
              );
              if (buyAction) {
                nextPhase = buyAction;
              } else {
                // No stock available, draw tile
                const drawn = dealTilesToPlayer(gameState, playerId, 1);
                if (drawn.length > 0) {
                  events.push({
                    type: "TilesDrawn",
                    playerId,
                    count: drawn.length,
                    description: `Player drew ${drawn.length} tile(s)`,
                  });
                }
              }
            }
          }
        }
      }
    }
  } else {
    // No defunct chains (shouldn't happen in a real merger), offer stock buying
    const mergerMaker = players.find((p) => p.id === playerId);
    if (mergerMaker) {
      const buyAction = buildBuyPendingAction(
        playerId,
        mergerMaker.cash ?? 0,
        chains,
      );
      if (buyAction) {
        nextPhase = buyAction;
      } else {
        // No stock available, draw tile
        const drawn = dealTilesToPlayer(gameState, playerId, 1);
        if (drawn.length > 0) {
          events.push({
            type: "TilesDrawn",
            playerId,
            count: drawn.length,
            description: `Player drew ${drawn.length} tile(s)`,
          });
        }
      }
    }
  }

  return {
    updatedState: gameState,
    events,
    nextPhase,
    moveDescription: events.map((e) => e.description).join("; "),
  };
}


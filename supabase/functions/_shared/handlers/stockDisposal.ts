import { GamePhase, DisposalQueue } from "../phases.ts";
import { HandlerResult, GameEvent, DisposalAction } from "../events.ts";
import { GameStateRecord, PlayerStateRecord } from "../gameState.ts";
import { ChainRecord } from "../boardUtils.ts";
import { calculateStockPrice, getPlayersInOrder } from "../gameLogic.ts";
import { buildBuyPendingAction } from "./stockPurchase.ts";
import { handleBonusPayout } from "./bonusPayout.ts";

/**
 * Helper function to process the next defunct chain after completing disposal for current chain.
 * Returns the next phase (either another disposal loop, selection phase, stock buy, or null).
 */
function processNextDefunctChain(
  currentPhase: GamePhase & { type: "disposalLoop" },
  gameState: GameStateRecord,
  chains: ChainRecord[],
  events: GameEvent[]
): GamePhase | null {
  const players = gameState.players ?? [];
  const turnOrder = gameState.turnOrder ?? [];
  
  // Check if there are more defunct chains to process
  if (currentPhase.defunctChains && currentPhase.defunctChains.length > 0) {
    // Check if we need player to choose order for equal-sized chains
    const allDefuncts = currentPhase.defunctChains;
    const maxSize = Math.max(...allDefuncts.map((d) => d.size));
    const equalSizedChains = allDefuncts.filter((d) => d.size === maxSize);
    const smallerChains = allDefuncts.filter((d) => d.size < maxSize);

    if (equalSizedChains.length > 1) {
      // Multiple chains of the same size - player must choose order
      return {
        type: "selectDefunctOrder",
        playerId: currentPhase.queue.mergerMakerId,
        survivingChainId: currentPhase.queue.survivingChainId,
        survivingChainName: currentPhase.queue.survivingChainName,
        tile: "", // tile not relevant at this point in disposal
        defunctOptions: equalSizedChains,
        processedDefuncts: [], // Already processed chains not tracked here
        remainingDefuncts: smallerChains,
      };
    }

    // Single largest chain - process it automatically
    const nextDefunctInfo = equalSizedChains[0];
    const nextDefunct = chains.find((c) => c.id === nextDefunctInfo.id);
    
    if (nextDefunct) {
      // Pay bonuses for this defunct chain before disposal
      const bonusResult = handleBonusPayout(gameState, nextDefunct, nextDefunctInfo.size);
      events.push(...bonusResult.events);
      
      // Find players with stock in this defunct chain
      const playersWithStock = players.filter((p) => {
        const shares = p.stocks?.[nextDefunct.name] ?? 0;
        return shares > 0;
      });

      if (playersWithStock.length > 0) {
        // Set up disposal for this chain
        const disposalOrder = getPlayersInOrder(
          currentPhase.queue.mergerMakerId,
          playersWithStock,
          turnOrder
        );

        const queue: DisposalQueue = {
          defunctChainId: nextDefunct.id,
          defunctChainName: nextDefunct.name,
          defunctChainSize: nextDefunctInfo.size,
          survivingChainId: currentPhase.queue.survivingChainId,
          survivingChainName: currentPhase.queue.survivingChainName,
          playerOrder: disposalOrder,
          mergerMakerId: currentPhase.queue.mergerMakerId,
        };

        // Remaining defunct chains after this one
        const remainingDefunctChains = [...smallerChains];

        return {
          type: "disposalLoop",
          queue,
          currentIndex: 0,
          defunctChains: remainingDefunctChains,
        };
      } else {
        // No players have stock in this chain, recursively check next chain
        const nextPhaseCheck: GamePhase = {
          type: "disposalLoop",
          queue: currentPhase.queue,
          currentIndex: 0,
          defunctChains: smallerChains,
        };
        return processNextDefunctChain(nextPhaseCheck, gameState, chains, events);
      }
    }
  }
  
  // No more defunct chains to process, offer stock buying to merger maker
  const mergerMaker = players.find((p) => p.id === currentPhase.queue.mergerMakerId);
  if (mergerMaker) {
    const buyAction = buildBuyPendingAction(
      currentPhase.queue.mergerMakerId,
      mergerMaker.cash ?? 0,
      chains,
    );
    if (buyAction) {
      return buyAction;
    }
  }
  
  return null;
}

export function handleStockDisposal(
  gameState: GameStateRecord,
  playerId: string,
  actions: Array<{ action: string; shares: number }>,
  currentPhase: GamePhase | null,
): HandlerResult {
  if (currentPhase?.type !== "disposalLoop") {
    throw new Error("No stock disposal pending.");
  }
  if (currentPhase.queue.playerOrder[currentPhase.currentIndex] !== playerId) {
    throw new Error("Not your turn to dispose stock.");
  }

  const players = gameState.players ?? [];
  const chains = gameState.chains as ChainRecord[];
  const player = players.find((p) => p.id === playerId) as PlayerStateRecord | undefined;

  if (!player) {
    throw new Error("Player not found.");
  }

  const survivingChain = chains.find((c) => c.id === currentPhase.queue.survivingChainId);
  if (!survivingChain) {
    throw new Error("Surviving chain not found.");
  }

  const defunctChain = chains.find((c) => c.id === currentPhase.queue.defunctChainId);
  if (!defunctChain) {
    throw new Error("Defunct chain not found.");
  }

  const playerShares = player.stocks?.[currentPhase.queue.defunctChainName] ?? 0;

  // Validate disposal actions
  let totalDisposed = 0;
  let totalTradeShares = 0;
  for (const actionItem of actions) {
    const action = actionItem.action as string;
    const shares = Number(actionItem.shares ?? 0);

    if (shares < 0) {
      throw new Error("Shares must be non-negative.");
    }

    if (action === "trade") {
      if (shares % 2 !== 0) {
        throw new Error("Trade shares must be a multiple of 2.");
      }
      totalTradeShares += shares;
    }

    totalDisposed += shares;
  }

  if (totalDisposed !== playerShares) {
    throw new Error(`Total disposed shares (${totalDisposed}) must equal player shares (${playerShares}).`);
  }

  const totalTradeReceiving = totalTradeShares / 2;
  if (totalTradeReceiving > 0 && (survivingChain.stockRemaining ?? 0) < totalTradeReceiving) {
    throw new Error("Not enough stock available in surviving chain for trade.");
  }

  // Process all actions
  player.stocks = player.stocks ?? {};
  let remainingShares = playerShares;
  const disposalActions: DisposalAction[] = [];
  
  // Track total shares being returned to the bank (sold + traded)
  let totalSharesReturnedToBank = 0;

  for (const actionItem of actions) {
    const action = actionItem.action as string;
    const shares = Number(actionItem.shares ?? 0);

    if (action === "sell") {
      const price = calculateStockPrice(currentPhase.queue.defunctChainSize, currentPhase.queue.defunctChainName);
      const total = price * shares;
      player.cash = (player.cash ?? 0) + total;
      remainingShares -= shares;
      totalSharesReturnedToBank += shares; // Sold shares return to the bank
      disposalActions.push({ action: "sell", shares });
    } else if (action === "trade") {
      const receiving = shares / 2;
      player.stocks[currentPhase.queue.survivingChainName] = (player.stocks[currentPhase.queue.survivingChainName] ?? 0) + receiving;
      survivingChain.stockRemaining = (survivingChain.stockRemaining ?? 0) - receiving;
      remainingShares -= shares;
      totalSharesReturnedToBank += shares; // Traded shares return to the bank
      disposalActions.push({ action: "trade", shares });
    } else if (action === "hold") {
      disposalActions.push({ action: "hold", shares });
      // Held shares stay with the player and do NOT return to the bank
    }
  }

  player.stocks[currentPhase.queue.defunctChainName] = remainingShares;
  
  // Return disposed shares (sold or traded) to the bank by increasing defunct chain's stockRemaining
  // Held shares remain with the player and do not affect the bank's available shares
  if (totalSharesReturnedToBank > 0) {
    defunctChain.stockRemaining = (defunctChain.stockRemaining ?? 0) + totalSharesReturnedToBank;
  }

  // Generate description
  const actionDescriptions: string[] = [];
  disposalActions.forEach((a) => {
    if (a.action === "hold") {
      actionDescriptions.push(`held ${a.shares} ${currentPhase.queue.defunctChainName}`);
    } else if (a.action === "sell") {
      const price = calculateStockPrice(currentPhase.queue.defunctChainSize, currentPhase.queue.defunctChainName);
      actionDescriptions.push(`sold ${a.shares} ${currentPhase.queue.defunctChainName} for $${(price * a.shares) / 1000}K`);
    } else if (a.action === "trade") {
      actionDescriptions.push(`traded ${a.shares} ${currentPhase.queue.defunctChainName} for ${a.shares / 2} ${currentPhase.queue.survivingChainName}`);
    }
  });

  const events: GameEvent[] = [
    {
      type: "StockDisposed",
      playerId,
      defunctChainName: currentPhase.queue.defunctChainName,
      actions: disposalActions,
      description: `Player ${actionDescriptions.join(", ")}`,
    },
  ];

  // Advance to next player in disposal order
  const nextIndex = currentPhase.currentIndex + 1;
  let nextPhase: GamePhase | null = null;

  if (nextIndex < currentPhase.queue.playerOrder.length) {
    const nextPlayerId = currentPhase.queue.playerOrder[nextIndex];
    const nextPlayer = players.find((p) => p.id === nextPlayerId);
    const nextPlayerShares = nextPlayer?.stocks?.[currentPhase.queue.defunctChainName] ?? 0;

    if (nextPlayerShares > 0) {
      nextPhase = {
        ...currentPhase,
        currentIndex: nextIndex,
      };
    } else {
      // Skip players with no shares
      let foundNext = false;
      for (let i = nextIndex; i < currentPhase.queue.playerOrder.length; i++) {
        const checkPlayerId = currentPhase.queue.playerOrder[i];
        const checkPlayer = players.find((p) => p.id === checkPlayerId);
        const checkShares = checkPlayer?.stocks?.[currentPhase.queue.defunctChainName] ?? 0;
        if (checkShares > 0) {
          nextPhase = {
            ...currentPhase,
            currentIndex: i,
          };
          foundNext = true;
          break;
        }
      }
      if (!foundNext) {
        // All players in current disposal queue have disposed, check for more defunct chains
        nextPhase = processNextDefunctChain(currentPhase, gameState, chains, events);
      }
    }
  } else {
    // All players in current disposal queue have disposed, check for more defunct chains
    nextPhase = processNextDefunctChain(currentPhase, gameState, chains, events);
  }

  return {
    updatedState: gameState,
    events,
    nextPhase,
    moveDescription: events[0].description,
  };
}


import { GamePhase, ChainOption } from "../phases.ts";
import { HandlerResult, GameEvent } from "../events.ts";
import { GameStateRecord, PlayerStateRecord } from "../gameState.ts";
import { ChainRecord } from "../boardUtils.ts";
import { calculateStockPrice } from "../gameLogic.ts";
import { dealTilesToPlayer } from "../gameState.ts";

export function buildBuyPendingAction(
  playerId: string,
  playerCash: number,
  chains: ChainRecord[],
  maxShares = 3,
): GamePhase | null {
  const purchasable = chains.filter((chain) => {
    const size = (chain.tiles ?? []).length;
    return size > 0 && playerCash >= calculateStockPrice(size, chain.name) && (chain.stockRemaining ?? 0) > 0;
  });
  if (!purchasable.length) return null;
  return {
    type: "stockBuy",
    playerId,
    remaining: maxShares,
    options: purchasable.map((chain) => ({
      id: chain.id,
      name: chain.name,
    })),
  };
}

export function handleStockPurchase(
  gameState: GameStateRecord,
  playerId: string,
  chainName: string,
  shares: number,
  currentPhase: GamePhase | null,
): HandlerResult {
  if (currentPhase?.type !== "stockBuy") {
    throw new Error("No stock purchase pending.");
  }
  if (currentPhase.playerId !== playerId) {
    throw new Error("Only the active player may purchase stock.");
  }

  const chains = gameState.chains as ChainRecord[];
  const players = gameState.players ?? [];
  const player = players.find((p) => p.id === playerId) as PlayerStateRecord | undefined;

  if (!player) {
    throw new Error("Player not found.");
  }

  const targetChain = chains.find((c) => c.name === chainName);
  if (!targetChain) {
    throw new Error("Unknown chain.");
  }

  const chainSize = (targetChain.tiles ?? []).length;
  if (chainSize === 0) {
    throw new Error("Chain is not on the board.");
  }

  const price = calculateStockPrice(chainSize, chainName);
  const totalCost = price * shares;

  if (totalCost > (player.cash ?? 0)) {
    throw new Error("Insufficient funds.");
  }

  if (shares > currentPhase.remaining) {
    throw new Error(`Cannot buy more than ${currentPhase.remaining} shares.`);
  }

  if ((targetChain.stockRemaining ?? 0) < shares) {
    throw new Error(`Not enough stock available. Only ${targetChain.stockRemaining ?? 0} shares remaining.`);
  }

  // Process purchase
  player.cash = (player.cash ?? 0) - totalCost;
  player.stocks = player.stocks ?? {};
  player.stocks[chainName] = (player.stocks[chainName] ?? 0) + shares;
  targetChain.stockRemaining = (targetChain.stockRemaining ?? 25) - shares;

  const events: GameEvent[] = [
    {
      type: "StockPurchased",
      playerId,
      chainName,
      shares,
      description: `Player bought ${shares} ${chainName} stock`,
    },
  ];

  // Determine next phase
  const remaining = currentPhase.remaining - shares;
  let nextPhase: GamePhase | null = null;

  if (remaining > 0) {
    // Can buy more stock
    const buyAction = buildBuyPendingAction(playerId, player.cash ?? 0, chains, remaining);
    if (buyAction) {
      nextPhase = buyAction;
    }
  } else {
    // Done buying, draw tile
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

  return {
    updatedState: gameState,
    events,
    nextPhase,
    moveDescription: events.map((e) => e.description).join("; "),
  };
}



import { GamePhase } from "../phases.ts";
import { HandlerResult, GameEvent } from "../events.ts";
import { GameStateRecord, PlayerStateRecord } from "../gameState.ts";
import { ChainRecord, assignTilesToChain } from "../boardUtils.ts";
import { dealTilesToPlayer } from "../gameState.ts";
import { buildBuyPendingAction } from "./stockPurchase.ts";

export function handleChainFounding(
  gameState: GameStateRecord,
  playerId: string,
  chainId: string,
  currentPhase: GamePhase | null,
): HandlerResult {
  if (currentPhase?.type !== "foundChain") {
    throw new Error("No pending chain formation.");
  }
  if (currentPhase.playerId !== playerId) {
    throw new Error("Only the active player may resolve this.");
  }

  const board = gameState.board!;
  const chains = gameState.chains as ChainRecord[];
  const players = gameState.players ?? [];
  const player = players.find((p) => p.id === playerId) as PlayerStateRecord | undefined;

  if (!player) {
    throw new Error("Player not found");
  }

  const choice = currentPhase.options.find((opt) => opt.id === chainId);
  if (!choice) {
    throw new Error("Invalid chain selection.");
  }

  // Assign tiles to chain
  assignTilesToChain(choice.id, currentPhase.tiles, board.tiles, chains);

  // Award 1 free founder's stock
  const targetChain = chains.find((chain) => chain.id === choice.id);
  if (targetChain) {
    player.stocks = player.stocks ?? {};
    player.stocks[targetChain.name] = (player.stocks[targetChain.name] ?? 0) + 1;
    targetChain.stockRemaining = (targetChain.stockRemaining ?? 25) - 1;

    // Set founder
    targetChain.founderId = playerId;
  }

  const events: GameEvent[] = [
    {
      type: "ChainStarted",
      playerId,
      chainId: choice.id,
      chainName: choice.name,
      tiles: currentPhase.tiles,
      description: `Player started ${choice.name} chain`,
    },
  ];

  // Draw tile
  const drawn = dealTilesToPlayer(gameState, playerId, 1);
  if (drawn.length > 0) {
    events.push({
      type: "TilesDrawn",
      playerId,
      count: drawn.length,
      description: `Player drew ${drawn.length} tile(s)`,
    });
  }

  // Offer stock buying after chain formation
  let nextPhase: GamePhase | null = null;
  const buyAction = buildBuyPendingAction(
    playerId,
    player.cash ?? 0,
    chains,
  );
  if (buyAction) {
    nextPhase = buyAction;
  }

  return {
    updatedState: gameState,
    events,
    nextPhase,
    moveDescription: events.map((e) => e.description).join("; "),
  };
}

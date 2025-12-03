import { GamePhase } from "../phases.ts";
import { HandlerResult, GameEvent } from "../events.ts";
import { GameStateRecord } from "../gameState.ts";
import { advanceTurn, getCurrentPlayerId } from "../turns.ts";
import { dealTilesToPlayer } from "../gameState.ts";

export function handleTurnAdvancement(
  gameState: GameStateRecord,
): HandlerResult {
  const currentPlayerId = getCurrentPlayerId(gameState);
  const updatedState = advanceTurn(gameState);
  const nextPlayerId = getCurrentPlayerId(updatedState);

  const events: GameEvent[] = [
    {
      type: "TurnAdvanced",
      fromPlayerId: currentPlayerId ?? "",
      toPlayerId: nextPlayerId ?? "",
      description: `Turn advanced to next player`,
    },
  ];

  // Draw tile for new player
  if (nextPlayerId) {
    const drawn = dealTilesToPlayer(updatedState, nextPlayerId, 1);
    if (drawn.length > 0) {
      events.push({
        type: "TilesDrawn",
        playerId: nextPlayerId,
        count: drawn.length,
        description: `Player drew ${drawn.length} tile(s)`,
      });
    }
  }

  const nextPhase: GamePhase | null = nextPlayerId
    ? { type: "tilePlacement", playerId: nextPlayerId }
    : null;

  return {
    updatedState,
    events,
    nextPhase,
    moveDescription: events.map((e) => e.description).join("; "),
  };
}


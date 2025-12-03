import { GamePhase } from "./phases.ts";

// Legacy PendingAction type (for migration)
type LegacyPendingAction =
  | {
      type: "start-chain";
      playerId: string;
      tiles: string[];
      options: { id: string; name: string }[];
    }
  | {
      type: "resolve-merger";
      playerId: string;
      tile: string;
      options: { id: string; name: string }[];
    }
  | {
      type: "buy-stock";
      playerId: string;
      remaining: number;
      options: { id: string; name: string }[];
    }
  | {
      type: "dispose-stock";
      playerId: string;
      defunctChainId: string;
      defunctChainName: string;
      defunctChainSize: number;
      survivingChainId: string;
      survivingChainName: string;
      playerShares: number;
      playerOrder: string[];
      currentIndex: number;
      remainingDefunctChains?: Array<{ id: string; name: string; size: number }>;
      mergerMakerId: string;
    }
  | null;

/**
 * Migrates legacy pendingAction to new phase format
 */
export function migratePendingActionToPhase(
  pendingAction: LegacyPendingAction | any,
): GamePhase | null {
  if (!pendingAction) return null;

  switch (pendingAction.type) {
    case "start-chain":
      return {
        type: "foundChain",
        playerId: pendingAction.playerId,
        tiles: pendingAction.tiles,
        options: pendingAction.options,
      };
    case "resolve-merger":
      return {
        type: "mergerChoice",
        playerId: pendingAction.playerId,
        tile: pendingAction.tile,
        options: pendingAction.options,
      };
    case "buy-stock":
      return {
        type: "stockBuy",
        playerId: pendingAction.playerId,
        remaining: pendingAction.remaining,
        options: pendingAction.options,
      };
    case "dispose-stock":
      return {
        type: "disposalLoop",
        queue: {
          defunctChainId: pendingAction.defunctChainId,
          defunctChainName: pendingAction.defunctChainName,
          defunctChainSize: pendingAction.defunctChainSize,
          survivingChainId: pendingAction.survivingChainId,
          survivingChainName: pendingAction.survivingChainName,
          playerOrder: pendingAction.playerOrder,
          mergerMakerId: pendingAction.mergerMakerId,
        },
        currentIndex: pendingAction.currentIndex,
        defunctChains: pendingAction.remainingDefunctChains || [],
      };
    default:
      return null;
  }
}


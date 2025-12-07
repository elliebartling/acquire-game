import { GamePhase } from "./phases.ts";

export type BonusPayout = {
  playerId: string;
  amount: number;
  type: "majority" | "minority";
};

export type DisposalAction = {
  action: "hold" | "sell" | "trade";
  shares: number;
};

export type GameEvent =
  | {
      type: "TilePlayed";
      playerId: string;
      tile: string;
      description: string;
    }
  | {
      type: "ChainStarted";
      playerId: string;
      chainId: string;
      chainName: string;
      tiles: string[];
      description: string;
    }
  | {
      type: "MergerResolved";
      playerId: string;
      survivorId: string;
      defunctChainIds: string[];
      description: string;
    }
  | {
      type: "BonusesPaid";
      defunctChainId: string;
      defunctChainName: string;
      defunctChainSize: number;
      payouts: BonusPayout[];
      description: string;
    }
  | {
      type: "StockDisposed";
      playerId: string;
      defunctChainName: string;
      actions: DisposalAction[];
      description: string;
    }
  | {
      type: "StockPurchased";
      playerId: string;
      chainName: string;
      shares: number;
      description: string;
    }
  | {
      type: "TurnAdvanced";
      fromPlayerId: string;
      toPlayerId: string;
      description: string;
    }
  | {
      type: "TilesDrawn";
      playerId: string;
      count: number;
      description: string;
    }
  | {
      type: "DefunctChainSelected";
      playerId: string;
      chainId: string;
      chainName: string;
      description: string;
    }
  | {
      type: "TurnStarted";
      playerId: string;
      description: string;
    };

export type HandlerResult = {
  updatedState: any; // GameStateRecord
  events: GameEvent[];
  nextPhase: GamePhase | null;
  moveDescription: string;
};

// Helper function to generate descriptions from events
export function formatMoveDescription(
  event: GameEvent,
  playerUsername?: string,
): string {
  // Events already have descriptions, but this can be used for fallback
  return event.description;
}

export type ChainOption = {
  id: string;
  name: string;
};

export type DisposalQueue = {
  defunctChainId: string;
  defunctChainName: string;
  defunctChainSize: number;
  survivingChainId: string;
  survivingChainName: string;
  playerOrder: string[];
  mergerMakerId: string;
};

export type DefunctChain = {
  id: string;
  name: string;
  size: number;
};

export type GamePhase =
  | { type: "tilePlacement"; playerId: string }
  | {
      type: "foundChain";
      playerId: string;
      tiles: string[];
      options: ChainOption[];
    }
  | {
      type: "mergerChoice";
      playerId: string;
      tile: string;
      options: ChainOption[];
    }
  | {
      type: "bonusPayout";
      defunctChainId: string;
      defunctChainName: string;
      defunctChainSize: number;
    }
  | {
      type: "disposalLoop";
      queue: DisposalQueue;
      currentIndex: number;
      defunctChains: DefunctChain[];
    }
  | {
      type: "stockBuy";
      playerId: string;
      remaining: number;
      options: ChainOption[];
    }
  | { type: "drawTiles"; playerId: string }
  | { type: "turnEnd"; nextPlayerId: string }
  | null;

import { GamePhase } from "./phases.ts";

type BoardTiles = Record<string, unknown>;

export type BoardConfig = {
  width?: number;
  height?: number;
  handSize?: number;
  tileSet?: string[];
  startingCash?: number;
};

export type PlayerStateRecord = {
  id: string;
  username?: string;
  cash?: number;
  netWorth?: number;
  stocks?: Record<string, number>;
  hand?: string[];
  loans?: number;
  metadata?: Record<string, unknown>;
};

export type GameStateRecord = {
  board?: {
    width?: number;
    height?: number;
    tiles?: BoardTiles;
  };
  config?: BoardConfig;
  players?: PlayerStateRecord[];
  tileBag?: string[];
  phase?: GamePhase;
  [key: string]: unknown;
};

const DEFAULT_WIDTH = 12;
const DEFAULT_HEIGHT = 9;
const DEFAULT_HAND_SIZE = 6;
const DEFAULT_STARTING_CASH = 6000;

type EnsureResult = { changed: boolean };

function mergeConfig(
  gameState: GameStateRecord | null,
  boardConfig?: BoardConfig | null,
): Required<BoardConfig> {
  const merged = {
    ...(boardConfig ?? {}),
    ...(gameState?.config ?? {}),
  };
  return {
    width: merged.width ?? DEFAULT_WIDTH,
    height: merged.height ?? DEFAULT_HEIGHT,
    handSize: merged.handSize ?? DEFAULT_HAND_SIZE,
    tileSet: Array.isArray(merged.tileSet) ? merged.tileSet : [],
    startingCash: merged.startingCash ?? DEFAULT_STARTING_CASH,
  };
}

function ensureBoardShape(
  gameState: GameStateRecord,
  config: Required<BoardConfig>,
): EnsureResult {
  if (!gameState.board) {
    gameState.board = {
      width: config.width,
      height: config.height,
      tiles: {},
    };
    return { changed: true };
  }
  let changed = false;
  if (!gameState.board.width) {
    gameState.board.width = config.width;
    changed = true;
  }
  if (!gameState.board.height) {
    gameState.board.height = config.height;
    changed = true;
  }
  if (!gameState.board.tiles) {
    gameState.board.tiles = {};
    changed = true;
  }
  return { changed };
}

function buildFullTileSet(config: Required<BoardConfig>) {
  if (config.tileSet.length) {
    return [...config.tileSet];
  }
  const tiles: string[] = [];
  for (let row = 0; row < config.height; row += 1) {
    const letter = String.fromCharCode("A".charCodeAt(0) + row);
    for (let col = 1; col <= config.width; col += 1) {
      tiles.push(`${col}-${letter}`);
    }
  }
  return tiles;
}

function shuffleInPlace<T>(input: T[]) {
  for (let i = input.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [input[i], input[j]] = [input[j], input[i]];
  }
  return input;
}

function collectUsedTiles(gameState: GameStateRecord) {
  const used = new Set<string>();
  const tileEntries = Object.keys(gameState.board?.tiles ?? {});
  tileEntries.forEach((tile) => used.add(tile));
  (gameState.players ?? []).forEach((player) => {
    (player?.hand ?? []).forEach((tile) => used.add(tile));
  });
  return used;
}

function ensureTileBagInternal(
  gameState: GameStateRecord,
  config: Required<BoardConfig>,
): EnsureResult {
  const usedTiles = collectUsedTiles(gameState);
  const existing = Array.isArray(gameState.tileBag) ? gameState.tileBag : [];
  if (existing.length) {
    const filtered = existing.filter((tile) => !usedTiles.has(tile));
    if (filtered.length !== existing.length) {
      gameState.tileBag = filtered;
      return { changed: true };
    }
    return { changed: false };
  }
  const freshBag = buildFullTileSet(config).filter((tile) => !usedTiles.has(tile));
  shuffleInPlace(freshBag);
  gameState.tileBag = freshBag;
  return { changed: true };
}

function ensurePlayerRecords(
  gameState: GameStateRecord,
  playerIds: string[],
  config: Required<BoardConfig>,
  usernameMap?: Map<string, string>,
): EnsureResult {
  if (!Array.isArray(gameState.players)) {
    gameState.players = [];
  }
  const ids = Array.from(
    new Set(playerIds.filter((id): id is string => typeof id === "string" && id.length)),
  );
  if (!ids.length) {
    return { changed: false };
  }
  const startingCash = config.startingCash ?? DEFAULT_STARTING_CASH;
  const existingById = new Map(
    (gameState.players ?? [])
      .filter((player): player is PlayerStateRecord => Boolean(player?.id))
      .map((player) => [player.id, player]),
  );
  let changed = false;
  const normalized: PlayerStateRecord[] = ids.map((id) => {
    let player = existingById.get(id);
    const username = usernameMap?.get(id) ?? "";
    if (!player) {
      player = {
        id,
        username,
        cash: startingCash,
        netWorth: startingCash,
        stocks: {},
        hand: [],
        loans: 0,
        metadata: {},
      };
      changed = true;
    } else {
      if (!Array.isArray(player.hand)) {
        player.hand = [];
        changed = true;
      }
      if (typeof player.cash !== "number") {
        player.cash = startingCash;
        changed = true;
      }
      if (typeof player.netWorth !== "number") {
        player.netWorth = startingCash;
        changed = true;
      }
      if (!player.stocks) {
        player.stocks = {};
        changed = true;
      }
      if (typeof player.loans !== "number") {
        player.loans = 0;
        changed = true;
      }
      if (!player.metadata) {
        player.metadata = {};
        changed = true;
      }
      // Update username if it's missing and we have one
      if (!player.username && username) {
        player.username = username;
        changed = true;
      }
    }
    return player;
  });
  if (
    normalized.length !== gameState.players.length ||
    normalized.some((player, index) => player !== gameState.players![index])
  ) {
    gameState.players = normalized;
    changed = true;
  }
  return { changed };
}

function topUpHandsInternal(
  gameState: GameStateRecord,
  config: Required<BoardConfig>,
): EnsureResult {
  const bag = Array.isArray(gameState.tileBag) ? gameState.tileBag : [];
  if (!Array.isArray(gameState.players) || !gameState.players.length) {
    return { changed: false };
  }
  let changed = false;
  const handSize = config.handSize ?? DEFAULT_HAND_SIZE;
  gameState.players.forEach((player) => {
    if (!player) return;
    if (!Array.isArray(player.hand)) {
      player.hand = [];
    }
    while (player.hand.length < handSize && bag.length) {
      const tile = bag.pop();
      if (!tile) break;
      player.hand.push(tile);
      changed = true;
    }
  });
  return { changed };
}

export function ensureHandsAndBag(
  gameState: GameStateRecord | null,
  boardConfig?: BoardConfig | null,
  playerIds: string[] = [],
  usernameMap?: Map<string, string>,
): EnsureResult {
  if (!gameState) return { changed: false };
  const resolvedConfig = mergeConfig(gameState, boardConfig);
  const boardResult = ensureBoardShape(gameState, resolvedConfig);
  const playerResult = ensurePlayerRecords(gameState, playerIds, resolvedConfig, usernameMap);
  const bagResult = ensureTileBagInternal(gameState, resolvedConfig);
  const handResult = topUpHandsInternal(gameState, resolvedConfig);
  return {
    changed: boardResult.changed ||
      playerResult.changed ||
      bagResult.changed ||
      handResult.changed,
  };
}

export function playerHasTile(
  gameState: GameStateRecord | null,
  playerId: string,
  tile: string,
) {
  if (!gameState || !Array.isArray(gameState.players)) return false;
  const player = gameState.players.find((p) => p?.id === playerId);
  if (!player || !Array.isArray(player.hand)) return false;
  return player.hand.includes(tile);
}

export function consumeTileFromHand(
  gameState: GameStateRecord | null,
  playerId: string,
  tile: string,
) {
  if (!gameState || !Array.isArray(gameState.players)) return false;
  const player = gameState.players.find((p) => p?.id === playerId);
  if (!player || !Array.isArray(player.hand)) return false;
  const index = player.hand.indexOf(tile);
  if (index === -1) return false;
  player.hand.splice(index, 1);
  return true;
}

export function dealTilesToPlayer(
  gameState: GameStateRecord | null,
  playerId: string,
  count = 1,
) {
  if (!gameState || !Array.isArray(gameState.players)) return [];
  const player = gameState.players.find((p) => p?.id === playerId);
  if (!player) return [];
  if (!Array.isArray(player.hand)) {
    player.hand = [];
  }
  
  // Get hand size limit from config
  const handSize = gameState.config?.handSize ?? DEFAULT_HAND_SIZE;
  
  // Calculate how many tiles we can actually add without exceeding hand size
  const currentHandSize = player.hand.length;
  const maxToAdd = Math.max(0, handSize - currentHandSize);
  const tilesToAdd = Math.min(count, maxToAdd);
  
  if (tilesToAdd === 0) {
    return []; // Hand is already full
  }
  
  const bag = Array.isArray(gameState.tileBag) ? gameState.tileBag : [];
  const drawn: string[] = [];
  while (drawn.length < tilesToAdd && bag.length) {
    const tile = bag.pop();
    if (!tile) break;
    player.hand.push(tile);
    drawn.push(tile);
  }
  return drawn;
}

function deepClone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

export function sanitizeGameState(
  gameState: GameStateRecord | null,
  playerId: string | null,
) {
  if (!gameState) return null;
  const clone = deepClone(gameState);
  if ("tileBag" in clone) {
    delete clone.tileBag;
  }
  if (Array.isArray(clone.players)) {
    clone.players = clone.players.map((player) => {
      if (!player) return player;
      if (playerId && player.id === playerId) {
        return player;
      }
      return {
        ...player,
        hand: [],
      };
    });
  }
  return clone;
}


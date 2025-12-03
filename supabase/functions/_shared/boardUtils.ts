export type TileRecord = { player: string; chainId?: string | null };

export type ChainRecord = {
  id: string;
  name: string;
  tiles?: string[];
  founderId?: string | null;
  safeThreshold?: number;
  stockRemaining?: number;
};

export function parseKey(key: string) {
  const [column, rowLetter] = key.split("-");
  return {
    column: Number(column),
    row: rowLetter.charCodeAt(0) - "A".charCodeAt(0),
  };
}

export function toKey(column: number, rowIndex: number) {
  const letter = String.fromCharCode("A".charCodeAt(0) + rowIndex);
  return `${column}-${letter}`;
}

export function getAdjacentKeys(
  key: string,
  width: number,
  height: number,
) {
  const { column, row } = parseKey(key);
  const deltas = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  const neighbors: string[] = [];
  deltas.forEach(([dx, dy]) => {
    const newCol = column + dx;
    const newRow = row + dy;
    if (newCol < 1 || newCol > width) return;
    if (newRow < 0 || newRow >= height) return;
    neighbors.push(toKey(newCol, newRow));
  });
  return neighbors;
}

export function ensureBoard(
  board: { width: number; height: number; tiles?: Record<string, TileRecord> } | undefined,
  config: { width: number; height: number },
) {
  return {
    width: board?.width ?? config.width,
    height: board?.height ?? config.height,
    tiles: { ...(board?.tiles ?? {}) } as Record<string, TileRecord>,
  };
}

export function ensureChains(chains: ChainRecord[] | undefined, chainNames: string[] = []) {
  if (chains && Array.isArray(chains)) {
    return chains.map((chain) => ({
      ...chain,
      tiles: [...(chain.tiles ?? [])],
      stockRemaining: chain.stockRemaining ?? 25,
    }));
  }
  return chainNames.map((name, index) => ({
    id: `chain-${index}`,
    name,
    tiles: [],
    stockRemaining: 25,
  }));
}

export function getTileChainId(
  key: string,
  boardTiles: Record<string, TileRecord>,
  chains: ChainRecord[],
) {
  const tile = boardTiles[key];
  if (tile?.chainId) {
    return tile.chainId;
  }
  const match = chains.find((chain) => (chain.tiles ?? []).includes(key));
  return match?.id ?? null;
}

export function collectUnassignedCluster(
  startKey: string,
  board: { width: number; height: number; tiles: Record<string, TileRecord> },
  chains: ChainRecord[],
) {
  const pending: string[] = [startKey];
  const visited = new Set<string>();
  const cluster: string[] = [];
  while (pending.length) {
    const key = pending.pop() as string;
    if (visited.has(key)) continue;
    visited.add(key);
    const chainId = getTileChainId(key, board.tiles, chains);
    if (chainId) continue;
    if (!board.tiles[key]) continue;
    cluster.push(key);
    const neighbors = getAdjacentKeys(key, board.width, board.height);
    neighbors.forEach((neighbor) => {
      const tile = board.tiles[neighbor];
      if (!tile) return;
      if (visited.has(neighbor)) return;
      const neighborChain = getTileChainId(neighbor, board.tiles, chains);
      if (!neighborChain) {
        pending.push(neighbor);
      }
    });
  }
  return cluster;
}

export function assignTilesToChain(
  chainId: string,
  tileKeys: string[],
  boardTiles: Record<string, TileRecord>,
  chains: ChainRecord[],
) {
  const chain = chains.find((c) => c.id === chainId);
  if (!chain) throw new Error("Unknown chain");
  const existingTiles = new Set(chain.tiles ?? []);
  tileKeys.forEach((tileKey) => {
    existingTiles.add(tileKey);
    if (!boardTiles[tileKey]) return;
    boardTiles[tileKey].chainId = chainId;
  });
  chain.tiles = Array.from(existingTiles);
}

export function assignConnectedClusterToChain(
  chainId: string,
  startKey: string,
  board: { width: number; height: number; tiles: Record<string, TileRecord> },
  chains: ChainRecord[],
) {
  const cluster = collectUnassignedCluster(startKey, board, chains);
  if (!cluster.length) return;
  assignTilesToChain(chainId, cluster, board.tiles, chains);
}

export function collectNeighborChains(
  tile: string,
  board: { width: number; height: number; tiles: Record<string, TileRecord> },
  chains: ChainRecord[],
) {
  const neighbors = getAdjacentKeys(tile, board.width, board.height);
  const neighborChains = new Set<string>();
  neighbors.forEach((neighbor) => {
    const chainId = getTileChainId(neighbor, board.tiles, chains);
    if (chainId) neighborChains.add(chainId);
  });
  return neighborChains;
}

export function tileWouldMergeSafe(
  tile: string,
  board: { width: number; height: number; tiles: Record<string, TileRecord> },
  chains: ChainRecord[],
  safeThreshold: number = 11,
) {
  const neighborChains = collectNeighborChains(tile, board, chains);
  if (neighborChains.size <= 1) return false;
  const mergingChains = Array.from(neighborChains)
    .map((chainId) => chains.find((chain) => chain.id === chainId))
    .filter(Boolean) as ChainRecord[];
  return mergingChains.every((chain) => (chain.tiles?.length ?? 0) >= safeThreshold);
}

export function updatePublicChains(
  publicChains: { id: string; name: string; size?: number; isSafe?: boolean; stockRemaining?: number }[] | undefined,
  internalChains: ChainRecord[],
) {
  const fallback = internalChains.map((chain) => ({
    id: chain.id,
    name: chain.name,
    size: (chain.tiles ?? []).length,
    isSafe: false,
    stockRemaining: chain.stockRemaining ?? 25,
  }));
  if (!publicChains || publicChains.length === 0) {
    return fallback;
  }
  return publicChains.map((publicChain) => {
    const internal = internalChains.find((chain) => chain.id === publicChain.id);
    const size = internal ? (internal.tiles ?? []).length : publicChain.size ?? 0;
    const stockRemaining = internal ? (internal.stockRemaining ?? 25) : publicChain.stockRemaining ?? 25;
    return {
      ...publicChain,
      size,
      stockRemaining,
    };
  });
}

export function discardBlockedTiles(
  gameState: { players?: any[]; config?: { handSize?: number } } | null,
  board: { width: number; height: number; tiles: Record<string, TileRecord> },
  chains: ChainRecord[],
  dealTilesToPlayerFn?: (gameState: any, playerId: string, count: number) => void,
) {
  if (!gameState || !Array.isArray(gameState.players)) return;
  const handSize = gameState.config?.handSize ?? 6;
  gameState.players.forEach((player: any) => {
    if (!player || !Array.isArray(player.hand)) return;
    player.hand = player.hand.filter(
      (tile: string) => !tileWouldMergeSafe(tile, board, chains),
    );
  });
  if (dealTilesToPlayerFn) {
    gameState.players.forEach((player: any) => {
      if (!player || !player.id || !Array.isArray(player.hand)) return;
      const missing = handSize - player.hand.length;
      if (missing > 0) {
        dealTilesToPlayerFn(gameState, player.id, missing);
      }
    });
  }
}


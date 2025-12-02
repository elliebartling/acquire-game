import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  consumeTileFromHand,
  dealTilesToPlayer,
  ensureHandsAndBag,
  playerHasTile,
} from "../_shared/gameState.ts";
import {
  advanceTurn,
  ensureTurnStructure,
  getCurrentPlayerId,
} from "../_shared/turns.ts";
import { GAME_EVENTS, sendGameBroadcast } from "../_shared/broadcast.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

type TileRecord = { player: string; chainId?: string | null };
type ChainRecord = {
  id: string;
  name: string;
  tiles?: string[];
  founderId?: string | null;
  safeThreshold?: number;
  stockRemaining?: number;
};
type PlayerStateRecord = {
  id: string;
  hand?: string[];
  cash?: number;
  netWorth?: number;
  stocks?: Record<string, number>;
};
type PlayerStateRecord = {
  id: string;
  hand?: string[];
};
type PendingAction =
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

function buildMoveRecord(move: Record<string, unknown> = {}, playerId: string) {
  return {
    player: playerId,
    move_type: (move.type ?? move.move_type ?? "tile") as string,
    move_value: (move.value ?? move.move_value ?? null) as string | null,
    created_at: new Date().toISOString(),
  };
}

function parseKey(key: string) {
  const [column, rowLetter] = key.split("-");
  return {
    column: Number(column),
    row: rowLetter.charCodeAt(0) - "A".charCodeAt(0),
  };
}

function toKey(column: number, rowIndex: number) {
  const letter = String.fromCharCode("A".charCodeAt(0) + rowIndex);
  return `${column}-${letter}`;
}

function getAdjacentKeys(
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

function ensureBoard(
  board: { width: number; height: number; tiles?: Record<string, TileRecord> } | undefined,
  config: { width: number; height: number },
) {
  return {
    width: board?.width ?? config.width,
    height: board?.height ?? config.height,
    tiles: { ...(board?.tiles ?? {}) } as Record<string, TileRecord>,
  };
}

function ensureChains(chains: ChainRecord[] | undefined, chainNames: string[] = []) {
  if (chains && Array.isArray(chains)) {
    return chains.map((chain) => ({
      ...chain,
      tiles: [...(chain.tiles ?? [])],
    }));
  }
  return chainNames.map((name, index) => ({
    id: `chain-${index}`,
    name,
    tiles: [],
  }));
}

function getTileChainId(
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

function collectUnassignedCluster(
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

function assignTilesToChain(
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

function assignConnectedClusterToChain(
  chainId: string,
  startKey: string,
  board: { width: number; height: number; tiles: Record<string, TileRecord> },
  chains: ChainRecord[],
) {
  const cluster = collectUnassignedCluster(startKey, board, chains);
  if (!cluster.length) return;
  assignTilesToChain(chainId, cluster, board.tiles, chains);
}

// Hotel chain pricing tiers based on official Acquire rules
const CHAIN_TIERS: Record<string, number> = {
  // Budget tier (Tier 0) - Tower, Luxor
  'Tower': 0,
  'Luxor': 0,
  // Mid-tier (Tier 1) - American, Worldwide, Festival
  'American': 1,
  'Worldwide': 1,
  'Festival': 1,
  // Luxury tier (Tier 2) - Imperial, Continental
  'Imperial': 2,
  'Continental': 2,
  // Legacy support
  'Sackson': 0
};

// Bonus payout table for mergers based on defunct chain size and tier
const BONUS_PAYOUT_TABLE_TIERS: Record<string, Array<{ maxSize: number; majority: number; minority: number }>> = {
  'Tier 0': [ // Tower, Luxor
    { maxSize: 2, majority: 2000, minority: 1000 },
    { maxSize: 3, majority: 2000, minority: 1000 },
    { maxSize: 4, majority: 3000, minority: 1500 },
    { maxSize: 5, majority: 3000, minority: 1500 },
    { maxSize: 10, majority: 4000, minority: 2000 },
    { maxSize: 20, majority: 5000, minority: 2500 },
    { maxSize: 30, majority: 6000, minority: 3000 },
    { maxSize: 40, majority: 7000, minority: 3500 },
    { maxSize: Infinity, majority: 8000, minority: 4000 }
  ],
  'Tier 1': [ // American, Worldwide, Festival
    { maxSize: 2, majority: 3000, minority: 1500 },
    { maxSize: 3, majority: 3000, minority: 1500 },
    { maxSize: 4, majority: 4000, minority: 2000 },
    { maxSize: 5, majority: 4000, minority: 2000 },
    { maxSize: 10, majority: 5000, minority: 2500 },
    { maxSize: 20, majority: 6000, minority: 3000 },
    { maxSize: 30, majority: 7000, minority: 3500 },
    { maxSize: 40, majority: 8000, minority: 4000 },
    { maxSize: Infinity, majority: 9000, minority: 4500 }
  ],
  'Tier 2': [ // Imperial, Continental
    { maxSize: 2, majority: 5000, minority: 2500 },
    { maxSize: 3, majority: 5000, minority: 2500 },
    { maxSize: 4, majority: 6000, minority: 3000 },
    { maxSize: 5, majority: 6000, minority: 3000 },
    { maxSize: 10, majority: 7000, minority: 3500 },
    { maxSize: 20, majority: 8000, minority: 4000 },
    { maxSize: 30, majority: 9000, minority: 4500 },
    { maxSize: 40, majority: 10000, minority: 5000 },
    { maxSize: Infinity, majority: 11000, minority: 5500 }
  ]
};

function calculateMergerBonuses(chainSize: number, chainName?: string | null): { majority: number; minority: number } {
  const tier = CHAIN_TIERS[chainName ?? 'Sackson'];
  const tierKey = `Tier ${tier}` as keyof typeof BONUS_PAYOUT_TABLE_TIERS;
  const payoutTable = BONUS_PAYOUT_TABLE_TIERS[tierKey] || BONUS_PAYOUT_TABLE_TIERS['Tier 0'];

  const entry = payoutTable.find((entry) => chainSize <= entry.maxSize) ||
    payoutTable[payoutTable.length - 1];
  return {
    majority: entry.majority,
    minority: entry.minority,
  };
}

function getPlayersInOrder(
  startPlayerId: string,
  allPlayers: PlayerStateRecord[],
  turnOrder: string[]
): string[] {
  // Filter turnOrder to ensure all players exist in allPlayers
  const validPlayerIds = new Set(allPlayers.map(p => p.id));
  const filteredOrder = turnOrder.filter(id => validPlayerIds.has(id));
  
  if (filteredOrder.length === 0) {
    return allPlayers.map(p => p.id);
  }
  
  const startIndex = filteredOrder.indexOf(startPlayerId);
  if (startIndex === -1) {
    return filteredOrder.length > 0 ? filteredOrder : allPlayers.map(p => p.id);
  }
  return [...filteredOrder.slice(startIndex), ...filteredOrder.slice(0, startIndex)];
}

function payMergerBonuses(
  defunctChain: ChainRecord,
  allPlayers: PlayerStateRecord[],
  bonuses: { majority: number; minority: number }
): void {
  const shareholders: Array<{ player: PlayerStateRecord; shares: number }> = [];
  
  allPlayers.forEach((player) => {
    const shares = player.stocks?.[defunctChain.name] ?? 0;
    if (shares > 0) {
      shareholders.push({ player, shares });
    }
  });

  if (shareholders.length === 0) {
    return;
  }

  shareholders.sort((a, b) => b.shares - a.shares);

  const maxShares = shareholders[0].shares;
  const majorityHolders = shareholders.filter(s => s.shares === maxShares);
  const minorityHolders = shareholders.filter(s => s.shares < maxShares && s.shares > 0);

  // Pay majority bonus(es)
  if (majorityHolders.length === 1) {
    majorityHolders[0].player.cash = (majorityHolders[0].player.cash ?? 0) + bonuses.majority;
  } else if (majorityHolders.length > 1) {
    // Tie: combine bonuses and divide equally
    const totalBonus = bonuses.majority + bonuses.minority;
    const perPlayer = Math.floor(totalBonus / majorityHolders.length);
    majorityHolders.forEach(({ player }) => {
      player.cash = (player.cash ?? 0) + perPlayer;
    });
  }

  // Pay minority bonus(es) if there are non-majority holders
  if (minorityHolders.length > 0 && majorityHolders.length === 1) {
    const secondMaxShares = minorityHolders[0].shares;
    const secondHolders = minorityHolders.filter(s => s.shares === secondMaxShares);
    
    if (secondHolders.length === 1) {
      secondHolders[0].player.cash = (secondHolders[0].player.cash ?? 0) + bonuses.minority;
    } else {
      // Tie: divide minority bonus equally
      const perPlayer = Math.floor(bonuses.minority / secondHolders.length);
      secondHolders.forEach(({ player }) => {
        player.cash = (player.cash ?? 0) + perPlayer;
      });
    }
  }
}

// Base prices by chain size
const SIZE_PRICE_TABLE = [
  { maxSize: 2, basePrice: 200 },
  { maxSize: 3, basePrice: 300 },
  { maxSize: 4, basePrice: 400 },
  { maxSize: 5, basePrice: 500 },
  { maxSize: 10, basePrice: 600 },
  { maxSize: 20, basePrice: 700 },
  { maxSize: 30, basePrice: 800 },
  { maxSize: 40, basePrice: 900 },
  { maxSize: Infinity, basePrice: 1000 }
];

function calculateStockPrice(chainSize: number, chainName?: string | null): number {
  // Get base price from size
  const sizeEntry = SIZE_PRICE_TABLE.find((entry) => chainSize <= entry.maxSize) ||
    SIZE_PRICE_TABLE[SIZE_PRICE_TABLE.length - 1];
  const basePrice = sizeEntry.basePrice;
  
  // Add tier premium if chain name is provided
  if (chainName && CHAIN_TIERS[chainName] !== undefined) {
    const tierPremium = CHAIN_TIERS[chainName] * 100;
    return basePrice + tierPremium;
  }
  
  // Fallback to base price if no chain name
  return basePrice;
}

/**
 * Calculate the net worth of a player (cash + value of stocks)
 * Stocks for chains not on the board (size = 0) have no value
 */
function calculateNetWorth(
  player: PlayerStateRecord,
  chains: ChainRecord[]
): number {
  let netWorth = player.cash || 0;
  
  // Add value of all stocks
  if (player.stocks && chains) {
    Object.entries(player.stocks).forEach(([chainName, shares]) => {
      if (shares > 0) {
        // Find the chain to get its size
        const chain = chains.find(c => c.name === chainName);
        const chainSize = chain ? (chain.tiles?.length || 0) : 0;
        if (chain && chainSize > 0) {
          const price = calculateStockPrice(chainSize, chainName);
          netWorth += price * shares;
        }
        // If chain is not on board (size = 0), stock has no value
      }
    });
  }
  
  return netWorth;
}

function updatePublicChains(
  publicChains: { id: string; name: string; size?: number; isSafe?: boolean }[] | undefined,
  internalChains: ChainRecord[],
) {
  const fallback = internalChains.map((chain) => ({
    id: chain.id,
    name: chain.name,
    size: (chain.tiles ?? []).length,
    isSafe: false,
  }));
  if (!publicChains || publicChains.length === 0) {
    return fallback;
  }
  return publicChains.map((publicChain) => {
    const internal = internalChains.find((chain) => chain.id === publicChain.id);
    const size = internal ? (internal.tiles ?? []).length : publicChain.size ?? 0;
    return {
      ...publicChain,
      size,
    };
  });
}

function collectNeighborChains(
  tileKey: string,
  board: { width: number; height: number; tiles: Record<string, TileRecord> },
  chains: ChainRecord[],
) {
  const neighbors = getAdjacentKeys(tileKey, board.width, board.height);
  const matches = new Set<string>();
  neighbors.forEach((neighbor) => {
    const chainId = getTileChainId(neighbor, board.tiles, chains);
    if (chainId) {
      matches.add(chainId);
    }
  });
  const result: ChainRecord[] = [];
  matches.forEach((id) => {
    const chain = chains.find((chainRecord) => chainRecord.id === id);
    if (chain) result.push(chain);
  });
  return result;
}

function tileWouldMergeSafe(
  tileKey: string,
  board: { width: number; height: number; tiles: Record<string, TileRecord> },
  chains: ChainRecord[],
) {
  const neighborChains = collectNeighborChains(tileKey, board, chains);
  if (neighborChains.length <= 1) return false;
  return neighborChains.every(
    (chain) => (chain.tiles ?? []).length >= (chain.safeThreshold ?? 11),
  );
}

function discardBlockedTiles(
  gameState: { players?: PlayerStateRecord[]; config?: { handSize?: number } } | null,
  board: { width: number; height: number; tiles: Record<string, TileRecord> },
  chains: ChainRecord[],
) {
  if (!gameState || !Array.isArray(gameState.players)) return;
  const handSize = gameState.config?.handSize ?? 6;
  gameState.players.forEach((player) => {
    if (!player || !Array.isArray(player.hand)) return;
    player.hand = player.hand.filter(
      (tile) => !tileWouldMergeSafe(tile, board, chains),
    );
  });
  gameState.players.forEach((player) => {
    if (!player || !player.id || !Array.isArray(player.hand)) return;
    const missing = handSize - player.hand.length;
    if (missing > 0) {
      dealTilesToPlayer(gameState, player.id, missing);
    }
  });
}

function buildBuyPendingAction(
  playerId: string,
  playerCash: number,
  chains: ChainRecord[],
  maxShares = 3,
) {
  const purchasable = chains.filter((chain) => {
    const size = (chain.tiles ?? []).length;
    return size > 0 && playerCash >= calculateStockPrice(size, chain.name);
  });
  if (!purchasable.length) return null;
  return {
    type: "buy-stock" as const,
    playerId,
    remaining: maxShares,
    options: purchasable.map((chain) => ({
      id: chain.id,
      name: chain.name,
    })),
  };
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  try {
    const body = await req.json();
    const { game_id, move } = body;
    if (!game_id || !move) {
      return new Response(
        JSON.stringify({ error: "Missing game_id or move" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing auth token" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    const { data, error } = await adminClient
      .from("games")
      .select("players, moves, public_state, game_state, board_config")
      .eq("id", game_id)
      .single();
    if (error || !data) {
      return new Response(
        JSON.stringify({ error: "Game not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    const isParticipant = Array.isArray(data.players) &&
      (data.players as string[]).includes(userData.user.id);
    if (!isParticipant) {
      return new Response(
        JSON.stringify({ error: "Only participants can submit moves" }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }

    const existingGameState = data.game_state ?? {};
    if (!data.game_state) {
      data.game_state = existingGameState;
    }
    const boardConfig = data.board_config ??
      existingGameState.config ?? { width: 12, height: 9 };
    const playerIds = Array.isArray(data.players)
      ? (data.players as string[])
      : [];
    const playerRecords = playerIds.map((id) => ({ id }));
    ensureHandsAndBag(existingGameState, boardConfig, playerIds);
    
    // Ensure turn structure
    const turnResult = ensureTurnStructure(existingGameState, playerRecords);
    if (turnResult.updated) {
      Object.assign(existingGameState, turnResult.state);
    }
    const currentPlayerId = getCurrentPlayerId(existingGameState);

    const moveRecord = buildMoveRecord(move, userData.user.id);
    const nextMoves = [moveRecord, ...(data.moves ?? [])];

    const board = ensureBoard(existingGameState.board, boardConfig);
    const chains = ensureChains(
      existingGameState.chains,
      existingGameState.config?.chainNames ?? [],
    );
    const playerState = (existingGameState.players ?? []).find(
      (player) => player?.id === userData.user.id,
    ) as PlayerStateRecord | undefined;
    const pendingAction: PendingAction = existingGameState.pendingAction ?? null;

    if (
      pendingAction &&
      !["start-chain", "resolve-merger", "purchase", "complete-buy"].includes(
        moveRecord.move_type,
      )
    ) {
      return new Response(
        JSON.stringify({ error: "Pending action must be resolved first." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const existingPublicState = data.public_state ?? {
      board,
      moves: [],
      chains: chains.map((chain) => ({
        id: chain.id,
        name: chain.name,
        size: (chain.tiles ?? []).length,
      })),
    };

    let updatedPendingAction: PendingAction = pendingAction;

    if (moveRecord.move_type === "start-chain") {
      if (!pendingAction || pendingAction.type !== "start-chain") {
        return new Response(
          JSON.stringify({ error: "No pending chain formation." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      if (pendingAction.playerId !== userData.user.id) {
        return new Response(
          JSON.stringify({ error: "Only the active player may resolve this." }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        );
      }
      const choice = pendingAction.options.find((opt) =>
        opt.id === (move.chain_id ?? move.chainId)
      );
      if (!choice) {
        return new Response(
          JSON.stringify({ error: "Invalid chain selection." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      assignTilesToChain(
        choice.id,
        pendingAction.tiles,
        board.tiles,
        chains,
      );
      
      // Award 1 free founder's stock
      if (playerState) {
        const targetChain = chains.find((chain) => chain.id === choice.id);
        if (targetChain) {
          playerState.stocks = playerState.stocks ?? {};
          playerState.stocks[targetChain.name] = (playerState.stocks[targetChain.name] ?? 0) + 1;
          targetChain.stockRemaining = (targetChain.stockRemaining ?? 25) - 1;
          
          // Set founder
          targetChain.founderId = userData.user.id;
        }
      }
      
      updatedPendingAction = null;
      
      // Broadcast hotel selection
      await sendGameBroadcast(game_id, GAME_EVENTS.HOTEL_SELECTED, {
        playerId: userData.user.id,
        chainId: choice.id,
        chainName: choice.name,
      });
    } else if (moveRecord.move_type === "tile") {
      // Enforce turn order for tile placement
      if (currentPlayerId && currentPlayerId !== userData.user.id) {
        return new Response(
          JSON.stringify({ error: "Not your turn" }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        );
      }
      
      if (!moveRecord.move_value) {
        return new Response(
          JSON.stringify({ error: "Missing tile value." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      if (
        !playerHasTile(existingGameState, userData.user.id, moveRecord.move_value)
      ) {
        return new Response(
          JSON.stringify({ error: "Tile must be played from your hand." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      if (board.tiles[moveRecord.move_value]) {
        return new Response(
          JSON.stringify({ error: "Tile already occupied." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      consumeTileFromHand(existingGameState, userData.user.id, moveRecord.move_value);
      board.tiles[moveRecord.move_value] = {
        player: userData.user.id,
        chainId: null,
      };
      const neighborChains = new Set<string>();
      const neighbors = getAdjacentKeys(
        moveRecord.move_value,
        board.width,
        board.height,
      );
      neighbors.forEach((neighbor) => {
        const chainId = getTileChainId(neighbor, board.tiles, chains);
        if (chainId) neighborChains.add(chainId);
      });

      let shouldDraw = true;
      if (neighborChains.size > 1) {
        const mergingChains = Array.from(neighborChains)
          .map((chainId) => chains.find((chain) => chain.id === chainId))
          .filter(Boolean);
        const allSafe = mergingChains.every((chain) => {
          const threshold = chain?.safeThreshold ??
            existingGameState.config?.safeChainSize ??
            11;
          return (chain?.tiles?.length ?? 0) >= threshold;
        });
        if (allSafe) {
          delete board.tiles[moveRecord.move_value];
          return new Response(
            JSON.stringify({ error: "Tile discarded because all adjacent hotels are safe." }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }
        const maxSize = Math.max(...mergingChains.map((chain) => chain?.tiles?.length ?? 0));
        const topChains = mergingChains.filter((chain) => (chain?.tiles?.length ?? 0) === maxSize);
        if (topChains.length === 1) {
          const survivor = topChains[0];
          const mergingOthers = mergingChains.filter((chain) => chain?.id !== survivor?.id);
          assignConnectedClusterToChain(survivor?.id ?? "", moveRecord.move_value, board, chains);
          mergingOthers.forEach((chain) => {
            if (!chain) return;
            assignTilesToChain(survivor?.id ?? "", chain.tiles, board.tiles, chains);
            chain.tiles = [];
            chain.founderId = null;
          });
        } else {
          updatedPendingAction = {
            type: "resolve-merger",
            playerId: userData.user.id,
            tile: moveRecord.move_value,
            options: topChains.map((chain) => ({
              id: chain?.id ?? "",
              name: chain?.name ?? 'Unknown',
            })),
          };
          shouldDraw = false;
        }
      } else if (neighborChains.size === 1) {
        const [chainId] = Array.from(neighborChains);
        assignConnectedClusterToChain(chainId, moveRecord.move_value, board, chains);
      } else {
        const cluster = collectUnassignedCluster(
          moveRecord.move_value,
          board,
          chains,
        );
        if (cluster.length >= 2) {
          const availableChains = chains.filter((chain) =>
            (chain.tiles ?? []).length === 0
          );
          if (availableChains.length === 0) {
            updatedPendingAction = null;
          } else {
            updatedPendingAction = {
              type: "start-chain",
              playerId: userData.user.id,
              tiles: cluster,
              options: availableChains.map((chain) => ({
                id: chain.id,
                name: chain.name,
              })),
            };
          }
        }
      }
      if (shouldDraw) {
        dealTilesToPlayer(existingGameState, userData.user.id, 1);
      }
      
      // Broadcast tile played
      await sendGameBroadcast(game_id, GAME_EVENTS.TILE_PLAYED, {
        playerId: userData.user.id,
        tile: moveRecord.move_value,
      });
    } else if (moveRecord.move_type === "resolve-merger") {
      if (!pendingAction || pendingAction.type !== "resolve-merger") {
        return new Response(
          JSON.stringify({ error: "No merger to resolve." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      if (pendingAction.playerId !== userData.user.id) {
        return new Response(
          JSON.stringify({ error: "Only the active player may resolve this." }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        );
      }
      if (!move.chain_id && !move.chainId) {
        return new Response(
          JSON.stringify({ error: "Missing surviving chain." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      const survivorId = move.chain_id ?? move.chainId;
      const survivor = chains.find((chain) => chain.id === survivorId);
      if (!survivor) {
        return new Response(
          JSON.stringify({ error: "Unknown surviving chain." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      const mergeChainIds = (pendingAction.options ?? []).map((option) => option.id);
      const mergingChains = chains.filter(
        (chain) => mergeChainIds.includes(chain.id) && chain.id !== survivorId,
      );
      
      // Pay bonuses and setup disposal for largest defunct chain
      const largestDefunct = mergingChains.reduce((largest, chain) => {
        const size = chain.tiles?.length ?? 0;
        const largestSize = largest ? (largest.tiles?.length ?? 0) : 0;
        return size > largestSize ? chain : largest;
      }, mergingChains[0]);
      
      const defunctChainSize = largestDefunct.tiles?.length ?? 0;
      const bonuses = calculateMergerBonuses(defunctChainSize, largestDefunct.name);
      payMergerBonuses(largestDefunct, existingGameState.players ?? [], bonuses);
      
      assignConnectedClusterToChain(survivorId, pendingAction.tile, board, chains);
      mergingChains.forEach((chain) => {
        assignTilesToChain(survivorId, chain.tiles, board.tiles, chains);
        chain.tiles = [];
        chain.founderId = null;
      });
      
      // Setup stock disposal for players who have shares in the defunct chain
      const playersWithStock = (existingGameState.players ?? []).filter((p) => {
        const shares = p.stocks?.[largestDefunct.name] ?? 0;
        return shares > 0;
      });
      
      if (playersWithStock.length > 0) {
        const turnOrder = existingGameState.turnOrder ?? [];
        const disposalOrder = getPlayersInOrder(userData.user.id, playersWithStock, turnOrder);
        const firstPlayerId = disposalOrder[0];
        const firstPlayerShares = playersWithStock.find(p => p.id === firstPlayerId)?.stocks?.[largestDefunct.name] ?? 0;
        
        updatedPendingAction = {
          type: "dispose-stock",
          playerId: firstPlayerId,
          defunctChainId: largestDefunct.id,
          defunctChainName: largestDefunct.name,
          defunctChainSize,
          survivingChainId: survivorId,
          survivingChainName: survivor.name,
          playerShares: firstPlayerShares,
          playerOrder: disposalOrder,
          currentIndex: 0,
          mergerMakerId: userData.user.id,
        };
      } else {
        // No disposal needed, deal tile and clear pending action
        dealTilesToPlayer(existingGameState, userData.user.id, 1);
        updatedPendingAction = null;
      }
      
      // Broadcast merger resolution
      await sendGameBroadcast(game_id, GAME_EVENTS.HOTEL_SELECTED, {
        playerId: userData.user.id,
        survivorId,
        mergedChains: mergingChains.map((c) => c.id),
      });
    } else if (moveRecord.move_type === "purchase") {
      if (!pendingAction || pendingAction.type !== "buy-stock") {
        return new Response(
          JSON.stringify({ error: "No stock purchase pending." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      if (pendingAction.playerId !== userData.user.id) {
        return new Response(
          JSON.stringify({ error: "Only the owner may buy stock." }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        );
      }
      const shares = Number(move.shares ?? move.share ?? 1);
      if (!Number.isFinite(shares) || shares < 1) {
        return new Response(
          JSON.stringify({ error: "Invalid share count" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      if (shares > pendingAction.remaining) {
        return new Response(
          JSON.stringify({ error: "Cannot buy more than the remaining allowance." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      const chainIdentifier = move.chain_id ?? move.chainId ?? move.chain ?? move.name;
      const targetChain = chains.find(
        (chain) =>
          chain.id === chainIdentifier ||
          chain.name === chainIdentifier,
      );
      if (!targetChain || (targetChain.tiles ?? []).length === 0) {
        return new Response(
          JSON.stringify({ error: "Chain must exist on the board." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      if ((targetChain.stockRemaining ?? 0) < shares) {
        return new Response(
          JSON.stringify({ error: "Not enough stock remaining." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      if (!playerState) {
        return new Response(
          JSON.stringify({ error: "Player not found" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      const chainSize = (targetChain.tiles ?? []).length;
      const price = calculateStockPrice(chainSize, targetChain.name);
      const totalCost = price * shares;
      const availableCash = playerState.cash ?? 0;
      if (availableCash < totalCost) {
        return new Response(
          JSON.stringify({ error: "Insufficient funds" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      playerState.cash = availableCash - totalCost;
      playerState.stocks = playerState.stocks ?? {};
      playerState.stocks[targetChain.name] = (playerState.stocks[targetChain.name] ?? 0) + shares;
      targetChain.stockRemaining = (targetChain.stockRemaining ?? 0) - shares;
      const remaining = pendingAction.remaining - shares;
      updatedPendingAction = remaining > 0
        ? { ...pendingAction, remaining }
        : null;
    } else if (moveRecord.move_type === "complete-buy") {
      if (!pendingAction || pendingAction.type !== "buy-stock") {
        return new Response(
          JSON.stringify({ error: "No stock purchase pending." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      if (pendingAction.playerId !== userData.user.id) {
        return new Response(
          JSON.stringify({ error: "Only the owner may end the purchase step." }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        );
      }
      updatedPendingAction = null;
    } else if (moveRecord.move_type === "dispose-stock") {
      if (!pendingAction || pendingAction.type !== "dispose-stock") {
        return new Response(
          JSON.stringify({ error: "No stock disposal pending." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      if (pendingAction.playerId !== userData.user.id) {
        return new Response(
          JSON.stringify({ error: "Not your turn to dispose stock." }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        );
      }
      
      const actions = Array.isArray(move.actions) ? move.actions : [];
      
      if (actions.length === 0) {
        return new Response(
          JSON.stringify({ error: "No disposal actions provided." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      
      const currentPlayer = (existingGameState.players ?? []).find(p => p.id === userData.user.id);
      if (!currentPlayer) {
        return new Response(
          JSON.stringify({ error: "Player not found." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      
      const survivingChain = chains.find(c => c.id === pendingAction.survivingChainId);
      if (!survivingChain) {
        return new Response(
          JSON.stringify({ error: "Surviving chain not found." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      
      const playerShares = pendingAction.playerShares;
      
      // Validate disposal actions
      let totalDisposed = 0;
      let totalTradeShares = 0;
      for (const actionItem of actions) {
        const action = actionItem.action as string;
        const shares = Number(actionItem.shares ?? 0);
        
        if (shares < 0) {
          return new Response(
            JSON.stringify({ error: "Shares must be non-negative." }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }
        
        if (action === "trade") {
          if (shares % 2 !== 0) {
            return new Response(
              JSON.stringify({ error: "Trade shares must be a multiple of 2." }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }
          totalTradeShares += shares;
        }
        
        totalDisposed += shares;
      }
      
      if (totalDisposed !== playerShares) {
        return new Response(
          JSON.stringify({ error: `Total disposed shares (${totalDisposed}) must equal player shares (${playerShares}).` }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      
      const totalTradeReceiving = totalTradeShares / 2;
      if (totalTradeReceiving > 0 && (survivingChain.stockRemaining ?? 0) < totalTradeReceiving) {
        return new Response(
          JSON.stringify({ error: "Not enough stock available in surviving chain for trade." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      
      // Process all actions
      currentPlayer.stocks = currentPlayer.stocks ?? {};
      let remainingShares = playerShares;
      
      for (const actionItem of actions) {
        const action = actionItem.action as string;
        const shares = Number(actionItem.shares ?? 0);
        
        if (action === "sell") {
          const price = calculateStockPrice(pendingAction.defunctChainSize, pendingAction.defunctChainName);
          const total = price * shares;
          currentPlayer.cash = (currentPlayer.cash ?? 0) + total;
          remainingShares -= shares;
        } else if (action === "trade") {
          const receiving = shares / 2;
          currentPlayer.stocks[pendingAction.survivingChainName] = (currentPlayer.stocks[pendingAction.survivingChainName] ?? 0) + receiving;
          survivingChain.stockRemaining = (survivingChain.stockRemaining ?? 0) - receiving;
          remainingShares -= shares;
        }
        // hold: no action needed, shares are just kept
      }
      
      currentPlayer.stocks[pendingAction.defunctChainName] = remainingShares;
      
      // Advance to next player in disposal order
      const nextIndex = pendingAction.currentIndex + 1;
      if (nextIndex < pendingAction.playerOrder.length) {
        const nextPlayerId = pendingAction.playerOrder[nextIndex];
        const nextPlayer = (existingGameState.players ?? []).find(p => p.id === nextPlayerId);
        const nextPlayerShares = nextPlayer?.stocks?.[pendingAction.defunctChainName] ?? 0;
        
        if (nextPlayerShares > 0) {
          updatedPendingAction = {
            ...pendingAction,
            playerId: nextPlayerId,
            playerShares: nextPlayerShares,
            currentIndex: nextIndex,
          };
        } else {
          // Skip players with no shares
          let foundNext = false;
          for (let i = nextIndex; i < pendingAction.playerOrder.length; i++) {
            const checkPlayerId = pendingAction.playerOrder[i];
            const checkPlayer = (existingGameState.players ?? []).find(p => p.id === checkPlayerId);
            const checkShares = checkPlayer?.stocks?.[pendingAction.defunctChainName] ?? 0;
            if (checkShares > 0) {
              updatedPendingAction = {
                ...pendingAction,
                playerId: checkPlayerId,
                playerShares: checkShares,
                currentIndex: i,
              };
              foundNext = true;
              break;
            }
          }
          if (!foundNext) {
            // All players have disposed, offer buy-stock to merger maker
            const mergerMaker = (existingGameState.players ?? []).find(p => p.id === pendingAction.mergerMakerId);
            if (mergerMaker) {
              const buyAction = buildBuyPendingAction(
                pendingAction.mergerMakerId,
                mergerMaker.cash ?? 0,
                chains,
              );
              if (buyAction) {
                updatedPendingAction = buyAction;
              } else {
                updatedPendingAction = null;
              }
            } else {
              updatedPendingAction = null;
            }
          }
        }
      } else {
        // All players have disposed, offer buy-stock to merger maker
        const mergerMaker = (existingGameState.players ?? []).find(p => p.id === pendingAction.mergerMakerId);
        if (mergerMaker) {
          const buyAction = buildBuyPendingAction(
            pendingAction.mergerMakerId,
            mergerMaker.cash ?? 0,
            chains,
          );
          if (buyAction) {
            updatedPendingAction = buyAction;
          } else {
            updatedPendingAction = null;
          }
        } else {
          updatedPendingAction = null;
        }
      }
    }

    if (
      (moveRecord.move_type === "tile" ||
        moveRecord.move_type === "resolve-merger" ||
        moveRecord.move_type === "start-chain") &&
      !updatedPendingAction
    ) {
      const action = buildBuyPendingAction(
        userData.user.id,
        playerState?.cash ?? 0,
        chains,
      );
      if (action) {
        updatedPendingAction = action;
      }
    }

    discardBlockedTiles(existingGameState, board, chains);
    
    // Advance turn if no pending action
    let finalGameState = {
      ...existingGameState,
      board,
      chains,
      moves: nextMoves,
      pendingAction: updatedPendingAction,
    };
    
    let turnEnded = false;
    if (!updatedPendingAction && currentPlayerId === userData.user.id) {
      finalGameState = advanceTurn(finalGameState);
      turnEnded = true;
      console.log("Turn advanced from", currentPlayerId, "to", getCurrentPlayerId(finalGameState));
    }
    
    const nextGameState = finalGameState;

    const nextPublicState = {
      ...existingPublicState,
      board: {
        ...existingPublicState.board,
        tiles: board.tiles,
      },
      chains: updatePublicChains(existingPublicState.chains, chains),
      players: (nextGameState.players ?? []).map((player: any) => {
        // Recalculate net worth based on cash + stock value
        const netWorth = calculateNetWorth(player, chains);
        return {
          id: player.id,
          username: player.username ?? "",
          cash: player.cash ?? 0,
          netWorth,
          stocks: player.stocks ?? {},
          loans: player.loans ?? 0,
        };
      }),
      moves: nextMoves,
      currentPlayerId: getCurrentPlayerId(nextGameState),
      pending_action: updatedPendingAction
        ? { type: updatedPendingAction.type, playerId: updatedPendingAction.playerId }
        : null,
    };

    const { error: updateError } = await adminClient
      .from("games")
      .update({
        moves: nextMoves,
        public_state: nextPublicState,
        game_state: nextGameState,
      })
      .eq("id", game_id);

    if (updateError) {
      console.error(updateError);
      return new Response(
        JSON.stringify({ error: "Failed to persist move" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
    
    // Broadcast turn ended if applicable
    if (turnEnded) {
      await sendGameBroadcast(game_id, GAME_EVENTS.TURN_ENDED, {
        previousPlayerId: userData.user.id,
        currentPlayerId: getCurrentPlayerId(nextGameState),
      });
    }
    
    // Always broadcast state updated
    await sendGameBroadcast(game_id, GAME_EVENTS.STATE_UPDATED, {
      moveType: moveRecord.move_type,
      playerId: userData.user.id,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        move: moveRecord,
        processed_at: new Date().toISOString(),
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
});
import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  consumeTileFromHand,
  dealTilesToPlayer,
  ensureHandsAndBag,
  playerHasTile,
} from "../_shared/gameState.ts";

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
};
type PendingAction =
  | {
    type: "start-chain";
    playerId: string;
    tiles: string[];
    options: { id: string; name: string }[];
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
    const boardConfig = data.board_config ?? {};
    const playerIds = Array.isArray(data.players)
      ? (data.players as string[])
      : [];
    ensureHandsAndBag(existingGameState, boardConfig, playerIds);

    const moveRecord = buildMoveRecord(move, userData.user.id);
    const nextMoves = [moveRecord, ...(data.moves ?? [])];

    const boardConfig = data.board_config ?? { width: 12, height: 9 };
    const board = ensureBoard(existingGameState.board, boardConfig);
    const chains = ensureChains(
      existingGameState.chains,
      existingGameState.config?.chainNames ?? [],
    );
    const pendingAction: PendingAction = existingGameState.pendingAction ?? null;

    if (pendingAction && moveRecord.move_type !== "start-chain") {
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
      updatedPendingAction = null;
    } else if (moveRecord.move_type === "tile") {
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

      if (neighborChains.size > 1) {
        return new Response(
          JSON.stringify({ error: "Mergers are not implemented yet." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      if (neighborChains.size === 1) {
        const [chainId] = Array.from(neighborChains);
        assignTilesToChain(chainId, [moveRecord.move_value], board.tiles, chains);
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
      dealTilesToPlayer(existingGameState, userData.user.id, 1);
    }

    const nextGameState = {
      ...existingGameState,
      board,
      chains,
      moves: nextMoves,
      pendingAction: updatedPendingAction,
    };

    const nextPublicState = {
      ...existingPublicState,
      board: {
        ...existingPublicState.board,
        tiles: board.tiles,
      },
      chains: updatePublicChains(existingPublicState.chains, chains),
      moves: nextMoves,
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
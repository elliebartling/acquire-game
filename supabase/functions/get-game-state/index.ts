import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  ensureHandsAndBag,
  sanitizeGameState,
} from "../_shared/gameState.ts";
import {
  ensureTurnStructure,
  getCurrentPlayerId,
} from "../_shared/turns.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

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
  player: any,
  chains: any[]
): number {
  let netWorth = player.cash || 0;
  
  // Add value of all stocks
  if (player.stocks && chains) {
    Object.entries(player.stocks).forEach(([chainName, shares]) => {
      if (shares as number > 0) {
        // Find the chain to get its size
        const chain = chains.find((c: any) => c.name === chainName);
        const chainSize = chain ? (chain.tiles?.length || 0) : 0;
        if (chain && chainSize > 0) {
          const price = calculateStockPrice(chainSize, chainName);
          netWorth += price * (shares as number);
        }
        // If chain is not on board (size = 0), stock has no value
      }
    });
  }
  
  return netWorth;
};

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    const { game_id } = body;
    if (!game_id) {
      return new Response(
        JSON.stringify({ error: "Missing game_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const accessToken = authHeader.replace("Bearer ", "");

    let userId: string | null = null;
    if (accessToken) {
      const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      });
      const { data: userData, error: userError } = await userClient.auth.getUser(
        accessToken,
      );
      if (!userError && userData?.user) {
        userId = userData.user.id;
      }
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    const { data, error } = await adminClient
      .from("games")
      .select(
        "id, public, players, rules, board_config, public_state, game_state, status, number_of_seats, net_scores",
      )
      .eq("id", game_id)
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ error: "Game not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    const isParticipant = Array.isArray(data.players) &&
      (data.players as string[]).includes(userId ?? "");
    if (!data.public && !isParticipant) {
      return new Response(
        JSON.stringify({ error: "Not authorized for private game" }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }

    const boardConfig = data.board_config ?? {};
    const rawGameState = data.game_state ?? {};
    if (!data.game_state) {
      data.game_state = rawGameState;
    }
    const playerIds = Array.isArray(data.players)
      ? (data.players as string[])
      : [];
    
    // Fetch player usernames from profiles
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id, username")
      .in("id", playerIds);
    
    const usernameMap = new Map(
      (profiles ?? []).map((p) => [p.id, p.username ?? "Unknown"])
    );
    
    const playerRecords = playerIds.map((id) => ({ id }));
    
    let needsUpdate = false;
    
    // Ensure hands and bag (with usernames)
    const ensureResult = ensureHandsAndBag(rawGameState, boardConfig, playerIds, usernameMap);
    if (ensureResult.changed) {
      needsUpdate = true;
    }
    
    // Ensure turn structure
    const turnResult = ensureTurnStructure(rawGameState, playerRecords);
    if (turnResult.updated) {
      Object.assign(rawGameState, turnResult.state);
      needsUpdate = true;
    }
    
    // Rebuild public_state from game_state to ensure all players are included
    const currentPlayerId = getCurrentPlayerId(rawGameState);
    const rawPublicState = data.public_state ?? {};
    
    // Ensure public_state has all players from game_state
    if (Array.isArray(rawGameState.players)) {
      const chains = rawGameState.chains ?? [];
      const publicPlayers = rawGameState.players.map((player: any) => {
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
      });
      
      // Check if public_state needs updating
      if (!rawPublicState.players || 
          rawPublicState.players.length !== publicPlayers.length ||
          rawPublicState.currentPlayerId !== currentPlayerId) {
        rawPublicState.players = publicPlayers;
        rawPublicState.currentPlayerId = currentPlayerId;
        needsUpdate = true;
      }
    }
    
    if (needsUpdate) {
      const { error: stateUpdateError } = await adminClient
        .from("games")
        .update({ 
          game_state: rawGameState,
          public_state: rawPublicState 
        })
        .eq("id", game_id);
      if (stateUpdateError) {
        console.error(stateUpdateError);
        return new Response(
          JSON.stringify({ error: "Failed to refresh game state" }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    const payload = {
      id: data.id,
      public_state: rawPublicState,
      board_config: data.board_config,
      rules: data.rules,
      status: data.status,
      number_of_seats: data.number_of_seats,
      net_scores: data.net_scores,
      players: data.players,
      game_state: isParticipant ? sanitizeGameState(rawGameState, userId) : null,
    };

    return new Response(JSON.stringify(payload), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
});


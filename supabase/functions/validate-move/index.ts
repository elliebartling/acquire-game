import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  ensureHandsAndBag,
  playerHasTile,
} from "../_shared/gameState.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  try {
    const body = await req.json();
    const { game_id, tile } = body;
    if (!game_id || !tile) {
      return new Response(
        JSON.stringify({ error: "Missing game_id or tile" }),
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
      .select("players, board_config, game_state")
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
        JSON.stringify({ error: "Only participants can play tiles" }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }

    const boardConfig = data.board_config ?? {};
    const gameState = data.game_state ?? {};
    if (!data.game_state) {
      data.game_state = gameState;
    }
    const playerIds = Array.isArray(data.players)
      ? (data.players as string[])
      : [];
    const ensureResult = ensureHandsAndBag(gameState, boardConfig, playerIds);
    if (ensureResult.changed) {
      const { error: stateUpdateError } = await adminClient
        .from("games")
        .update({ game_state: gameState })
        .eq("id", game_id);
      if (stateUpdateError) {
        console.error(stateUpdateError);
        return new Response(
          JSON.stringify({ error: "Failed to sync game state" }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    if (!playerHasTile(gameState, userData.user.id, tile)) {
      return new Response(
        JSON.stringify({ error: "Tile is not in your hand" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const boardTiles = gameState.board?.tiles ?? {};
    if (boardTiles[tile]) {
      return new Response(
        JSON.stringify({ error: "Tile already placed" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ ok: true, tile }), {
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


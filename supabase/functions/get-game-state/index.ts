import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  ensureHandsAndBag,
  sanitizeGameState,
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
    const ensureResult = ensureHandsAndBag(rawGameState, boardConfig, playerIds);
    if (ensureResult.changed) {
      const { error: stateUpdateError } = await adminClient
        .from("games")
        .update({ game_state: rawGameState })
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
      public_state: data.public_state,
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


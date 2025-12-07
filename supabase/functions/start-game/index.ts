import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  ensureHandsAndBag,
  GameStateRecord,
  dealTilesToPlayer,
} from "../_shared/gameState.ts";
import { ensureBoard, ensureChains, ChainRecord } from "../_shared/boardUtils.ts";
import { GAME_EVENTS, sendGameBroadcast } from "../_shared/broadcast.ts";
import { sortPlayersByTurnOrderTiles } from "../_shared/gameLogic.ts";

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
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Authenticate the user
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing auth token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
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
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get the game with service role to access all fields
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { data: game, error: fetchError } = await adminClient
      .from("games")
      .select("id, status, players, number_of_seats, game_state, public_state, board_config")
      .eq("id", game_id)
      .single();

    if (fetchError || !game) {
      return new Response(
        JSON.stringify({ error: "Game not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify the requester is a participant
    const playerIds = Array.isArray(game.players) ? game.players as string[] : [];
    if (!playerIds.includes(userData.user.id)) {
      return new Response(
        JSON.stringify({ error: "Only game participants can start the game" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify game is in waiting status
    if (game.status !== "waiting") {
      return new Response(
        JSON.stringify({ error: `Game cannot be started (status: ${game.status})` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify correct number of players have joined
    if (playerIds.length !== game.number_of_seats) {
      return new Response(
        JSON.stringify({ 
          error: `Not enough players (${playerIds.length}/${game.number_of_seats})` 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize or get existing game state
    const gameState: GameStateRecord = (game.game_state as GameStateRecord) || {};
    const boardConfig = game.board_config || gameState.config || { width: 12, height: 9 };

    // Ensure board, chains, bag, and player records exist
    ensureHandsAndBag(gameState, boardConfig, playerIds);
    const board = ensureBoard(gameState.board, boardConfig);
    const chains = ensureChains(
      gameState.chains as ChainRecord[] | undefined,
      gameState.config?.chainNames || []
    );

    gameState.board = board;
    gameState.chains = chains;

    // Draw one tile for each player to determine turn order
    const turnOrderTiles: Record<string, string> = {};
    const tileBag = Array.isArray(gameState.tileBag) ? gameState.tileBag : [];
    const events = [];

    for (const playerId of playerIds) {
      if (tileBag.length === 0) {
        return new Response(
          JSON.stringify({ error: "Not enough tiles in bag to determine turn order" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      // Draw one tile from the bag
      const tile = tileBag.pop()!;
      turnOrderTiles[playerId] = tile;

      // Place the tile on the board
      if (!board.tiles) {
        board.tiles = {};
      }
      board.tiles[tile] = { player: playerId };

      // Add event for tile placement
      events.push({
        type: "TilePlayed",
        playerId,
        tile,
        description: `Played tile ${tile}`,
      });
    }

    // Sort players by their drawn tiles
    const sortedPlayerIds = sortPlayersByTurnOrderTiles(turnOrderTiles);

    // Get usernames for the turn order message
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id, username")
      .in("id", sortedPlayerIds);
    
    const usernameMap = new Map(
      (profiles || []).map((p: any) => [p.id, p.username || p.id])
    );
    
    const turnOrderNames = sortedPlayerIds
      .map(id => usernameMap.get(id) || id)
      .join(", ");

    // Add event for turn order determination
    events.push({
      type: "TurnOrderDetermined",
      turnOrder: sortedPlayerIds,
      turnOrderTiles,
      description: `Turn order: ${turnOrderNames}`,
    });

    // Add event for first player's turn
    const firstPlayerName = usernameMap.get(sortedPlayerIds[0]) || sortedPlayerIds[0];
    events.push({
      type: "TurnStarted",
      playerId: sortedPlayerIds[0],
      description: `It's ${firstPlayerName}'s turn`,
    });

    // Update game state with turn order
    gameState.turnOrder = sortedPlayerIds;
    gameState.currentTurnIndex = 0;
    gameState.turnOrderTiles = turnOrderTiles;

    // Deal starting hands to all players (6 tiles each)
    for (const playerId of playerIds) {
      dealTilesToPlayer(gameState, playerId, 6);
    }

    // Update public state
    const publicState = {
      ...(game.public_state || {}),
      board: {
        width: board.width,
        height: board.height,
        tiles: board.tiles,
      },
      chains: chains.map((chain) => ({
        id: chain.id,
        name: chain.name,
        size: (chain.tiles || []).length,
      })),
      currentPlayerId: sortedPlayerIds[0],
      turnOrderTiles,
      phase: { type: "tilePlacement", playerId: sortedPlayerIds[0] },
    };

    // Save events to moves table
    for (const event of events) {
      try {
        // For system events (turn order determined), use a system player ID
        let playerId = event.playerId || sortedPlayerIds[0];
        if (event.type === 'TurnOrderDetermined') {
          // Use the first player as a placeholder but we'll handle display differently
          playerId = sortedPlayerIds[0];
        }
        
        await adminClient
          .from("moves")
          .insert({
            game_id,
            player: playerId,
            move_type: event.type,
            move_value: event.tile || null,
            description: event.description,
            event_data: event,
          });
      } catch (eventError) {
        console.error("Failed to save event:", eventError);
        // Continue even if event save fails
      }
    }

    // Update game status to active
    const { error: updateError } = await adminClient
      .from("games")
      .update({
        status: "active",
        game_state: gameState,
        public_state: publicState,
      })
      .eq("id", game_id);

    if (updateError) {
      console.error("Failed to update game:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to start game" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Broadcast game started event
    await sendGameBroadcast(game_id, GAME_EVENTS.STATE_UPDATED, {
      gameStarted: true,
      turnOrder: sortedPlayerIds,
      turnOrderTiles,
      currentPlayerId: sortedPlayerIds[0],
    });

    return new Response(
      JSON.stringify({
        ok: true,
        turnOrder: sortedPlayerIds,
        turnOrderTiles,
        currentPlayerId: sortedPlayerIds[0],
        message: "Game started successfully",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error starting game:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});


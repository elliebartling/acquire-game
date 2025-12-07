import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  ensureHandsAndBag,
  GameStateRecord,
  PlayerStateRecord,
} from "../_shared/gameState.ts";
import {
  advanceTurn,
  ensureTurnStructure,
  getCurrentPlayerId,
} from "../_shared/turns.ts";
import { GAME_EVENTS, sendGameBroadcast } from "../_shared/broadcast.ts";
import { GamePhase } from "../_shared/phases.ts";
import { saveEvent } from "../_shared/eventStore.ts";
import { migratePendingActionToPhase } from "../_shared/migratePendingAction.ts";
import { handleTilePlacement } from "../_shared/handlers/tilePlacement.ts";
import { handleChainFounding } from "../_shared/handlers/chainFounding.ts";
import { handleMergerResolution } from "../_shared/handlers/mergerResolution.ts";
import { handleStockDisposal } from "../_shared/handlers/stockDisposal.ts";
import { handleStockPurchase, buildBuyPendingAction } from "../_shared/handlers/stockPurchase.ts";
import { handleTurnAdvancement } from "../_shared/handlers/turnAdvancement.ts";
import {
  ensureBoard,
  ensureChains,
  updatePublicChains,
  discardBlockedTiles,
  ChainRecord,
} from "../_shared/boardUtils.ts";
import { calculateNetWorth } from "../_shared/gameLogic.ts";
import { dealTilesToPlayer } from "../_shared/gameState.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

function buildMoveRecord(move: Record<string, unknown> = {}, playerId: string) {
  return {
    player: playerId,
    move_type: (move.type ?? move.move_type ?? "tile") as string,
    move_value: (move.value ?? move.move_value ?? null) as string | null,
    created_at: new Date().toISOString(),
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
      .select("players, moves, public_state, game_state, board_config, status")
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

    // Verify game has started
    if (data.status !== "active") {
      return new Response(
        JSON.stringify({ error: "Game has not started yet" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const existingGameState = (data.game_state ?? {}) as GameStateRecord;
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
    
    // Ensure board and chains exist in game state
    const board = ensureBoard(existingGameState.board, boardConfig);
    const chains = ensureChains(
      existingGameState.chains as ChainRecord[] | undefined,
      existingGameState.config?.chainNames ?? [],
    );
    
    // Update game state with ensured board and chains
    existingGameState.board = board;
    existingGameState.chains = chains;

    // Get current phase from game state, or migrate from legacy pendingAction
    let currentPhase: GamePhase | null = null;
    
    // Validate and normalize phase from game state
    const rawPhase = existingGameState.phase;
    console.log("Raw phase from game state:", JSON.stringify(rawPhase));
    
    if (rawPhase && typeof rawPhase === 'object' && 'type' in rawPhase && typeof (rawPhase as any).type === 'string') {
      // Phase exists and has a valid type field - use it
      currentPhase = rawPhase as GamePhase;
      console.log("Using existing phase:", currentPhase.type);
    } else if (rawPhase) {
      // Phase exists but is invalid format - clear it
      console.warn("Invalid phase format detected, clearing:", JSON.stringify(rawPhase));
      existingGameState.phase = null;
      currentPhase = null;
    } else {
      console.log("No phase found in game state");
    }
    
    // Backward compatibility: migrate old pendingAction to phase
    if (!currentPhase && (existingGameState as any).pendingAction) {
      currentPhase = migratePendingActionToPhase((existingGameState as any).pendingAction);
      // Update the game state with the migrated phase
      if (currentPhase) {
        existingGameState.phase = currentPhase;
        delete (existingGameState as any).pendingAction;
      }
    }

    // Route to appropriate handler based on move type and phase
    let handlerResult;
    const moveType = moveRecord.move_type;

    try {
      if (moveType === "tile") {
        // Ensure we have a tile value
        if (!moveRecord.move_value) {
          throw new Error("Missing tile value.");
        }
        // Ensure phase is set for tile placement (use current player or the user making the move)
        const tilePlayerId = currentPlayerId || userData.user.id;
        
        // Always ensure we have a valid tilePlacement phase
        console.log("Before phase check - currentPhase:", JSON.stringify(currentPhase));
        if (!currentPhase || typeof currentPhase !== 'object' || !currentPhase.type || currentPhase.type !== "tilePlacement") {
          // If phase is invalid or not tilePlacement, initialize/reset it
          console.log("Resetting phase to tilePlacement for player:", tilePlayerId);
          currentPhase = { type: "tilePlacement", playerId: tilePlayerId };
          // Update game state immediately
          existingGameState.phase = currentPhase;
        }
        
        // Double-check phase is valid before proceeding
        console.log("After phase check - currentPhase:", JSON.stringify(currentPhase));
        if (!currentPhase || typeof currentPhase !== 'object' || !currentPhase.type || currentPhase.type !== "tilePlacement") {
          throw new Error(`Invalid phase state after validation: ${JSON.stringify(currentPhase)}`);
        }
        
        // Enforce turn order
        if (currentPlayerId && currentPlayerId !== userData.user.id) {
          throw new Error("Not your turn");
        }
        
        handlerResult = handleTilePlacement(
          existingGameState,
          userData.user.id,
          moveRecord.move_value,
          currentPhase,
        );
      } else if (moveType === "start-chain") {
        if (currentPhase?.type !== "foundChain") {
          throw new Error("No pending chain formation.");
        }
        handlerResult = handleChainFounding(
          existingGameState,
          userData.user.id,
          move.chain_id ?? move.chainId ?? "",
          currentPhase,
        );
      } else if (moveType === "resolve-merger") {
        if (currentPhase?.type !== "mergerChoice") {
          throw new Error("No merger to resolve.");
        }
        handlerResult = handleMergerResolution(
          existingGameState,
          userData.user.id,
          move.chain_id ?? move.chainId ?? "",
          currentPhase,
        );
      } else if (moveType === "purchase") {
        if (currentPhase?.type !== "stockBuy") {
          throw new Error("No stock purchase pending.");
        }
        handlerResult = handleStockPurchase(
          existingGameState,
          userData.user.id,
          move.chain ?? move.chainName ?? move.chain_id ?? move.chainId ?? "",
          Number(move.shares ?? move.share ?? 1),
          currentPhase,
        );
      } else if (moveType === "dispose-stock") {
        if (currentPhase?.type !== "disposalLoop") {
          throw new Error("No stock disposal pending.");
        }
        const actions = Array.isArray(move.actions) ? move.actions : [];
        handlerResult = handleStockDisposal(
          existingGameState,
          userData.user.id,
          actions,
          currentPhase,
        );
      } else if (moveType === "complete-buy") {
        // Complete buy phase - just clear it and draw tile
        if (currentPhase?.type !== "stockBuy") {
          throw new Error("No stock purchase pending.");
        }
        const drawn = dealTilesToPlayer(existingGameState, userData.user.id, 1);
        handlerResult = {
          updatedState: existingGameState,
          events: drawn.length > 0 ? [{
            type: "TilesDrawn",
            playerId: userData.user.id,
            count: drawn.length,
            description: `Player drew ${drawn.length} tile(s)`,
          }] : [],
          nextPhase: null,
          moveDescription: drawn.length > 0 ? `Player drew ${drawn.length} tile(s)` : "Buy phase completed",
        };
      } else {
        throw new Error(`Unknown move type: ${moveType}`);
      }
    } catch (handlerError: any) {
      console.error("Handler error:", handlerError);
      console.error("Error stack:", handlerError.stack);
      return new Response(
        JSON.stringify({ 
          error: handlerError.message || "Handler error",
          details: Deno.env.get("DENO_ENV") === "development" ? handlerError.stack : undefined
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Update game state with handler results
    const updatedGameState = handlerResult.updatedState;
    // Board and chains are already updated by handlers (they mutate the state)
    updatedGameState.phase = handlerResult.nextPhase;

    // Discard blocked tiles
    discardBlockedTiles(updatedGameState, board, chains, dealTilesToPlayer);

    // Advance turn if phase is null and it's the current player's turn
    let turnEnded = false;
    if (!handlerResult.nextPhase && currentPlayerId === userData.user.id) {
      const turnResult = handleTurnAdvancement(updatedGameState);
      Object.assign(updatedGameState, turnResult.updatedState);
      handlerResult.events.push(...turnResult.events);
      turnEnded = true;
    }

    // If no phase and turn didn't advance, check if we should offer buy-stock
    if (!updatedGameState.phase && !turnEnded && currentPlayerId === userData.user.id) {
      const player = (updatedGameState.players ?? []).find((p) => p.id === userData.user.id);
      if (player) {
        const buyAction = buildBuyPendingAction(
          userData.user.id,
          player.cash ?? 0,
          chains,
        );
        if (buyAction) {
          updatedGameState.phase = buyAction;
        }
      }
    }

    // Save events to moves table
    const phaseBefore = currentPhase;
    const phaseAfter = updatedGameState.phase;
    for (const event of handlerResult.events) {
      try {
        await saveEvent(game_id, event, phaseBefore, phaseAfter);
      } catch (eventError) {
        console.error("Failed to save event:", eventError);
        // Continue even if event save fails
      }
    }

    // Update public state
    const existingPublicState = data.public_state ?? {
      board,
      moves: [],
      chains: chains.map((chain) => ({
        id: chain.id,
        name: chain.name,
        size: (chain.tiles ?? []).length,
      })),
    };

    // Get recent moves from database for public_state
    const { data: recentMoves } = await adminClient
      .from("moves")
      .select("description, created_at, player, move_type")
      .eq("game_id", game_id)
      .order("created_at", { ascending: false })
      .limit(50);

    const nextPublicState = {
      ...existingPublicState,
      board: {
        ...existingPublicState.board,
        tiles: board.tiles,
      },
      chains: updatePublicChains(existingPublicState.chains, chains),
      players: (updatedGameState.players ?? []).map((player: any) => {
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
      moves: (recentMoves ?? []).reverse(), // Reverse to show oldest first
      currentPlayerId: getCurrentPlayerId(updatedGameState),
      phase: updatedGameState.phase,
    };

    // Update database
    const { error: updateError } = await adminClient
      .from("games")
      .update({
        public_state: nextPublicState,
        game_state: updatedGameState,
      })
      .eq("id", game_id);

    if (updateError) {
      console.error(updateError);
      return new Response(
        JSON.stringify({ error: "Failed to persist move" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
    
    // Broadcast events
    if (turnEnded) {
      await sendGameBroadcast(game_id, GAME_EVENTS.TURN_ENDED, {
        previousPlayerId: userData.user.id,
        currentPlayerId: getCurrentPlayerId(updatedGameState),
      });
    }
    
    await sendGameBroadcast(game_id, GAME_EVENTS.STATE_UPDATED, {
      moveType: moveRecord.move_type,
      playerId: userData.user.id,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        move: moveRecord,
        description: handlerResult.moveDescription,
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


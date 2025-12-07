import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GameEvent } from "./events.ts";
import { GamePhase } from "./phases.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

let adminClient: ReturnType<typeof createClient> | null = null;

function getAdminClient() {
  if (!adminClient) {
    adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return adminClient;
}

export async function saveEvent(
  gameId: string,
  event: GameEvent,
  phaseBefore: GamePhase | null,
  phaseAfter: GamePhase | null,
): Promise<void> {
  const client = getAdminClient();
  const { error } = await client.from("moves").insert({
    game_id: gameId,
    player: event.playerId || null,
    move_type: event.type,
    event_type: event.type,
    event_data: event,
    description: event.description,
    phase_before: phaseBefore,
    phase_after: phaseAfter,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Failed to save event:", error);
    throw error;
  }
}

export async function getRecentEvents(
  gameId: string,
  limit: number = 50,
): Promise<GameEvent[]> {
  const client = getAdminClient();
  const { data, error } = await client
    .from("moves")
    .select("event_data")
    .eq("game_id", gameId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to get recent events:", error);
    return [];
  }

  return (data || [])
    .map((row) => row.event_data as GameEvent)
    .filter((event): event is GameEvent => event !== null);
}

export async function replayEvents(
  gameState: any,
  events: GameEvent[],
): Promise<any> {
  // This would reconstruct state from events for debugging
  // For now, return the game state as-is
  // TODO: Implement full replay logic if needed
  return gameState;
}



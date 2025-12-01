import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export const GAME_EVENTS = {
  STATE_UPDATED: "state-updated",
  TILE_PLAYED: "tile-played",
  HOTEL_SELECTED: "hotel-selected",
  TURN_ENDED: "turn-ended",
} as const;

export function getGameChannelName(gameId: string): string {
  return `game:${gameId}`;
}

/**
 * Sends a broadcast message to all clients subscribed to a game's channel
 */
export async function sendGameBroadcast(
  gameId: string,
  event: string,
  payload: Record<string, any> = {}
): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const channelName = getGameChannelName(gameId);

  try {
    await supabase.channel(channelName).send({
      type: "broadcast",
      event,
      payload,
    });
    console.log(`Broadcast sent: ${event} to ${channelName}`, payload);
  } catch (error) {
    console.error(`Failed to send broadcast ${event} to ${channelName}:`, error);
  }
}


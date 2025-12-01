/**
 * Centralized broadcast topics and events for real-time game updates
 */

export const GAME_CHANNEL_TOPIC = (gameId) => `game:${gameId}`

export const GAME_EVENTS = {
  STATE_UPDATED: 'state-updated',
  TILE_PLAYED: 'tile-played',
  HOTEL_SELECTED: 'hotel-selected',
  TURN_ENDED: 'turn-ended',
}


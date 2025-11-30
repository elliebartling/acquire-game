import { supabase } from '@/supabase'

export async function archiveCompletedGame(gameId, payload) {
  const { error } = await supabase.from('game_history').insert({
    game_id: gameId,
    final_state: payload.game_state,
    public_state: payload.public_state,
    players: payload.public_state.players,
    completed_at: new Date().toISOString()
  })
  if (error) throw error
}


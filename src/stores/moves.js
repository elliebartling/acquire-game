import { defineStore } from 'pinia'
import { supabase } from '@/supabase'

export const useMovesStore = defineStore({
    id: 'moves',
    state: () => ({
        all: [],
    }),
    actions: {
        async getMoves(game) {
            console.log('Getting moves...', game)
            let { data: moves, error } = await supabase
                .from('moves')
                .select("*")
                .eq('game_id', game)
                .order('created_at', { ascending: false })

            if (error) throw error
            console.log('Got moves!', moves)            

            return moves
        },
        async playMove(game, move, move_type, player) {
            console.log(game.id, move, move_type, player)
            
            const { data, error } = await supabase
                .from('moves')
                .insert([{
                    game_id: game.id.toString(),
                    player,
                    move_type,
                    move_value: move
                }])
            
            if (error) throw error
        },
    }
})
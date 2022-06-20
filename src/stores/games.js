import { defineStore } from 'pinia'
import { supabase } from '@/supabase'

export const useGamesStore = defineStore({
  id: 'games',
  state: () => ({
    all: [],
    currentGame: null
  }),
  getters: {
    allGames(state) {
        return state.all.filter((game) => game.public)
    },
    gameById(state) {
        return (gameId) => state.all.find((game) => game.id === gameId)
    }
  },
  actions: {
    async loadRecentGames() {
        let { data: games, error } = await supabase
            .from('games')
            .select('*')
        
            this.all = games
    }
  }
})

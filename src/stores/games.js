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
            // .gte('created_at', 'Greater than or equal to')
            .order('created_at', { ascending: false })
        
        this.all = games
        this.listenForNewGames()
    },
    listenForNewGames() {
      const gameSubscription = supabase
        .from('games')
        .on('INSERT', payload => {
          console.log('New games received!', payload)
          this.all.unshift(payload.new)
        })
        .subscribe()
      
    },
    async playMove(game, move) {

    },
    async createNewGame(settings) {
      console.log(settings)
      let { data, error } = await supabase
        .from('games')
        .insert(settings)
      
      if (error) throw error 
    }
  }
})

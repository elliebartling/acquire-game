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
        // this.listenForNewMoves()
    },
    listenForNewGames() {
      const gameSubscription = supabase
        .from('games')
        .on('INSERT', payload => {
          this.all.unshift(payload.new)
        })
        .subscribe()
    },
    // listenForNewMoves() {
    //   const moveSubscription = supabase
    //     .from('moves')
    //     .on('INSERT', payload => {
    //       console.log('New move received!', payload)
    //       this.all.find((game) => game.id === ).unshift(payload.new)
    //     })
    //     .subscribe();
    // },
    // async playMove(game, move, player) {
    //   console.log(move, player)
    //   let { error }
    // },
    // async getMoves(game) {
    //   let { data: games, error } = await supabase
    //   .from('games')
    //   .select('*')
    //   // .gte('created_at', 'Greater than or equal to')
    //   .order('created_at', { ascending: false })

    //   const moveSubscription = supabase
    //     .from('games')
    //     .on('INSERT', payload => {
    //       console.log('New games received!', payload)
    //       this.all.unshift(payload.new)
    //     })
    //     .subscribe()
    // },
    async createNewGame(settings) {
      console.log(settings)
      let { data, error } = await supabase
        .from('games')
        .insert(settings)
      
      if (error) throw error 
    }
  }
})

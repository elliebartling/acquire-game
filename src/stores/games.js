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
    async getCurrentGame(id) {
      let { data, error } = await supabase
        .from('games')
        .select(`
          id,
          moves,
          players,
          rules,
          net_scores,
          number_of_seats
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      this.currentGame = data
      
      const gameSubscription = supabase
        .from(`games:id=eq.${id}`)
        .on("UPDATE", payload => {
          this.currentGame = payload.new
        })
        .subscribe()

      return data
    },
    async playMove(game, move_value, move_type, player) {
      console.log(game.id, move_value, move_type, player)

      const move = {
        player,
        move_type,
        move_value
      }

      this.currentGame.moves ? this.currentGame.moves.unshift(move) : this.currentGame.moves = move

      // console.log(this.currentGame.moves)

      const { data, error } = await supabase
          .from('games')
          .update({ moves: this.currentGame.moves })
          .eq('id', game.id)
      
      if (error) throw error
    },
    async joinGame(playerId, game) {
      let newPlayers = game.players
      newPlayers.push(playerId)

      const { data, error } = await supabase
          .from('games')
          .update({ players: newPlayers })
          .eq('id', game.id)
      
      if (error) throw error
      
      return data
    },
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
      let startingTiles = []

      // for (let h = 1; h < this.size.height; h++) {
      //     for (let w = 1; w < this.size.width; w++) {
      //         let col = w
      //         let row = (h + 9).toString(36).toUpperCase()
      //         arr.push(`${col}-${row}`)
      //     }
      // }

      let { data, error } = await supabase
        .from('games')
        .insert(settings)
      
      if (error) throw error 
    }
  }
})

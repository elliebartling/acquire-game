import { defineStore } from 'pinia'
import { supabase } from '@/supabase'
import { getPresetConfig } from '@/game/config/ConfigPresets'
import { RulesEngine } from '@/game/rules/RulesEngine'
import { buildRules } from '@/game/rules/rulesRegistry'
import { GameState } from '@/game/state/GameState'
import { PlayerState } from '@/game/state/PlayerState'
import { GameStateSerializer } from '@/game/persistence/GameStateSerializer'

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
      const { data, error } = await supabase
        .from('games')
        .select(`
          id,
          players,
          rules,
          number_of_seats,
          board_config,
          public_state,
          status,
          net_scores
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
      console.warn('playMove is deprecated. Use useGameStore.queueTilePlacement instead.')
      const move = {
        player,
        move_type,
        move_value
      }
      this.currentGame.moves ? this.currentGame.moves.unshift(move) : (this.currentGame.moves = [move])
      const { error } = await supabase
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
      const { data: games, error } = await supabase
        .from('games')
        .select('id, public_state, players, rules, status, number_of_seats, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      this.all = games || []
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
    getNewHand(playerId) {
      console.log('Getting new hand', playerId, this.currentGame.id)
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
      const preset = settings.boardPreset || 'standard'
      const baseConfig = getPresetConfig(preset)
      const variations = buildRules(settings.rules)
      const rulesEngine = new RulesEngine({ variations })
      const config = rulesEngine.extendConfig(baseConfig)
      const players = (settings.players || []).map(
        (id) =>
          new PlayerState({
            id,
            cash: config.startingCash,
            netWorth: config.startingCash
          })
      )

      const initialState = new GameState({
        config,
        players,
        turnOrder: players.map((player) => player.id),
        phase: 'setup'
      })

      const serializer = new GameStateSerializer({ preset, rules: settings.rules })
      const payload = serializer.serialize(initialState)

      const insertPayload = {
        public: settings.public,
        number_of_seats: settings.number_of_seats,
        rules: settings.rules,
        players: settings.players,
        status: 'waiting',
        board_config: config.toJSON(),
        game_state: payload.game_state,
        public_state: payload.public_state
      }

      const { data, error } = await supabase
        .from('games')
        .insert(insertPayload)
        .select('id, public, public_state, players, rules, status, number_of_seats, created_at, board_config')
        .single()

      if (error) throw error
      return data
    },
    async initGame(game) {
      const { id, players } = game
      let startingTiles = []

      let height = 9
      let width = 12

      for (let h = 1; h < height; h++) {
          for (let w = 1; w < width; w++) {
              let col = w
              let row = (h + 9).toString(36).toUpperCase()
              startingTiles.push(`${col}-${row}`)
          }
      }
      console.log("initializing game", id, players, startingTiles)
    }
  }
})

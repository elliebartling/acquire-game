import { defineStore } from 'pinia'
import { supabase } from '@/supabase'
import { GameStateSerializer } from '@/game/persistence/GameStateSerializer'
import { MoveHistory } from '@/game/persistence/MoveHistory'

export const useGameStore = defineStore({
  id: 'game',
  state: () => ({
    gameId: null,
    loading: false,
    error: null,
    gameState: null,
    publicState: null,
    playerView: null,
    moveHistory: new MoveHistory(),
    serializer: new GameStateSerializer(),
    subscription: null,
    playerId: null
  }),
  getters: {
    board(state) {
      return state.publicState?.board || null
    },
    chains(state) {
      return state.publicState?.chains || []
    },
    currentPlayerId(state) {
      return state.publicState?.currentPlayerId || null
    }
  },
  actions: {
    async loadGame(gameId, playerId) {
      this.loading = true
      this.error = null
      this.gameId = gameId
      this.playerId = playerId ?? null
      try {
        const payload = await this.fetchGameState(gameId, playerId)
        this.applyPayload(payload, playerId)
        this.loading = false
        this.subscribeToGame(gameId, playerId)
      } catch (err) {
        console.error(err)
        this.error = err
        this.loading = false
      }
    },
    async fetchGameState(gameId, playerId) {
      const { data, error } = await supabase.functions.invoke('get-game-state', {
        body: JSON.stringify({ game_id: gameId, player_id: playerId }),
        headers: { 'Content-Type': 'application/json' }
      })
      if (error) throw error
      return data
    },
    applyPayload(payload, playerId) {
      if (!payload) return
      this.publicState = payload.public_state || null
      if (payload.game_state) {
        this.serializer = new GameStateSerializer({ rules: payload.rules || [] })
        const deserialized = this.serializer.deserialize(payload, playerId)
        this.gameState = deserialized.gameState
        this.playerView = deserialized.privateView
        this.moveHistory = new MoveHistory(this.publicState?.moves || [])
      } else {
        this.gameState = null
        this.playerView = null
        this.moveHistory = new MoveHistory(this.publicState?.moves || [])
      }
    },
    subscribeToGame(gameId, playerId) {
      if (this.subscription) {
        supabase.removeSubscription(this.subscription)
      }
      this.subscription = supabase
        .from(`games:id=eq.${gameId}`)
        .on('UPDATE', async () => {
          try {
            const payload = await this.fetchGameState(gameId, playerId)
            this.applyPayload(payload, playerId)
          } catch (err) {
            console.error(err)
            this.error = err
          }
        })
        .subscribe()
    },
    setPlayerContext(playerId) {
      this.playerId = playerId
      if (!this.gameId) return
      this.refreshGameState()
    },
    async refreshGameState() {
      if (!this.gameId) return
      try {
        const payload = await this.fetchGameState(this.gameId, this.playerId)
        this.applyPayload(payload, this.playerId)
      } catch (err) {
        console.error(err)
        this.error = err
      }
    },
    async queueTilePlacement(tile) {
      if (!this.gameId) return
      await supabase.functions.invoke('validate-move', {
        body: JSON.stringify({ game_id: this.gameId, tile }),
        headers: { 'Content-Type': 'application/json' }
      })
      await supabase.functions.invoke('process-turn', {
        body: JSON.stringify({
          game_id: this.gameId,
          move: { type: 'tile', value: tile }
        }),
        headers: { 'Content-Type': 'application/json' }
      })
      await this.refreshGameState()
    },
    async buyStock(chainName, shares = 1) {
      if (!this.gameId) return
      await supabase.functions.invoke('process-turn', {
        body: JSON.stringify({
          game_id: this.gameId,
          move: { type: 'purchase', chain: chainName, shares }
        }),
        headers: { 'Content-Type': 'application/json' }
      })
      await this.refreshGameState()
    },
    async startChain(chainId) {
      if (!this.gameId || !chainId) return
      await supabase.functions.invoke('process-turn', {
        body: JSON.stringify({
          game_id: this.gameId,
          move: { type: 'start-chain', chain_id: chainId }
        }),
        headers: { 'Content-Type': 'application/json' }
      })
      await this.refreshGameState()
    },
    teardown() {
      if (this.subscription) {
        supabase.removeSubscription(this.subscription)
        this.subscription = null
      }
      this.$reset()
    }
  }
})


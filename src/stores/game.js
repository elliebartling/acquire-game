import { defineStore } from 'pinia'
import { supabase } from '@/supabase'
import { GameStateSerializer } from '@/game/persistence/GameStateSerializer'
import { MoveHistory } from '@/game/persistence/MoveHistory'
import { GAME_CHANNEL_TOPIC, GAME_EVENTS } from '@/game/realtime'

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
    broadcastChannel: null,
    playerId: null,
    realtimeLogs: []
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
        this.subscribeToBroadcastChannel(gameId, playerId)
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
        supabase.removeChannel(this.subscription)
        this.subscription = null
      }
      this.subscription = supabase
        .channel(`postgres-changes-${gameId}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'games',
          filter: `id=eq.${gameId}`
        }, async (payload) => {
          try {
            this.logRealtimeEvent('postgres', { type: 'UPDATE', gameId, payload })
            const gamePayload = await this.fetchGameState(gameId, playerId)
            this.applyPayload(gamePayload, playerId)
          } catch (err) {
            console.error(err)
            this.error = err
          }
        })
        .subscribe()
    },
    subscribeToBroadcastChannel(gameId, playerId) {
      // Check if supabase client has channel support
      if (!supabase || typeof supabase.channel !== 'function') {
        console.error('Supabase client does not support channels. Check your Supabase client initialization.')
        this.logRealtimeEvent('error', { message: 'Supabase client missing channel support' })
        return
      }

      if (this.broadcastChannel) {
        supabase.removeChannel(this.broadcastChannel)
        this.broadcastChannel = null
      }

      const channelName = GAME_CHANNEL_TOPIC(gameId)
      console.log('Subscribing to broadcast channel:', channelName)

      const channel = supabase.channel(channelName, {
        config: {
          broadcast: { self: true }
        }
      })

      console.log('Channel created:', channel)

      if (!channel) {
        console.error('Failed to create channel - realtime may not be enabled')
        this.logRealtimeEvent('error', { message: 'Failed to create broadcast channel' })
        return
      }

      this.broadcastChannel = channel
        .on('broadcast', { event: GAME_EVENTS.STATE_UPDATED }, async (payload) => {
          try {
            this.logRealtimeEvent('broadcast', { event: GAME_EVENTS.STATE_UPDATED, ...payload })
            const gamePayload = await this.fetchGameState(gameId, playerId)
            this.applyPayload(gamePayload, playerId)
          } catch (err) {
            console.error(err)
            this.error = err
          }
        })
        .on('broadcast', { event: GAME_EVENTS.TILE_PLAYED }, (payload) => {
          this.logRealtimeEvent('broadcast', { event: GAME_EVENTS.TILE_PLAYED, ...payload })
        })
        .on('broadcast', { event: GAME_EVENTS.HOTEL_SELECTED }, (payload) => {
          this.logRealtimeEvent('broadcast', { event: GAME_EVENTS.HOTEL_SELECTED, ...payload })
        })
        .on('broadcast', { event: GAME_EVENTS.TURN_ENDED }, (payload) => {
          this.logRealtimeEvent('broadcast', { event: GAME_EVENTS.TURN_ENDED, ...payload })
        })
        .subscribe((status) => {
          console.log('Broadcast channel subscription status:', status)
          if (status === 'SUBSCRIBED') {
            this.logRealtimeEvent('broadcast', { message: 'Subscribed to channel', channelName })
          }
        })
    },
    logRealtimeEvent(source, data) {
      const event = {
        timestamp: new Date().toISOString(),
        source,
        data
      }
      this.realtimeLogs = [event, ...this.realtimeLogs].slice(0, 20) // Keep last 20
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
    async resolveMerger(chainId) {
      if (!this.gameId || !chainId) return
      await supabase.functions.invoke('process-turn', {
        body: JSON.stringify({
          game_id: this.gameId,
          move: { type: 'resolve-merger', chain_id: chainId }
        }),
        headers: { 'Content-Type': 'application/json' }
      })
      await this.refreshGameState()
    },
    async completeStockPurchase() {
      if (!this.gameId) return
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      await supabase.functions.invoke('process-turn', {
        body: JSON.stringify({
          game_id: this.gameId,
          move: { type: 'complete-buy' }
        }),
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      await this.refreshGameState()
    },
    teardown() {
      if (this.subscription) {
        supabase.removeChannel(this.subscription)
        this.subscription = null
      }
      if (this.broadcastChannel) {
        supabase.removeChannel(this.broadcastChannel)
        this.broadcastChannel = null
      }
      this.$reset()
    }
  }
})


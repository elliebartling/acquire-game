import { defineStore } from 'pinia'
import { supabase } from '@/supabase'
import { GameStateSerializer } from '@/game/persistence/GameStateSerializer'
import { MoveHistory } from '@/game/persistence/MoveHistory'
import { GAME_CHANNEL_TOPIC, GAME_EVENTS } from '@/game/realtime'

/**
 * Transform a database move record (with event_data) into the format expected by the UI
 */
function transformMoveToUIFormat(dbMove) {
  const baseMove = {
    id: dbMove.id,
    player: dbMove.player,
    move_type: dbMove.move_type,
    move_value: dbMove.move_value,
    created_at: dbMove.created_at,
    description: dbMove.description
  }

  // If we have event_data, extract fields from it and map event types to UI move types
  if (dbMove.event_data) {
    const event = dbMove.event_data

    switch (event.type) {
      case 'TilePlayed':
        return {
          ...baseMove,
          move_type: 'tile',
          move_value: event.tile
        }

      case 'StockPurchased':
        return {
          ...baseMove,
          move_type: 'purchase',
          chain_name: event.chainName,
          shares: event.shares
        }

      case 'StockDisposed':
        return {
          ...baseMove,
          move_type: 'dispose-stock',
          chain_name: event.defunctChainName,
          disposal_actions: event.actions
          // Note: surviving_chain_name might need to be extracted from phase_after if available
        }

      case 'ChainStarted':
        return {
          ...baseMove,
          move_type: 'start-chain',
          chain_name: event.chainName
        }

      case 'MergerResolved':
        // For merger resolution, we might need to get chain names from chains
        // For now, use the description or try to extract from event
        return {
          ...baseMove,
          move_type: 'resolve-merger'
        }

      case 'BonusesPaid':
        // Bonuses are typically not shown as separate moves in the UI
        // But we can include them if needed
        return {
          ...baseMove,
          move_type: 'bonuses-paid',
          chain_name: event.defunctChainName
        }

      case 'TurnAdvanced':
        // Turn advancement might not be shown as a move
        return {
          ...baseMove,
          move_type: 'turn-advanced'
        }

      case 'TilesDrawn':
        return {
          ...baseMove,
          move_type: 'tiles-drawn'
        }

      case 'TurnOrderDetermined':
        return {
          ...baseMove,
          move_type: 'turn-order-determined',
          turn_order: event.turnOrder
        }

      case 'TurnStarted':
        return {
          ...baseMove,
          move_type: 'turn-started'
        }

      default:
        // If event type doesn't match, try to convert the move_type from event type format
        // to UI format (e.g., "TilePlayed" -> "tile")
        const convertedMoveType = convertEventTypeToMoveType(event.type || dbMove.move_type)
        return {
          ...baseMove,
          move_type: convertedMoveType
        }
    }
  }

  // Fallback: convert move_type if it's in event type format (has capital letters)
  if (dbMove.move_type && /[A-Z]/.test(dbMove.move_type)) {
    return {
      ...baseMove,
      move_type: convertEventTypeToMoveType(dbMove.move_type)
    }
  }

  return baseMove
}

/**
 * Convert event type (e.g., "TilePlayed") to UI move type (e.g., "tile")
 */
function convertEventTypeToMoveType(eventType) {
  const typeMap = {
    'TilePlayed': 'tile',
    'StockPurchased': 'purchase',
    'StockDisposed': 'dispose-stock',
    'ChainStarted': 'start-chain',
    'MergerResolved': 'resolve-merger',
    'BonusesPaid': 'bonuses-paid',
    'TurnAdvanced': 'turn-advanced',
    'TilesDrawn': 'tiles-drawn',
    'TurnOrderDetermined': 'turn-order-determined',
    'TurnStarted': 'turn-started'
  }
  return typeMap[eventType] || eventType.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()
}

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
    movesChannel: null,
    playerId: null,
    realtimeLogs: [],
    moves: []
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
        await this.fetchMoves(gameId)
        this.loading = false
        this.subscribeToGame(gameId, playerId)
        this.subscribeToBroadcastChannel(gameId, playerId)
        this.subscribeToMoves(gameId)
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
    async fetchMoves(gameId) {
      if (!gameId) {
        console.warn('[fetchMoves] No gameId provided')
        return
      }
      console.log(`[fetchMoves] Fetching moves for game ${gameId}`)
      try {
        // First try with event_data (new schema)
        let { data: moves, error } = await supabase
          .from('moves')
          .select('id, player, move_type, move_value, event_data, description, created_at')
          .eq('game_id', gameId)
          .order('created_at', { ascending: true }) // Oldest first for display

        // If that fails because event_data doesn't exist, try without it
        if (error && (error.code === '42703' || error.message?.includes('event_data') || error.message?.includes('does not exist'))) {
          console.log('[fetchMoves] event_data column not available, fetching moves without it')
          const result = await supabase
            .from('moves')
            .select('id, player, move_type, move_value, description, created_at')
            .eq('game_id', gameId)
            .order('created_at', { ascending: true })
          moves = result.data
          error = result.error
        }

        if (error) {
          console.error('[fetchMoves] Failed to fetch moves:', error)
          this.moves = []
          return
        }

        console.log(`[fetchMoves] Fetched ${moves?.length || 0} moves for game ${gameId}`, moves)

        // Transform moves to UI format
        this.moves = (moves || []).map(transformMoveToUIFormat)
        
        console.log(`[fetchMoves] Transformed ${this.moves.length} moves`, this.moves)
      } catch (err) {
        console.error('[fetchMoves] Error fetching moves:', err)
        this.moves = []
      }
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
            // Don't refetch moves here - let the realtime subscription handle new moves
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
    subscribeToMoves(gameId) {
      if (!supabase || typeof supabase.channel !== 'function') {
        console.error('Supabase client does not support channels.')
        return
      }

      if (this.movesChannel) {
        supabase.removeChannel(this.movesChannel)
        this.movesChannel = null
      }

      const channelName = `moves-${gameId}`
      console.log(`[subscribeToMoves] Creating channel: ${channelName} for game ${gameId}`)
      
      // Listen to all INSERTs and filter in JavaScript (like games store does)
      // This avoids potential issues with UUID filter syntax
      this.movesChannel = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'moves'
        }, (payload) => {
          console.log('[subscribeToMoves] Received INSERT event:', payload)
          try {
            if (!payload.new) {
              console.warn('[subscribeToMoves] payload.new is missing', payload)
              return
            }
            
            // Filter by game_id in JavaScript (more reliable than DB filter for UUIDs)
            if (payload.new.game_id !== gameId) {
              console.log(`[subscribeToMoves] Ignoring move for different game: ${payload.new.game_id} !== ${gameId}`)
              return
            }
            
            // Check if move already exists (prevent duplicates)
            const existingMove = this.moves.find(m => m.id === payload.new.id)
            if (existingMove) {
              console.log(`[subscribeToMoves] Move ${payload.new.id} already exists, skipping`)
              return
            }
            
            console.log('[subscribeToMoves] Processing new move for this game:', payload.new)
            const newMove = transformMoveToUIFormat(payload.new)
            console.log('[subscribeToMoves] Transformed move:', newMove)
            
            // Add to moves array (keep sorted by created_at ascending)
            this.moves = [...this.moves, newMove].sort((a, b) => {
              return new Date(a.created_at) - new Date(b.created_at)
            })
            console.log(`[subscribeToMoves] Updated moves array, now has ${this.moves.length} moves`)
            this.logRealtimeEvent('postgres', { type: 'INSERT', table: 'moves', move: newMove })
          } catch (err) {
            console.error('[subscribeToMoves] Error processing new move:', err, payload)
          }
        })
        .subscribe((status) => {
          console.log('[subscribeToMoves] Channel subscription status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('[subscribeToMoves] Successfully subscribed to moves table for game', gameId)
          } else if (status === 'CHANNEL_ERROR') {
            console.error('[subscribeToMoves] Channel subscription error, status:', status)
          } else if (status === 'TIMED_OUT') {
            console.error('[subscribeToMoves] Channel subscription timed out')
          } else if (status === 'CLOSED') {
            console.warn('[subscribeToMoves] Channel subscription closed')
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
    async disposeStock(actions) {
      if (!this.gameId) return
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      await supabase.functions.invoke('process-turn', {
        body: JSON.stringify({
          game_id: this.gameId,
          move: { 
            type: 'dispose-stock',
            actions: actions
          }
        }),
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      await this.refreshGameState()
    },
    async startGame(gameId) {
      if (!gameId) {
        gameId = this.gameId
      }
      if (!gameId) {
        throw new Error('No game ID provided')
      }
      
      this.loading = true
      this.error = null
      
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        
        const { data, error } = await supabase.functions.invoke('start-game', {
          body: JSON.stringify({ game_id: gameId }),
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        })
        
        if (error) {
          console.error('Failed to start game:', error)
          this.error = error
          throw error
        }
        
        console.log('Game started successfully:', data)
        
        // Refresh game state to get updated status and turn order
        await this.refreshGameState()
        
        this.loading = false
        return data
      } catch (err) {
        console.error('Error starting game:', err)
        this.error = err
        this.loading = false
        throw err
      }
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
      if (this.movesChannel) {
        supabase.removeChannel(this.movesChannel)
        this.movesChannel = null
      }
      this.$reset()
    }
  }
})


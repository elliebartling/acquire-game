<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Board from '@/components/Game/Board.vue'
import PlayerHand from '@/components/Game/PlayerHand.vue'
import StockPanel from '@/components/Game/StockPanel.vue'
import ChainDisplay from '@/components/Game/ChainDisplay.vue'
import StockBuyingWidget from '@/components/Game/StockBuyingWidget.vue'
import StockDisposalWidget from '@/components/Game/StockDisposalWidget.vue'
import Scoreboard from '@/components/Game/Scoreboard.vue'
import { usePlayersStore } from '@/stores/players'
import { useGamesStore } from '@/stores/games'
import { useGameStore } from '@/stores/game'
import { useAuthStore } from '@/stores/auth'
import { getChainButtonClass, getChainBoardClass } from '@/constants/chainColors'
import { buildTileHints } from '@/game/utils/tileHints'

const route = useRoute()
const playersStore = usePlayersStore()
const gamesStore = useGamesStore()
const gameStore = useGameStore()
const authStore = useAuthStore()

const gameId = computed(() => route.params.id)

const publicState = computed(() => gameStore.publicState)
const playerView = computed(() => gameStore.playerView)
const moves = computed(() => publicState.value?.moves || [])
const pendingAction = computed(() => playerView.value?.pendingAction || null)
const handTileHints = computed(() =>
  buildTileHints(playerView.value?.hand || [], publicState.value?.board, publicState.value?.chains)
)
const realtimeLogs = computed(() => gameStore.realtimeLogs)
const currentPlayerId = computed(() => publicState.value?.currentPlayerId)

const currentGame = computed(() => gamesStore.gameById(gameId.value))
const currentUsername = computed(() => authStore.user?.profile?.username || '')
const currentUserId = computed(() => authStore.user?.id)

const usernameMap = computed(() => {
  const map = {}
  if (publicState.value?.players) {
    publicState.value.players.forEach(player => {
      // Try to get username from public state first, then fall back to playersStore
      const username = player.username || usernameFor(player.id)
      map[player.id] = username
    })
  }
  return map
})

const playerAvatarMap = computed(() => {
  const map = {}
  if (publicState.value?.players) {
    publicState.value.players.forEach(player => {
      const storePlayer = playersStore.playerById(player.id)
      map[player.id] = storePlayer?.avatar_url || null
    })
  }
  return map
})

function getPlayerColor(playerId) {
  const colors = [
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
  ]
  let hash = 0
  for (let i = 0; i < playerId.length; i++) {
    hash = playerId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function slugToTitle(slug) {
  return slug.replace('-', ' ')
}

// Enhanced move formatting with human-readable actions and extracted values
function formatMove(move) {
  // Use disposal_actions array if available, otherwise fall back to disposal_action
  const disposalActions = move.disposal_actions || (move.disposal_action ? [move.disposal_action] : null)
  const action = formatMoveAction(move.move_type, disposalActions)
  const details = extractMoveDetails(move)
  
  // Debug: log move structure for first few moves
  if (process.env.NODE_ENV === 'development') {
    const moveIndex = moves.value.findIndex(m => m === move || (m.created_at === move.created_at && m.player === move.player))
    if (moveIndex >= 0 && moveIndex < 3) {
      console.log(`Move ${moveIndex}:`, {
        move_type: move.move_type,
        move_value: move.move_value,
        chain_name: move.chain_name,
        shares: move.shares,
        disposal_action: move.disposal_action,
        disposal_actions: move.disposal_actions,
        surviving_chain_name: move.surviving_chain_name,
        extracted_details: details
      })
    }
  }
  
  return { action, details, move }
}

function formatMoveAction(moveType, disposalActions = null) {
  if (moveType === 'dispose-stock' && disposalActions) {
    // Handle array of disposal actions
    if (Array.isArray(disposalActions) && disposalActions.length > 0) {
      const actionMap = {
        'hold': 'held',
        'sell': 'sold',
        'trade': 'traded'
      }
      // If multiple actions, show the primary one or combine them
      if (disposalActions.length === 1) {
        return actionMap[disposalActions[0].action] || 'disposed'
      } else {
        // Multiple actions - we'll show details in the details array
        return 'disposed'
      }
    }
    // Fallback for single disposal_action (backward compatibility)
    if (typeof disposalActions === 'string') {
      const actionMap = {
        'hold': 'held',
        'sell': 'sold',
        'trade': 'traded'
      }
      return actionMap[disposalActions] || 'disposed'
    }
  }
  
  const actionMap = {
    'tile': 'played',
    'purchase': 'bought',
    'start-chain': 'started',
    'dispose-stock': 'disposed',
    'complete-buy': 'completed purchase',
    'resolve-merger': 'resolved merger'
  }
  return actionMap[moveType] || moveType.replace('-', ' ')
}

function extractMoveDetails(move) {
  const details = []
  
  // Extract tile information
  if (move.move_type === 'tile' && move.move_value) {
    details.push({ type: 'tile', value: move.move_value, index: 0 })
  }
  
  // Handle dispose-stock moves with multiple actions
  if (move.move_type === 'dispose-stock' && move.disposal_actions && Array.isArray(move.disposal_actions)) {
    // For disposal moves, show each action with its share count
    move.disposal_actions.forEach((actionItem, idx) => {
      const actionMap = {
        'hold': 'held',
        'sell': 'sold',
        'trade': 'traded'
      }
      const actionText = actionMap[actionItem.action] || actionItem.action
      details.push({ 
        type: 'disposal-action', 
        value: actionText, 
        shares: actionItem.shares,
        index: idx * 2
      })
    })
    
    // Add defunct chain name
    if (move.chain_name) {
      details.push({ type: 'chain', value: move.chain_name, index: move.disposal_actions.length * 2 })
    }
    
    // Add surviving chain name if traded
    if (move.surviving_chain_name && move.disposal_actions.some(a => a.action === 'trade')) {
      details.push({ type: 'surviving-chain', value: move.surviving_chain_name, index: move.disposal_actions.length * 2 + 1 })
    }
    
    return details
  }
  
  // Extract share count (before chain for better text flow)
  // Check both new field and fallback to parsing move_value if needed
  let shares = move.shares
  if (!shares && move.move_type === 'purchase') {
    // Try to infer from move_value if it's a number
    const parsed = parseInt(move.move_value)
    if (!isNaN(parsed)) {
      shares = parsed
    }
  }
  
  if (shares && shares > 0 && move.move_type === 'purchase') {
    details.push({ type: 'shares', value: shares, index: 1 })
  }
  
  // Extract chain information from enhanced move record
  // Check both new field and fallback to parsing move_value if needed
  let chainName = move.chain_name
  if (!chainName && move.move_value) {
    // Check if move_value is a chain name
    const knownChains = ['Luxor', 'Tower', 'American', 'Festival', 'Worldwide', 'Continental', 'Imperial']
    if (knownChains.includes(move.move_value)) {
      chainName = move.move_value
    }
  }
  
  // For start-chain and resolve-merger, chain_name should be set
  // For purchase, try to find chain from move_value or context
  if (chainName) {
    details.push({ type: 'chain', value: chainName, index: 2 })
  } else if (move.move_type === 'purchase' && move.move_value) {
    // Last resort: check if move_value looks like a chain name
    const knownChains = ['Luxor', 'Tower', 'American', 'Festival', 'Worldwide', 'Continental', 'Imperial']
    if (knownChains.includes(move.move_value)) {
      details.push({ type: 'chain', value: move.move_value, index: 2 })
    }
  }
  
  return details
}

function isTurnStart(move, index, moves) {
  // First move always starts a turn
  if (index === 0) return true
  // Tile plays always start a turn
  if (move.move_type === 'tile') return true
  // If previous move was by a different player, this starts a new turn
  const previousMove = moves[index - 1]
  return previousMove && previousMove.player !== move.player
}

function usernameFor(playerId) {
  const player = playersStore.playerById(playerId)
  return player ? player.username : 'Unknown'
}

async function ensureJoined(game) {
  if (!game || !authStore.user) return
  const joinable = route.query.join && game.players.length < game.number_of_seats
  const isAlreadyInGame = !!game.players.find((id) => id === authStore.user.id)
  if (joinable && !isAlreadyInGame) {
    await gamesStore.joinGame(authStore.user.id, game)
  }
}

function playTile(tile) {
  gameStore.queueTilePlacement(tile)
}

function buyStock(chain) {
  gameStore.buyStock(chain.name, 1)
}

async function handleChainSelection(option) {
  if (!option?.id) return
  await gameStore.startChain(option.id)
}

async function handleBatchPurchase(purchases) {
  // Process each purchase in sequence
  for (const purchase of purchases) {
    await gameStore.buyStock(purchase.chainName, purchase.shares)
  }
  // Then complete the stock purchase phase
  await gameStore.completeStockPurchase()
}

async function handleSkipPurchase() {
  await gameStore.completeStockPurchase()
}

async function handleMergerSelection(option) {
  if (!option?.id) return
  await gameStore.resolveMerger(option.id)
}

async function handleStockDisposal(disposal) {
  await gameStore.disposeStock(disposal.actions)
}

function getSurvivingChainStockRemaining(chainId) {
  if (!chainId || !publicState.value?.chains) return 0
  const chain = publicState.value.chains.find(c => c.id === chainId)
  return chain?.stockRemaining ?? 0
}

function chainClasses(name) {
  return getChainButtonClass(name)
}

onMounted(async () => {
  await playersStore.loadAllPlayers()
  const game = await gamesStore.getCurrentGame(gameId.value)
  await ensureJoined(game)
  await gameStore.loadGame(gameId.value, authStore.user?.id)
})

watch(
  () => authStore.user?.id,
  async (id) => {
    if (id && gameId.value) {
      gameStore.setPlayerContext(id)
    }
  }
)
</script>
<template>
    <header class="bg-gray-900 text-white border-b border-gray-800">
        <div v-if="currentGame" class="px-4 py-6 flex flex-wrap items-center justify-between gap-3">
            <!-- Left side: Back button & game meta -->
            <div class="flex flex-wrap items-center gap-4">
                <router-link to="/" class="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
                    <span aria-hidden="true">←</span>
                    <span class="font-medium">Lobby</span>
                </router-link>
                <div class="flex items-center gap-2 text-xs">
                    <span class="text-gray-500">|</span>
                    <div class="flex items-center gap-2 flex-wrap">
                        <template v-if="currentGame?.rules?.length">
                            <span
                              v-for="rule in currentGame.rules"
                              :key="rule"
                              class="rounded-full bg-gray-800 px-2.5 py-1 text-gray-300"
                            >
                              {{ slugToTitle(rule) }}
                            </span>
                        </template>
                        <span v-else class="rounded-full bg-gray-800 px-2.5 py-1 text-gray-300">Standard</span>
                    </div>
                    <span class="text-gray-500">•</span>
                    <div class="flex items-center gap-1.5">
                        <span
                          v-for="player in currentGame.players"
                          :key="player"
                          class="text-gray-400"
                          :title="usernameFor(player)"
                        >
                            <img
                              v-if="playerAvatarMap[player]"
                              :src="playerAvatarMap[player]"
                              :alt="usernameFor(player)"
                              class="h-6 w-6 rounded-full object-cover border border-gray-700 inline-block"
                            />
                            <span
                              v-else
                              class="h-6 w-6 rounded-full inline-flex items-center justify-center text-xs font-bold text-white border border-gray-700"
                              :style="{ backgroundColor: getPlayerColor(player) }"
                            >
                              {{ usernameFor(player).charAt(0).toUpperCase() }}
                            </span>
                            <span class="text-white/50 ml-2 mr-3">{{ usernameFor(player) }}</span>
                        </span>
                    </div>
                </div>
            </div>
            <!-- Right side: Current user info -->
            <div v-if="currentUserId && currentUsername" class="flex items-center gap-2">
                <router-link 
                    :to="`/player/${currentUserId}`" 
                    class="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                    <span class="font-medium">{{ currentUsername }}</span>
                    <span aria-hidden="true" class="text-gray-500">→</span>
                </router-link>
            </div>
        </div>
    </header>
    <main v-if="publicState" class="container mx-auto relative -top-6 px-3 py-3 max-w-[1600px]">
        <div id="grid" class="grid gap-3 grid-cols-1 lg:grid-cols-12 lg:grid-rows-[auto_1fr]">
            <div class="col-span-1 lg:col-span-6 w-full order-1 lg:order-1 flex flex-col gap-3">
                <Scoreboard 
                  :players="publicState.players"
                  :chains="publicState.chains"
                  :current-player-id="currentPlayerId"
                  :username-map="usernameMap"
                  :avatar-map="playerAvatarMap"
                />
                <div class="card pt-4">
                  <PlayerHand
                    :hand="playerView?.hand"
                    :hand-hints="handTileHints"
                    :disabled="!playerView?.canPlayTile"
                    :embedded="true"
                    @play-tile="playTile"
                  />
                  
                  <div
                    v-if="pendingAction?.type === 'buy-stock'"
                    class="mt-3 pt-3 border-t border-gray-200"
                  >
                    <StockBuyingWidget
                      :chains="publicState.chains"
                      :max-shares="pendingAction.remaining || 3"
                      :player-cash="playerView?.cash || 0"
                      @purchase="handleBatchPurchase"
                      @skip="handleSkipPurchase"
                    />
                  </div>
                  
                  <div
                    v-if="pendingAction?.type === 'dispose-stock'"
                    class="mt-3 pt-3 border-t border-gray-200"
                  >
                    <StockDisposalWidget
                      :defunct-chain-name="pendingAction.defunctChainName"
                      :defunct-chain-size="pendingAction.defunctChainSize"
                      :surviving-chain-name="pendingAction.survivingChainName"
                      :player-shares="pendingAction.playerShares"
                      :surviving-chain-stock-remaining="getSurvivingChainStockRemaining(pendingAction.survivingChainId)"
                      @dispose="handleStockDisposal"
                    />
                  </div>
                </div>
            </div>
            <div id="board" class="card col-span-1 lg:col-span-6 w-full pt-4 order-0 lg:order-0 lg:row-span-2">
                <Board
                    :board="publicState.board"
                    :chains="publicState.chains"
                    :current-player-id="publicState.currentPlayerId"
                    :player-id="authStore.user?.id"
                    :playable-tiles="playerView?.hand || []"
                    :tile-hints="handTileHints"
                    @play-tile="playTile"
                />
                <div
                  v-if="pendingAction?.type === 'start-chain'"
                  class="mt-4 border-t border-gray-100 pt-3"
                >
                  <h3 class="mb-2 text-xs font-semibold text-gray-900">Form a hotel</h3>
                  <p class="text-xs text-gray-600 mb-2">
                    Choose a chain for tiles
                    <span class="font-medium text-gray-900">{{ pendingAction.tiles.join(', ') }}</span>
                  </p>
                  <div class="flex flex-wrap gap-1.5">
                    <button
                      v-for="option in pendingAction.options"
                      :key="option.id"
                      class="px-3 py-1.5 rounded font-semibold text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                      :class="chainClasses(option.name)"
                      @click="handleChainSelection(option)"
                    >
                      {{ option.name }}
                    </button>
                  </div>
                </div>
                <div
                  v-if="pendingAction?.type === 'resolve-merger'"
                  class="mt-4 border-t border-gray-100 pt-3"
                >
                  <h3 class="mb-2 text-xs font-semibold text-gray-900">Resolve merger</h3>
                  <p class="text-xs text-gray-600 mb-2">
                    You have multiple bonded hotels touching <span class="font-medium text-gray-900">{{ pendingAction.tile }}</span>.
                    Choose which hotel survives.
                  </p>
                  <div class="flex flex-wrap gap-1.5">
                    <button
                      v-for="option in pendingAction.options"
                      :key="option.id"
                      class="px-3 py-1.5 rounded font-semibold text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                      :class="chainClasses(option.name)"
                      @click="handleMergerSelection(option)"
                    >
                      {{ option.name }}
                    </button>
                  </div>
                </div>
                <div class="mt-4 border-t border-gray-100 pt-3">
                  <div id="moves" class="flex flex-col max-h-[600px]">
                    <h2 class="mt-3 mb-3 text-base font-semibold text-gray-900">Moves</h2>
                    <div class="flow-root overflow-y-auto flex-1">
                        <ul role="list" class="divide-y divide-gray-200">
                            <li v-for="(move, index) in moves" :key="move.created_at || move.move_value || index" class="py-2.5">
                                <div class="text-sm text-gray-700 flex items-center gap-1.5 flex-wrap">
                                    <span class="font-semibold text-gray-900">{{ usernameFor(move.player) }}</span>
                                    <span>{{ formatMove(move).action }}</span>
                                    <template v-for="(detail, detailIndex) in formatMove(move).details" :key="detailIndex">
                                      <!-- Tile badge -->
                                      <span v-if="detail.type === 'tile'" 
                                            class="inline-flex items-center justify-center min-w-[2rem] h-6 px-1.5 rounded text-[10px] font-medium bg-gray-900 text-white border border-gray-700">
                                        {{ detail.value }}
                                      </span>
                                      
                                      <!-- Disposal action (hold/sell/trade) with shares -->
                                      <template v-else-if="detail.type === 'disposal-action'">
                                        <span v-if="detailIndex > 0" class="text-gray-500">,</span>
                                        <span class="text-gray-700">{{ detail.value }}</span>
                                        <span v-if="detail.shares" class="text-gray-600 font-medium ml-0.5">{{ detail.shares }}</span>
                                        <span v-if="detail.shares" class="text-gray-500 ml-0.5">{{ detail.shares === 1 ? 'share' : 'shares' }}</span>
                                      </template>
                                      
                                      <!-- Shares for purchases (standalone) -->
                                      <template v-else-if="detail.type === 'shares' && formatMove(move).move.move_type !== 'dispose-stock'">
                                        <span class="text-gray-600 font-medium">{{ detail.value }}</span>
                                        <span class="text-gray-500">{{ detail.value === 1 ? 'share' : 'shares' }}</span>
                                        <span v-if="formatMove(move).details.some(d => d.type === 'chain' && d.index > detail.index)" class="text-gray-500">in</span>
                                      </template>
                                      
                                      <!-- Defunct chain badge (for disposal) -->
                                      <span v-else-if="detail.type === 'chain' && formatMove(move).move.move_type === 'dispose-stock'"
                                            class="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold text-white shadow-sm"
                                            :class="getChainButtonClass(detail.value)">
                                        {{ detail.value }}
                                      </span>
                                      
                                      <!-- Surviving chain badge (for trades) -->
                                      <template v-else-if="detail.type === 'surviving-chain'">
                                        <span class="text-gray-500">for</span>
                                        <span class="text-gray-600 font-medium">{{ Math.floor((formatMove(move).move.disposal_actions?.find(a => a.action === 'trade')?.shares || 0) / 2) }}</span>
                                        <span class="text-gray-500">in</span>
                                        <span class="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold text-white shadow-sm"
                                              :class="getChainButtonClass(detail.value)">
                                          {{ detail.value }}
                                        </span>
                                      </template>
                                      
                                      <!-- Regular chain badge -->
                                      <span v-else-if="detail.type === 'chain'"
                                            class="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold text-white shadow-sm"
                                            :class="getChainButtonClass(detail.value)">
                                        {{ detail.value }}
                                      </span>
                                    </template>
                                </div>
                            </li>
                        </ul>
                    </div>
                  </div>
                </div>
            </div>
        </div>
        <details class="mt-6">
          <summary class="cursor-pointer text-sm font-semibold text-gray-500 mb-2">Realtime Events (Debug)</summary>
          <div class="bg-gray-900 rounded text-xs p-4 text-white overflow-auto max-h-64">
            <div v-if="realtimeLogs.length === 0" class="text-gray-500">No realtime events yet...</div>
            <div v-for="(log, index) in realtimeLogs" :key="index" class="mb-2 border-b border-gray-800 pb-2">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-gray-500">{{ new Date(log.timestamp).toLocaleTimeString() }}</span>
                    <span class="font-semibold" :class="log.source === 'broadcast' ? 'text-green-400' : 'text-blue-400'">
                        {{ log.source }}
                    </span>
                </div>
                <pre class="text-gray-300">{{ JSON.stringify(log.data, null, 2) }}</pre>
            </div>
          </div>
        </details>
        <details class="mt-4">
          <summary class="cursor-pointer text-sm font-semibold text-gray-500 mb-2">Game State (Debug)</summary>
          <code class="bg-gray-900 block rounded text-xs p-4 text-white block overflow-auto"><pre>{{ publicState }}</pre></code>
        </details>
    </main>
</template>
<style>
/* #grid {
    grid-template-rows: masonry;
} */
</style>
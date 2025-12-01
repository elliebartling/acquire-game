<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Board from '@/components/Game/Board.vue'
import PlayerHand from '@/components/Game/PlayerHand.vue'
import StockPanel from '@/components/Game/StockPanel.vue'
import ChainDisplay from '@/components/Game/ChainDisplay.vue'
import StockBuyingWidget from '@/components/Game/StockBuyingWidget.vue'
import Scoreboard from '@/components/Game/Scoreboard.vue'
import { usePlayersStore } from '@/stores/players'
import { useGamesStore } from '@/stores/games'
import { useGameStore } from '@/stores/game'
import { useAuthStore } from '@/stores/auth'
import { getChainButtonClass } from '@/constants/chainColors'
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

function slugToTitle(slug) {
  return slug.replace('-', ' ')
}

function formatMoveAction(moveType) {
  switch (moveType) {
    case 'tile':
      return 'played'
    case 'purchase':
      return 'bought stock in'
    default:
      return moveType
  }
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
    <header class="bg-gray-900 text-white">
        <div v-if="currentGame" class="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-3">
                <router-link to="/" class="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
                    <span aria-hidden="true">←</span>
                    Lobby
                </router-link>
                <h1 class="text-2xl font-semibold">Game</h1>
                <div class="flex items-center gap-2 text-xs text-gray-200">
                    <span class="text-gray-400">Rules:</span>
                    <template v-if="currentGame?.rules?.length">
                        <span
                          v-for="rule in currentGame.rules"
                          :key="rule"
                          class="rounded-full bg-gray-800 px-3 py-1"
                        >
                          {{ slugToTitle(rule) }}
                        </span>
                    </template>
                    <span v-else class="rounded-full bg-gray-800 px-3 py-1">Standard</span>
                </div>
            </div>
            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-200">
                <div class="flex items-center gap-2">
                    <span class="text-gray-400">Players:</span>
                    <span
                      v-for="(player, index) in currentGame.players"
                      :key="player"
                      class="font-medium"
                    >
                        {{ usernameFor(player) }}<span v-if="index < currentGame.players.length - 1">,</span>
                    </span>
                </div>
                <div v-if="currentPlayerId" class="flex items-center gap-2 border-l border-gray-700 pl-4">
                    <span class="text-gray-400">Current turn:</span>
                    <span class="font-semibold text-white">{{ usernameFor(currentPlayerId) }}</span>
                </div>
            </div>
        </div>
    </header>
    <main v-if="publicState" class="container mx-auto relative -top-6 px-3 py-3 max-w-[1600px]">
        <div id="grid" class="grid gap-3 grid-cols-1 lg:grid-cols-12 lg:grid-rows-[auto_1fr]">
            <Scoreboard 
              class="col-span-1 lg:col-span-4 w-full order-1 lg:order-1"
              :players="publicState.players"
              :chains="publicState.chains"
              :current-player-id="currentPlayerId"
              :username-map="usernameMap"
            />
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
                </div>
            </div>
            <div id="moves" class="card flex flex-col col-span-1 lg:col-span-2 order-2 lg:order-2 max-h-[600px]">
                <h2 class="mt-3 mb-3 text-base">Moves</h2>
                <div class="flow-root overflow-y-auto flex-1">
                    <ul class="-mb-4">
                        <li v-for="move in moves" :key="move.created_at || move.move_value">
                            <div class="relative pb-4">
                                <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                <div class="relative flex items-start space-x-3">
                                    <div>
                                        <div class="relative px-1">
                                            <div class="h-6 w-6 bg-violet-200 text-violet-500 rounded-full ring-4 ring-white flex items-center justify-center">
                                                <svg v-if="move.move_type === 'tile'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fill-rule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clip-rule="evenodd" />
                                                </svg>
                                                <svg v-else-if="move.move_type === 'purchase'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
                                                </svg>
                                                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="min-w-0 py-0">
                                        <div class="text-sm leading-1 mt-0.5 text-gray-500">
                                            <span class="mr-2.5 block">
                                                <!-- aquiremonstress played A-2 -->
                                                <span class="text-black">{{ usernameFor(move.player) }}</span> 
                                                {{ formatMoveAction(move.move_type) }} 
                                                <span class="text-black">{{ move.move_value }}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
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
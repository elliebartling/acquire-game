<template>
  <div class="card overflow-x-auto pt-4">
    <!-- <h2 class="mt-4 mb-3 text-base">Scoreboard</h2> -->
    <div v-if="players.length === 0" class="text-sm text-gray-500 mb-3">
      No players yet
    </div>
    <table class="w-full text-sm border-collapse">
      <thead>
        <tr class="border-b-2 border-gray-300">
          <th class="text-left py-2 px-2 font-semibold text-gray-900 bg-gray-50 sticky left-0 z-10 text-sm min-w-[120px]">Player</th>
          <th
            v-for="chain in orderedChains"
            :key="chain.id"
            class="text-center py-2 px-2 font-bold text-sm min-w-[45px]"
            :class="getChainHeaderClass(chain.name)"
          >
            {{ getChainInitial(chain.name) }}
          </th>
          <th class="text-center py-2 px-2 font-semibold text-gray-900 text-sm min-w-[60px]">Cash</th>
          <th class="text-center py-2 px-2 font-semibold text-gray-900 text-sm min-w-[60px]">Net</th>
        </tr>
      </thead>
      <tbody>
        <!-- Player rows -->
        <tr
          v-for="player in players"
          :key="player.id"
          class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
          :class="isCurrentPlayer(player.id) ? 'bg-violet-50' : ''"
        >
          <td class="py-2 px-2 sticky left-0 z-10 bg-white" :class="isCurrentPlayer(player.id) ? 'bg-violet-50' : 'bg-white'">
            <div class="flex items-center gap-2">
              <img
                v-if="getPlayerAvatar(player.id)"
                :src="getPlayerAvatar(player.id)"
                :alt="getUsernameById(player.id)"
                class="w-8 h-8 rounded-full object-cover border-2 shadow-sm"
                :class="isCurrentPlayer(player.id) ? 'border-violet-400' : 'border-gray-300'"
              />
              <div
                v-else
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm"
                :style="{ backgroundColor: getPlayerColor(player.id) }"
              >
                {{ getUserInitial(player.id) }}
              </div>
              <div class="flex items-center gap-1.5">
                <span class="font-semibold text-gray-900 text-sm">{{ getUsernameById(player.id) }}</span>
                <span v-if="isCurrentPlayer(player.id)" class="h-2 w-2 rounded-full bg-violet-600" title="Current Turn"></span>
              </div>
            </div>
          </td>
          <td
            v-for="chain in orderedChains"
            :key="chain.id"
            class="text-center py-2 px-2 tabular-nums text-sm"
          >
            <span v-if="getPlayerStock(player, chain.name) > 0" class="font-semibold text-gray-900">
              {{ getPlayerStock(player, chain.name) }}
            </span>
            <span v-else class="text-gray-300 text-xs">—</span>
          </td>
          <td class="text-center py-2 px-2 tabular-nums text-sm font-medium text-gray-700">
            {{ formatCashCompact(player.cash) }}
          </td>
          <td class="text-center py-2 px-2 tabular-nums text-sm font-bold text-gray-900 bg-emerald-50">
            {{ formatCashCompact(player.netWorth) }}
          </td>
        </tr>
        
        <!-- Separator -->
        <tr class="border-t-2 border-gray-300">
          <td colspan="100%" class="h-2 bg-gray-50"></td>
        </tr>
        
        <!-- Chain info rows -->
        <tr class="border-b border-gray-200">
          <td class="py-2 px-2 text-xs font-bold text-gray-700 uppercase sticky left-0 z-10 bg-blue-0">Available</td>
          <td
            v-for="chain in orderedChains"
            :key="'available-' + chain.id"
            class="text-center py-2 px-2 tabular-nums text-sm font-semibold text-gray-900 bg-blue-0"
          >
            {{ chain.stockRemaining }}
          </td>
          <td colspan="2" class=""></td>
        </tr>
        
        <tr class="border-b border-gray-200">
          <td class="py-2 px-2 text-xs font-bold text-gray-700 uppercase sticky left-0 z-10 bg-blue-0">Size</td>
          <td
            v-for="chain in orderedChains"
            :key="'size-' + chain.id"
            class="text-center py-2 px-2 tabular-nums text-sm font-semibold text-gray-900 bg-blue-0"
          >
            {{ chain.size > 0 ? chain.size : '—' }}
          </td>
          <td colspan="2" class="bg-blue-0"></td>
        </tr>
        
        <tr class="bg-blue-0">
          <td class="py-2 px-2 text-xs font-bold text-gray-700 uppercase sticky left-0 z-10 bg-blue-0">Price</td>
          <td
            v-for="chain in orderedChains"
            :key="'price-' + chain.id"
            class="text-center py-2 px-2 tabular-nums text-sm font-semibold text-gray-900 bg-blue-0"
          >
            <span v-if="chain.size > 0">${{ formatPriceCompact(getStockPrice(chain.size, chain.name)) }}</span>
            <span v-else class="text-gray-400">—</span>
          </td>
          <td colspan="2" class="bg-blue-0"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { getChainBoardClass } from '@/constants/chainColors'
import { calculateStockPrice } from '@/game/logic/stock'

// Standard chain order (matching the classic Acquire board game)
const CHAIN_ORDER = ['Luxor', 'Tower', 'American', 'Festival', 'Worldwide', 'Continental', 'Imperial']

export default {
  name: 'Scoreboard',
  props: {
    players: {
      type: Array,
      required: true
    },
    chains: {
      type: Array,
      required: true
    },
    currentPlayerId: {
      type: String,
      default: null
    },
    usernameMap: {
      type: Object,
      default: () => ({})
    },
    avatarMap: {
      type: Object,
      default: () => ({})
    }
  },
  mounted() {
    console.log('[Scoreboard] Mounted with players:', this.players)
    console.log('[Scoreboard] Player count:', this.players?.length)
    console.log('[Scoreboard] Chains:', this.chains)
  },
  computed: {
    orderedChains() {
      // Sort chains by the standard order
      return [...this.chains].sort((a, b) => {
        const indexA = CHAIN_ORDER.indexOf(a.name)
        const indexB = CHAIN_ORDER.indexOf(b.name)
        return indexA - indexB
      })
    }
  },
  methods: {
    getChainInitial(chainName) {
      return chainName.charAt(0)
    },
    getChainHeaderClass(chainName) {
      const boardClass = getChainBoardClass(chainName)
      return [boardClass, 'text-white']
    },
    getChainTextColorClass(chainName) {
      // Map chain names to text color classes
      const colorMap = {
        'Luxor': 'text-red-600',
        'Tower': 'text-yellow-600',
        'American': 'text-blue-600',
        'Worldwide': 'text-amber-700',
        'Festival': 'text-emerald-600',
        'Imperial': 'text-pink-600',
        'Continental': 'text-cyan-600'
      }
      return colorMap[chainName] || 'text-gray-600'
    },
    getPlayerStock(player, chainName) {
      return player.stocks?.[chainName] || 0
    },
    isCurrentPlayer(playerId) {
      return this.currentPlayerId === playerId
    },
    getUsernameById(playerId) {
      return this.usernameMap[playerId] || 'Unknown'
    },
    getUserInitial(playerId) {
      const username = this.getUsernameById(playerId)
      return username.charAt(0).toUpperCase()
    },
    getPlayerAvatar(playerId) {
      return this.avatarMap[playerId] || null
    },
    getPlayerColor(playerId) {
      // Generate a consistent color based on player ID
      const colors = [
        '#8b5cf6', // violet
        '#ec4899', // pink
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // amber
        '#ef4444', // red
      ]
      // Simple hash function to get consistent color per player
      let hash = 0
      for (let i = 0; i < playerId.length; i++) {
        hash = playerId.charCodeAt(i) + ((hash << 5) - hash)
      }
      return colors[Math.abs(hash) % colors.length]
    },
    getStockPrice(chainSize, chainName) {
      return calculateStockPrice(chainSize, chainName)
    },
    formatPrice(price) {
      // Format price in hundreds (e.g., 600 -> "600")
      return price.toLocaleString()
    },
    formatPriceCompact(price) {
      // Compact format for prices (no separators for space saving)
      return price.toString()
    },
    formatCash(amount) {
      if (!amount && amount !== 0) return '0'
      return amount.toLocaleString()
    },
    formatCashCompact(amount) {
      // More compact cash display with K suffix for thousands
      if (!amount && amount !== 0) return '$0'
      if (amount >= 1000) {
        const k = Math.floor(amount / 100) / 10
        return `$${k}k`
      }
      return `$${amount}`
    }
  }
}
</script>

<style scoped>
/* Ensure sticky column works properly */
.sticky {
  position: sticky;
}

/* Add subtle shadow to sticky column for depth */
.sticky.left-0 {
  box-shadow: 2px 0 4px -2px rgba(0, 0, 0, 0.1);
}

/* Smooth hover transitions */
tr {
  transition: background-color 0.15s ease;
}

/* Ensure proper z-index layering */
thead th.sticky {
  z-index: 20;
}

tbody td.sticky {
  z-index: 10;
}
</style>


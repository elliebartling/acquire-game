<template>
  <div class="card overflow-x-auto">
    <h2 class="mt-4 mb-3 text-base">Scoreboard</h2>
    <div v-if="players.length === 0" class="text-xs text-gray-500 mb-3">
      No players yet
    </div>
    <table class="w-full text-xs border-collapse">
      <thead>
        <tr class="border-b-2 border-gray-300">
          <th class="text-center py-2 px-1 font-semibold text-gray-900 bg-gray-50 sticky left-0 z-10 text-xs w-6"></th>
          <th
            v-for="player in players"
            :key="player.id"
            class="text-center py-2 px-1.5 font-semibold text-xs min-w-[45px]"
            :class="isCurrentPlayer(player.id) ? 'bg-violet-100 text-violet-900' : 'bg-gray-50 text-gray-900'"
            :title="getUsernameById(player.id)"
          >
            <div class="flex flex-col items-center gap-1">
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                :style="{ backgroundColor: getPlayerColor(player.id) }"
              >
                {{ getUserInitial(player.id) }}
              </div>
              <span v-if="isCurrentPlayer(player.id)" class="text-[10px] text-violet-600 leading-none">●</span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- Chain stock rows -->
        <tr
          v-for="chain in orderedChains"
          :key="chain.id"
          class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <td class="py-1.5 px-1 font-black text-xs sticky left-0 z-10 text-center bg-white" :title="chain.name">
            <span :class="getChainTextColorClass(chain.name)">{{ getChainInitial(chain.name) }}</span>
          </td>
          <td
            v-for="player in players"
            :key="player.id"
            class="text-center py-1.5 px-1.5 tabular-nums text-xs"
          >
            <span v-if="getPlayerStock(player, chain.name) > 0" class="font-semibold text-gray-900">
              {{ getPlayerStock(player, chain.name) }}
            </span>
            <span v-else class="text-gray-300 text-[10px]">—</span>
          </td>
        </tr>
        
        <!-- Separator -->
        <tr class="border-t-2 border-gray-300">
          <td colspan="100%" class="h-2"></td>
        </tr>
        
        <!-- Cash row -->
        <tr class="bg-gray-50 border-b border-gray-200">
          <td class="py-1.5 px-1 text-[10px] font-bold text-gray-700 uppercase sticky left-0 bg-gray-50 z-10 text-center">$</td>
          <td
            v-for="player in players"
            :key="'cash-' + player.id"
            class="text-center py-1.5 px-1.5 tabular-nums text-xs font-medium text-gray-700"
          >
            {{ formatCashCompact(player.cash) }}
          </td>
        </tr>
        
        <!-- Net Worth row -->
        <tr class="bg-emerald-50 font-medium">
          <td class="py-1.5 px-1 text-[10px] font-bold text-gray-700 uppercase sticky left-0 bg-emerald-50 z-10 text-center">Σ</td>
          <td
            v-for="player in players"
            :key="'net-' + player.id"
            class="text-center py-1.5 px-1.5 tabular-nums text-xs font-bold text-gray-900"
          >
            {{ formatCashCompact(player.netWorth) }}
          </td>
        </tr>
        
      </tbody>
    </table>
    
    <!-- Chain info summary -->
    <div class="mt-3 pt-3 border-t border-gray-200">
      <div class="grid grid-cols-7 gap-1 text-[10px]">
        <div
          v-for="chain in orderedChains"
          :key="'info-' + chain.id"
          class="text-center"
        >
          <div class="font-bold text-white px-1 py-0.5 rounded mb-0.5" :class="getChainHeaderClass(chain.name)">
            {{ getChainInitial(chain.name) }}
          </div>
          <div class="text-gray-600">
            <div>{{ chain.size > 0 ? chain.size : '—' }}</div>
            <div class="font-semibold text-gray-900">{{ chain.stockRemaining }}</div>
            <div v-if="chain.size > 0" class="text-gray-700">${{ formatPriceCompact(getStockPrice(chain.size, chain.name)) }}</div>
            <div v-else class="text-gray-400">—</div>
          </div>
        </div>
      </div>
      <div class="text-[9px] text-gray-500 mt-1 text-center">
        Size • Available • Price
      </div>
    </div>
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
      return boardClass
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


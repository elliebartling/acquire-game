<template>
  <div class="space-y-3">
    <h3 class="text-xs font-semibold text-gray-900">Dispose of Stock</h3>
    
    <div class="text-xs text-gray-600 mb-2">
      <p>
        You have <span class="font-semibold text-gray-900">{{ playerShares }}</span> shares in 
        <span class="font-semibold" :class="getChainTextClass(defunctChainName)">{{ defunctChainName }}</span>
        (defunct chain, size {{ defunctChainSize }}).
      </p>
      <p class="mt-1">
        Surviving chain: <span class="font-semibold" :class="getChainTextClass(survivingChainName)">{{ survivingChainName }}</span>
      </p>
    </div>
    
    <!-- Options in a row -->
    <div class="grid grid-cols-3 gap-2">
      <!-- Hold option -->
      <div class="flex flex-col">
        <label class="text-[10px] font-semibold text-gray-600 uppercase mb-1.5 text-center">Hold</label>
        <div class="relative">
          <input
            type="number"
            v-model.number="holdShares"
            :min="0"
            :max="maxHoldShares"
            class="w-full px-8 py-1.5 text-xs border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="0"
          />
          <button
            type="button"
            @click="decrementHold"
            :disabled="holdShares <= 0"
            class="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            −
          </button>
          <button
            type="button"
            @click="incrementHold"
            :disabled="holdShares >= maxHoldShares"
            class="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
        </div>
      </div>
      
      <!-- Sell option -->
      <div class="flex flex-col">
        <label class="text-[10px] font-semibold text-gray-600 uppercase mb-1.5 text-center">
          Sell (${{ sellPrice }}/share)
        </label>
        <div class="relative">
          <input
            type="number"
            v-model.number="sellShares"
            :min="0"
            :max="maxSellShares"
            class="w-full px-8 py-1.5 text-xs border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="0"
          />
          <button
            type="button"
            @click="decrementSell"
            :disabled="sellShares <= 0"
            class="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            −
          </button>
          <button
            type="button"
            @click="incrementSell"
            :disabled="sellShares >= maxSellShares"
            class="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
        </div>
        <div v-if="sellShares > 0" class="text-[10px] text-gray-600 mt-0.5 text-center">
          = ${{ (sellShares || 0) * sellPrice }}
        </div>
      </div>
      
      <!-- Trade option -->
      <div class="flex flex-col">
        <label class="text-[10px] font-semibold text-gray-600 uppercase mb-1.5 text-center">
          Trade (2:1)
          <span v-if="!canTrade" class="block text-[9px] text-gray-400 mt-0.5 normal-case">
            (unavailable)
          </span>
        </label>
        <div class="relative">
          <input
            type="number"
            v-model.number="tradeShares"
            :min="0"
            :max="maxTradeShares"
            :step="2"
            :disabled="!canTrade"
            class="w-full px-8 py-1.5 text-xs border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="0"
          />
          <button
            type="button"
            @click="decrementTrade"
            :disabled="tradeShares <= 0 || !canTrade"
            class="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            −
          </button>
          <button
            type="button"
            @click="incrementTrade"
            :disabled="tradeShares >= maxTradeShares || !canTrade"
            class="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
        </div>
        <div v-if="tradeShares > 0 && canTrade" class="text-[10px] text-gray-600 mt-0.5 text-center">
          → {{ (tradeShares || 0) / 2 }} share(s)
        </div>
      </div>
    </div>
    
    <!-- Summary -->
    <div class="text-xs pt-2 border-t border-gray-200">
      <div class="flex justify-between items-center mb-1">
        <span class="text-gray-600">Total disposed:</span>
        <span class="font-semibold" :class="totalDisposed === playerShares ? 'text-gray-900' : 'text-orange-600'">
          {{ totalDisposed }} / {{ playerShares }}
        </span>
      </div>
      <div v-if="totalDisposed < playerShares" class="text-[10px] text-orange-600">
        You must dispose of all {{ playerShares }} shares
      </div>
      <div v-if="totalDisposed > playerShares" class="text-[10px] text-red-600">
        Cannot dispose more than {{ playerShares }} shares
      </div>
      <div v-if="tradeShares > 0 && tradeShares % 2 !== 0" class="text-[10px] text-red-600">
        Trade shares must be a multiple of 2
      </div>
    </div>
    
    <!-- Action buttons -->
    <div class="flex gap-1.5 pt-2 border-t border-gray-200">
      <button
        class="flex-1 px-3 py-1.5 rounded font-semibold text-xs shadow-sm bg-violet-600 text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!canSubmit || isProcessing"
        @click="submitDisposal"
      >
        {{ isProcessing ? '...' : 'Submit' }}
      </button>
    </div>
  </div>
</template>

<script>
import { reactive, computed } from 'vue'
import { getChainButtonClass } from '@/constants/chainColors'
import { calculateStockPrice } from '@/game/logic/stock'

export default {
  name: 'StockDisposalWidget',
  props: {
    defunctChainName: {
      type: String,
      required: true
    },
    defunctChainSize: {
      type: Number,
      required: true
    },
    survivingChainName: {
      type: String,
      required: true
    },
    playerShares: {
      type: Number,
      required: true
    },
    survivingChainStockRemaining: {
      type: Number,
      default: 0
    }
  },
  emits: ['dispose'],
  setup(props, { emit }) {
    const holdShares = reactive({ value: 0 })
    const sellShares = reactive({ value: 0 })
    const tradeShares = reactive({ value: 0 })
    const isProcessing = reactive({ value: false })
    
    const sellPrice = computed(() => {
      return calculateStockPrice(props.defunctChainSize, props.defunctChainName)
    })
    
    const canTrade = computed(() => {
      return props.survivingChainStockRemaining > 0
    })
    
    const maxTradeShares = computed(() => {
      const maxByStock = props.survivingChainStockRemaining * 2
      return Math.min(props.playerShares, maxByStock)
    })
    
    const totalDisposed = computed(() => {
      return (holdShares.value || 0) + (sellShares.value || 0) + (tradeShares.value || 0)
    })
    
    const maxHoldShares = computed(() => {
      return props.playerShares - (sellShares.value || 0) - (tradeShares.value || 0)
    })
    
    const maxSellShares = computed(() => {
      return props.playerShares - (holdShares.value || 0) - (tradeShares.value || 0)
    })
    
    const maxTradeSharesAvailable = computed(() => {
      const remaining = props.playerShares - (holdShares.value || 0) - (sellShares.value || 0)
      const maxByStock = props.survivingChainStockRemaining * 2
      return Math.min(remaining, maxByStock)
    })
    
    const canSubmit = computed(() => {
      const total = totalDisposed.value
      const isValidTotal = total === props.playerShares
      const isValidTrade = (tradeShares.value || 0) % 2 === 0
      const isValidTradeAmount = (tradeShares.value || 0) <= maxTradeSharesAvailable.value
      return isValidTotal && isValidTrade && isValidTradeAmount && !isProcessing.value
    })
    
    const getChainTextClass = (chainName) => {
      const buttonClass = getChainButtonClass(chainName)
      // Extract text color from button class
      if (buttonClass.includes('text-white')) return 'text-gray-900'
      return buttonClass.split(' ').find(c => c.startsWith('text-')) || 'text-gray-900'
    }
    
    const incrementHold = () => {
      if (holdShares.value < maxHoldShares.value) {
        holdShares.value = Math.min(maxHoldShares.value, (holdShares.value || 0) + 1)
      }
    }
    
    const decrementHold = () => {
      if (holdShares.value > 0) {
        holdShares.value = Math.max(0, (holdShares.value || 0) - 1)
      }
    }
    
    const incrementSell = () => {
      if (sellShares.value < maxSellShares.value) {
        sellShares.value = Math.min(maxSellShares.value, (sellShares.value || 0) + 1)
      }
    }
    
    const decrementSell = () => {
      if (sellShares.value > 0) {
        sellShares.value = Math.max(0, (sellShares.value || 0) - 1)
      }
    }
    
    const incrementTrade = () => {
      if (tradeShares.value < maxTradeSharesAvailable.value) {
        const current = tradeShares.value || 0
        const next = Math.min(maxTradeSharesAvailable.value, current + 2)
        tradeShares.value = Math.floor(next / 2) * 2 // Ensure it's even
      }
    }
    
    const decrementTrade = () => {
      if (tradeShares.value > 0) {
        const current = tradeShares.value || 0
        tradeShares.value = Math.max(0, current - 2)
      }
    }
    
    const submitDisposal = () => {
      if (!canSubmit.value || isProcessing.value) return
      
      isProcessing.value = true
      
      // Build disposal actions array
      const actions = []
      if (holdShares.value > 0) {
        actions.push({ action: 'hold', shares: holdShares.value })
      }
      if (sellShares.value > 0) {
        actions.push({ action: 'sell', shares: sellShares.value })
      }
      if (tradeShares.value > 0) {
        actions.push({ action: 'trade', shares: tradeShares.value })
      }
      
      emit('dispose', {
        actions: actions
      })
    }
    
    
    return {
      holdShares: computed({
        get: () => {
          const val = holdShares.value || 0
          const max = maxHoldShares.value
          return Math.max(0, Math.min(max, val))
        },
        set: (val) => {
          const max = maxHoldShares.value
          holdShares.value = Math.max(0, Math.min(max, val || 0))
        }
      }),
      sellShares: computed({
        get: () => {
          const val = sellShares.value || 0
          const max = maxSellShares.value
          return Math.max(0, Math.min(max, val))
        },
        set: (val) => {
          const max = maxSellShares.value
          sellShares.value = Math.max(0, Math.min(max, val || 0))
        }
      }),
      tradeShares: computed({
        get: () => {
          const val = tradeShares.value || 0
          const max = maxTradeSharesAvailable.value
          let result = Math.max(0, Math.min(max, val))
          // Ensure it's even
          if (result > 0 && result % 2 !== 0) {
            result = Math.floor(result / 2) * 2
          }
          return result
        },
        set: (val) => {
          const max = maxTradeSharesAvailable.value
          let newVal = val || 0
          if (newVal < 0) newVal = 0
          if (newVal > max) {
            newVal = Math.floor(max / 2) * 2
          }
          // Ensure it's even
          if (newVal > 0 && newVal % 2 !== 0) {
            newVal = Math.floor(newVal / 2) * 2
          }
          tradeShares.value = newVal
        }
      }),
      isProcessing: computed(() => isProcessing.value),
      sellPrice,
      canTrade,
      maxTradeShares: maxTradeSharesAvailable,
      maxHoldShares,
      maxSellShares,
      totalDisposed,
      canSubmit,
      getChainTextClass,
      incrementHold,
      decrementHold,
      incrementSell,
      decrementSell,
      incrementTrade,
      decrementTrade,
      submitDisposal
    }
  }
}
</script>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>


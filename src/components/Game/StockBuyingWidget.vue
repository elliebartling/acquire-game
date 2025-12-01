<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-900">Buy Stock</h3>
      <p class="text-xs text-gray-500">
        Up to {{ maxShares }} share{{ maxShares !== 1 ? 's' : '' }} total
      </p>
    </div>
    
    <div class="space-y-3">
      <div
        v-for="chain in purchasableChains"
        :key="chain.id"
        class="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <div
              class="w-3 h-3 rounded-full flex-shrink-0"
              :class="getChainColorClass(chain.name)"
            ></div>
            <p class="font-medium text-sm text-gray-900 truncate">{{ chain.name }}</p>
          </div>
          <p class="text-xs text-gray-500">
            ${{ getStockPrice(chain.size) }} per share • {{ chain.stockRemaining }} available
          </p>
        </div>
        
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 bg-white rounded-lg border border-gray-300 shadow-sm">
            <button
              type="button"
              class="px-2.5 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-l-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="quantities[chain.name] === 0"
              @click="decrementQuantity(chain.name)"
              aria-label="Decrease quantity"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4" />
              </svg>
            </button>
            
            <span class="w-8 text-center text-sm font-medium text-gray-900 tabular-nums">
              {{ quantities[chain.name] || 0 }}
            </span>
            
            <button
              type="button"
              class="px-2.5 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-r-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="!canIncrement(chain.name, chain.stockRemaining)"
              @click="incrementQuantity(chain.name)"
              aria-label="Increase quantity"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          <div class="w-16 text-right text-sm font-medium text-gray-900 tabular-nums">
            ${{ getChainTotal(chain.name, chain.size) }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="flex items-center justify-between pt-3 border-t border-gray-200">
      <p class="text-sm font-semibold text-gray-900">Total</p>
      <p class="text-lg font-bold text-gray-900 tabular-nums">${{ totalCost }}</p>
    </div>
    
    <div class="flex gap-2">
      <button
        class="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm shadow-sm bg-violet-600 text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="totalShares === 0 || isProcessing"
        @click="completePurchase"
      >
        {{ isProcessing ? 'Processing...' : 'Purchase' }}
      </button>
      
      <button
        class="px-4 py-2.5 rounded-lg font-semibold text-sm shadow-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isProcessing"
        @click="skipPurchase"
      >
        Skip
      </button>
    </div>
  </div>
</template>

<script>
import { reactive, computed } from 'vue'
import { getChainButtonClass } from '@/constants/chainColors'
import { calculateStockPrice } from '@/game/logic/stock'

export default {
  name: 'StockBuyingWidget',
  props: {
    chains: {
      type: Array,
      required: true
    },
    maxShares: {
      type: Number,
      default: 3
    },
    playerCash: {
      type: Number,
      default: 0
    }
  },
  emits: ['purchase', 'skip'],
  setup(props, { emit }) {
    const quantities = reactive({})
    const isProcessing = reactive({ value: false })
    
    // Initialize quantities for all chains
    const initializeQuantities = () => {
      props.chains.forEach(chain => {
        if (chain.size > 0 && chain.stockRemaining > 0) {
          if (quantities[chain.name] === undefined) {
            quantities[chain.name] = 0
          }
        }
      })
    }
    initializeQuantities()
    
    const purchasableChains = computed(() => {
      return props.chains.filter(chain => 
        chain.size > 0 && chain.stockRemaining > 0
      )
    })
    
    const totalShares = computed(() => {
      return Object.values(quantities).reduce((sum, qty) => sum + (qty || 0), 0)
    })
    
    const totalCost = computed(() => {
      let cost = 0
      purchasableChains.value.forEach(chain => {
        const qty = quantities[chain.name] || 0
        if (qty > 0) {
          cost += getStockPrice(chain.size) * qty
        }
      })
      return cost
    })
    
    const getStockPrice = (chainSize) => {
      return calculateStockPrice(chainSize)
    }
    
    const getChainTotal = (chainName, chainSize) => {
      const qty = quantities[chainName] || 0
      return qty * getStockPrice(chainSize)
    }
    
    const getChainColorClass = (chainName) => {
      const buttonClasses = getChainButtonClass(chainName)
      // Extract just the background color for the indicator dot
      // buttonClasses is a string like "bg-red-600 hover:bg-red-500 text-white focus:ring-red-200"
      const bgMatch = buttonClasses.match(/bg-[\w-]+/)
      return bgMatch ? bgMatch[0] : 'bg-gray-400'
    }
    
    const canIncrement = (chainName, stockRemaining) => {
      const currentQty = quantities[chainName] || 0
      const currentChain = purchasableChains.value.find(c => c.name === chainName)
      if (!currentChain) return false
      
      // Check if we've hit the max shares limit
      if (totalShares.value >= props.maxShares) return false
      
      // Check if we've hit the stock limit for this chain
      if (currentQty >= stockRemaining) return false
      
      // Check if we can afford one more share
      const pricePerShare = getStockPrice(currentChain.size)
      if (totalCost.value + pricePerShare > props.playerCash) return false
      
      return true
    }
    
    const incrementQuantity = (chainName) => {
      const chain = purchasableChains.value.find(c => c.name === chainName)
      if (!chain) return
      
      if (canIncrement(chainName, chain.stockRemaining)) {
        quantities[chainName] = (quantities[chainName] || 0) + 1
      }
    }
    
    const decrementQuantity = (chainName) => {
      if (quantities[chainName] > 0) {
        quantities[chainName]--
      }
    }
    
    const completePurchase = async () => {
      if (totalShares.value === 0) return
      
      isProcessing.value = true
      
      // Build array of purchases
      const purchases = []
      purchasableChains.value.forEach(chain => {
        const qty = quantities[chain.name] || 0
        if (qty > 0) {
          purchases.push({ chainName: chain.name, shares: qty })
        }
      })
      
      emit('purchase', purchases)
    }
    
    const skipPurchase = () => {
      emit('skip')
    }
    
    return {
      quantities,
      isProcessing: computed(() => isProcessing.value),
      purchasableChains,
      totalShares,
      totalCost,
      getStockPrice,
      getChainTotal,
      getChainColorClass,
      canIncrement,
      incrementQuantity,
      decrementQuantity,
      completePurchase,
      skipPurchase
    }
  }
}
</script>


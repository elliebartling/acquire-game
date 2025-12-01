<template>
  <div class="space-y-3">
    <h3 class="text-xs font-semibold text-gray-900">Buy Stock</h3>
    
    <!-- Available hotels -->
    <div>
      <p class="text-[10px] font-semibold text-gray-600 uppercase mb-1.5">Available</p>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="chain in purchasableChains"
          :key="chain.id"
          type="button"
          class="stock-chip"
          :class="getChainButtonClass(chain.name)"
          :disabled="!canAddToCart(chain.name)"
          @click="addToCart(chain.name, chain.size)"
          :title="chain.name"
        >
          <div class="flex flex-col items-center gap-0.5">
            <div class="text-xs font-bold">{{ getChainInitial(chain.name) }}</div>
            <div class="text-[10px] font-semibold">${{ getStockPrice(chain.size, chain.name) }}</div>
          </div>
        </button>
      </div>
    </div>
    
    <!-- Cart -->
    <div v-if="cart.length > 0">
      <p class="text-[10px] font-semibold text-gray-600 uppercase mb-1.5">Cart</p>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="(item, index) in cart"
          :key="index"
          type="button"
          class="stock-chip"
          :class="getChainButtonClass(item.chainName)"
          @click="removeFromCart(index)"
          :title="`Remove ${item.chainName}`"
        >
          <div class="text-[10px] font-bold tabular-nums">${{ item.price }}</div>
        </button>
      </div>
    </div>
    
    <!-- Cost summary -->
    <div class="flex items-center justify-between text-xs pt-2 border-t border-gray-200">
      <div class="space-y-0.5">
        <div class="flex items-center gap-2">
          <span class="text-gray-600">Total:</span>
          <span class="font-bold text-gray-900 tabular-nums">${{ totalCost }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-gray-600">Left:</span>
          <span class="font-semibold text-gray-700 tabular-nums">${{ playerCash - totalCost }}</span>
        </div>
      </div>
      
      <div class="flex gap-1.5">
        <button
          class="px-3 py-1.5 rounded font-semibold text-xs shadow-sm bg-violet-600 text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="cart.length === 0 || isProcessing"
          @click="completePurchase"
        >
          {{ isProcessing ? '...' : 'OK' }}
        </button>
        
        <button
          class="px-3 py-1.5 rounded font-semibold text-xs shadow-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isProcessing"
          @click="skipPurchase"
        >
          Skip
        </button>
      </div>
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
    const cart = reactive([])
    const isProcessing = reactive({ value: false })
    
    const purchasableChains = computed(() => {
      return props.chains.filter(chain => 
        chain.size > 0 && chain.stockRemaining > 0
      )
    })
    
    const totalCost = computed(() => {
      return cart.reduce((sum, item) => sum + item.price, 0)
    })
    
    const getStockPrice = (chainSize, chainName) => {
      return calculateStockPrice(chainSize, chainName)
    }
    
    const getChainInitial = (chainName) => {
      return chainName.charAt(0)
    }
    
    const canAddToCart = (chainName) => {
      // Check max shares limit
      if (cart.length >= props.maxShares) return false
      
      // Check if we can afford it
      const chain = purchasableChains.value.find(c => c.name === chainName)
      if (!chain) return false
      
      const price = getStockPrice(chain.size, chain.name)
      if (totalCost.value + price > props.playerCash) return false
      
      // Check stock availability for this chain
      const chainCount = cart.filter(item => item.chainName === chainName).length
      if (chainCount >= chain.stockRemaining) return false
      
      return true
    }
    
    const addToCart = (chainName, chainSize) => {
      if (!canAddToCart(chainName)) return
      
      const price = getStockPrice(chainSize, chainName)
      cart.push({ chainName, price })
    }
    
    const removeFromCart = (index) => {
      cart.splice(index, 1)
    }
    
    const completePurchase = async () => {
      if (cart.length === 0) return
      
      isProcessing.value = true
      
      // Group purchases by chain
      const purchaseMap = {}
      cart.forEach(item => {
        if (!purchaseMap[item.chainName]) {
          purchaseMap[item.chainName] = 0
        }
        purchaseMap[item.chainName]++
      })
      
      const purchases = Object.entries(purchaseMap).map(([chainName, shares]) => ({
        chainName,
        shares
      }))
      
      emit('purchase', purchases)
    }
    
    const skipPurchase = () => {
      emit('skip')
    }
    
    return {
      cart,
      isProcessing: computed(() => isProcessing.value),
      purchasableChains,
      totalCost,
      getStockPrice,
      getChainInitial,
      getChainButtonClass,
      canAddToCart,
      addToCart,
      removeFromCart,
      completePurchase,
      skipPurchase
    }
  }
}
</script>

<style scoped>
.stock-chip {
  @apply w-12 h-12 rounded flex items-center justify-center shadow-sm transition-colors;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-1;
}

.stock-chip:hover:not(:disabled) {
  @apply ring-2 ring-offset-1;
}

.stock-chip:active:not(:disabled) {
  @apply ring-2 ring-offset-2;
}

.stock-chip:disabled {
  @apply opacity-40 cursor-not-allowed;
}
</style>

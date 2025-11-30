<template>
  <div class="card">
    <h2 class="mt-4 mb-4">Stock Market</h2>
    <div class="space-y-3">
      <div
        v-for="chain in chains"
        :key="chain.id"
        class="flex items-center justify-between"
      >
        <div>
          <p class="font-medium text-sm text-gray-900">{{ chain.name }}</p>
          <p class="text-xs text-gray-500">{{ chain.size }} tiles • {{ chain.stockRemaining }} shares left</p>
        </div>
        <button
          class="button primary text-xs"
          :disabled="!canBuy"
          @click="$emit('buy-stock', chain)"
        >
          Buy
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StockPanel',
  props: {
    chains: {
      type: Array,
      default: () => []
    },
    canBuy: {
      type: Boolean,
      default: true
    }
  },
  emits: ['buy-stock']
}
</script>


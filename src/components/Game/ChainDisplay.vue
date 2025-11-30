<template>
  <div class="card">
    <h2 class="mt-4 mb-4">Chains</h2>
    <ul class="space-y-2">
      <li v-for="chain in chains" :key="chain.id" class="flex justify-between items-center">
        <div>
          <p class="text-sm font-medium text-gray-900">{{ chain.name }}</p>
          <p class="text-xs text-gray-500">Tiles: {{ chain.size }} • Stock: {{ chain.stockRemaining }}</p>
        </div>
        <span
          class="px-2 py-1 text-xs rounded-full"
          :class="chain.isSafe ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'"
        >
          {{ chain.isSafe ? 'Safe' : 'Open' }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'ChainDisplay',
  props: {
    chains: {
      type: Array,
      default: () => []
    }
  }
}
</script>


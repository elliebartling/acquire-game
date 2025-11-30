<template>
  <div :class="wrapperClass">
    <component
      :is="embedded ? 'div' : 'h2'"
      :class="embedded ? 'text-sm font-semibold text-gray-900 mb-2' : 'mt-4 mb-4 text-lg font-semibold text-gray-900'"
    >
      Your hand
    </component>
    <div v-if="!hand || hand.length === 0" class="text-sm text-gray-500">
      No tiles in hand yet.
    </div>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="tile in hand"
        :key="tile"
        class="hand-tile"
        :disabled="disabled"
        @click="$emit('play-tile', tile)"
      >
        {{ tile }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayerHand',
  props: {
    hand: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    embedded: {
      type: Boolean,
      default: false
    }
  },
  emits: ['play-tile'],
  computed: {
    wrapperClass() {
      return this.embedded ? '' : 'card'
    }
  }
}
</script>

<style scoped>
.hand-tile {
  @apply rounded border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800 bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>


<template>
  <button
    class="tile text-xs xl:text-base"
    :class="[variantClass, tileInfo && chainClass ? chainClass : '']"
    :disabled="disabled || Boolean(tileInfo)"
    @click="handleClick"
  >
    {{ tileKey }}
  </button>
</template>

<script>
export default {
  name: 'BoardTile',
  props: {
    tileKey: {
      type: String,
      required: true
    },
    tileInfo: {
      type: Object,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    chainClass: {
      type: String,
      default: ''
    }
  },
  emits: ['play-tile'],
  computed: {
    variantClass() {
      if (!this.tileInfo) return 'playable'
      return this.chainClass ? 'played-colored' : 'played-default'
    }
  },
  methods: {
    handleClick() {
      if (this.disabled || this.tileInfo) return
      this.$emit('play-tile', this.tileKey)
    }
  }
}
</script>

<style scoped>
.tile {
  @apply rounded aspect-square flex justify-center items-center text-center font-medium transition-colors;
}
.tile.playable {
  @apply bg-gray-100 text-gray-800;
}
.tile.playable:hover {
  @apply bg-gray-200;
}
.tile.played-default {
  @apply bg-gray-900 text-white cursor-not-allowed shadow-sm rounded;
}
.tile.played-colored {
  @apply cursor-not-allowed shadow-sm rounded;
}
</style>
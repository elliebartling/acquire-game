<template>
  <button
    class="tile text-[10px] sm:text-xs lg:text-sm"
    :class="variantClasses"
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
    },
    inHand: {
      type: Boolean,
      default: false
    },
    tileHint: {
      type: Object,
      default: null
    }
  },
  emits: ['play-tile'],
  computed: {
    variantClasses() {
      if (this.tileInfo) {
        const playedClass = this.chainClass ? 'played-colored' : 'played-default'
        return this.chainClass ? [playedClass, this.chainClass] : [playedClass]
      }
      const status = this.tileHint?.status
      const base = this.inHand ? ['hand-highlight'] : ['playable']
      switch (status) {
        case 'merge':
          base.push('tile-merge')
          break
        case 'grow':
          base.push('tile-grow')
          break
        case 'seed':
          base.push('tile-seed')
          break
        case 'blocked':
          return ['tile-blocked']
        default:
          break
      }
      return base
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

<style scoped lang="postcss">
.tile {
  @apply rounded aspect-square flex justify-center items-center text-center font-medium transition-colors;
}
.tile.playable {
  @apply bg-gray-100 text-gray-800;
}
.tile.playable:hover {
  @apply bg-gray-200;
}
.tile.hand-highlight {
  @apply bg-gray-200 text-gray-800 border border-gray-200;
}
.tile.hand-highlight:hover {
  @apply bg-gray-300;
}
.tile.tile-grow {
  @apply border border-gray-400;
}
.tile.tile-seed {
  @apply bg-gray-300 text-gray-900 border border-gray-400;
}
.tile.tile-merge {
  background-color: #e5e7eb;
  background-image: repeating-linear-gradient(
    135deg,
    rgba(156, 163, 175, 0.25),
    rgba(156, 163, 175, 0.25) 10px,
    transparent 10px,
    transparent 20px
  );
  @apply text-gray-800 border border-gray-300;
}
.tile.tile-blocked {
  @apply bg-gray-200 text-gray-400 border border-gray-300;
}
.tile.played-default {
  @apply bg-gray-900 text-white cursor-not-allowed shadow-sm rounded;
}
.tile.played-colored {
  @apply cursor-not-allowed shadow-sm rounded;
}
</style>
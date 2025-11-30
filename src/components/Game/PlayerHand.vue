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
        v-for="entry in handEntries"
        :key="entry.key"
        :class="tileClasses(entry.display)"
        :disabled="isTileDisabled(entry.display)"
        @click="$emit('play-tile', entry.raw)"
      >
        {{ entry.display }}
      </button>
    </div>
  </div>
</template>

<script>
import { getChainButtonClass } from '@/constants/chainColors'

export default {
  name: 'PlayerHand',
  props: {
    hand: {
      type: Array,
      default: () => []
    },
    handHints: {
      type: Object,
      default: () => ({})
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
    },
    handEntries() {
      return (this.hand || []).map((raw, index) => {
        const normalized =
          typeof raw === 'string'
            ? raw.toUpperCase()
            : (raw?.toString?.() ?? '').toUpperCase()
        return {
          key: `${normalized}-${index}`,
          display: normalized || '—',
          raw: raw ?? normalized
        }
      })
    }
  },
  methods: {
    hintFor(tileKey) {
      if (!tileKey) return { status: 'neutral' }
      const normalized =
        typeof tileKey === 'string'
          ? tileKey.toUpperCase()
          : tileKey?.toString?.().toUpperCase?.()
      return this.handHints[normalized] || { status: 'neutral' }
    },
    tileClasses(tile) {
      const base = ['hand-tile']
      const hint = this.hintFor(tile)
      if (hint.status === 'blocked') {
        base.push('hand-tile--blocked')
        return base
      }
      if (hint.status === 'merge') {
        base.push('hand-tile--merge')
        return base
      }
      if (hint.status === 'grow' && hint.chain?.name) {
        base.push(getChainButtonClass(hint.chain.name))
        base.push('hand-tile--grow')
        return base
      }
      if (hint.status === 'seed') {
        base.push('hand-tile--seed')
        return base
      }
      base.push('hand-tile--neutral')
      return base
    },
    isTileDisabled(tile) {
      const hint = this.hintFor(tile)
      if (hint.status === 'blocked') return true
      return this.disabled
    }
  }
}
</script>

<style scoped lang="postcss">
.hand-tile {
  @apply rounded border border-gray-200 px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:ring-2 hover:ring-gray-300 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none;
}
.hand-tile--neutral {
  @apply bg-white text-gray-800 hover:bg-gray-50;
}
.hand-tile--grow {
  @apply text-white border-transparent;
}
.hand-tile--seed {
  @apply bg-gray-200 text-gray-800 border-gray-300;
}
.hand-tile--merge {
  background-color: #e5e7eb; /* tailwind gray-200 */
  background-image: repeating-linear-gradient(
    135deg,
    rgba(156, 163, 175, 0.22),
    rgba(156, 163, 175, 0.22) 10px,
    transparent 10px,
    transparent 20px
  );
  @apply text-gray-800 border-gray-300;
}
.hand-tile--blocked {
  @apply bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed;
}
.hand-tile:disabled {
  @apply opacity-60 cursor-not-allowed;
}
</style>


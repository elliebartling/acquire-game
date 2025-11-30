<template>
  <div
    v-if="board"
    :class="gridClasses"
    :style="gridStyle"
    class="grid gap-1"
  >
    <template v-for="row in board.height" :key="`row-${row}`">
      <BoardTile
        v-for="col in board.width"
        :key="`${col}-${row}`"
        :tile-key="buildKey(col, row)"
        :tile-info="board.tiles[buildKey(col, row)]"
        :chain-class="chainClassFor(board.tiles[buildKey(col, row)])"
        :disabled="!isPlayersTurn"
        @play-tile="$emit('play-tile', $event)"
      />
    </template>
  </div>
  <div v-else class="text-sm text-gray-500">Board loading…</div>
</template>

<script>
import BoardTile from './BoardTile.vue'
import { getChainBoardClass } from '@/constants/chainColors'

export default {
  name: 'Board',
  components: { BoardTile },
  props: {
    board: {
      type: Object,
      required: false,
      default: null
    },
    currentPlayerId: {
      type: String,
      default: null
    },
    playerId: {
      type: String,
      default: null
    },
    chains: {
      type: Array,
      default: () => []
    }
  },
  emits: ['play-tile'],
  computed: {
    gridClasses() {
      if (!this.board) return ''
      return ''
    },
    gridStyle() {
      if (!this.board) return {}
      return {
        gridTemplateColumns: `repeat(${this.board.width}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${this.board.height}, minmax(0, 1fr))`
      }
    },
    isPlayersTurn() {
      if (!this.playerId) return false
      return this.currentPlayerId === this.playerId
    },
    chainsById() {
      return this.chains.reduce((acc, chain) => {
        acc[chain.id] = chain
        return acc
      }, {})
    }
  },
  methods: {
    buildKey(column, rowNumber) {
      const letter = String.fromCharCode('A'.charCodeAt(0) + (rowNumber - 1))
      return `${column}-${letter}`
    },
    chainClassFor(tileInfo) {
      if (!tileInfo?.chainId) return ''
      const chain = this.chainsById[tileInfo.chainId]
      if (!chain) return ''
      return getChainBoardClass(chain.name)
    }
  }
}
</script>
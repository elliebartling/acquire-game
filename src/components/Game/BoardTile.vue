<template>
    <button 
        @click="gamesStore.playMove(
            game, 
            number + '-' + letter,
            'tile',
            authStore.user.id
        )"
        :class="tileStatus"
        :disabled="disabled"
        class="tile text-xs xl:text-base">
            {{number}}-{{letter}}
    </button>
</template>
<script>
import { useAuthStore } from '../../stores/auth'
import { useGamesStore } from '../../stores/games'
import { useMovesStore } from '../../stores/moves'
export default {
    name: 'BoardTile',
    setup() {
        const movesStore = useMovesStore()
        const authStore = useAuthStore()
        const gamesStore = useGamesStore()
        return { movesStore, authStore, gamesStore }
    },
    props: ['game', 'coordinates', 'moves'],
    computed: {
        number() {
            return this.coordinates.width
        },
        letter() {
            return (this.coordinates.height + 9).toString(36).toUpperCase()
        },
        tile() {
            return this.number + '-' + this.letter
        },
        tileStatus() {
            if (!this.moves) return 'playable'
            
            const hasBeenPlayed = this.moves.find(move => move.move_value === this.tile)
            
            if (hasBeenPlayed) {
                return 'has-been-played'
            } else {
                return 'playable'
            }
        },
        disabled() {
            if (this.tileStatus = 'has-been-played') {
                return false
            } else {
                return true
            }
        }
    }
}
</script>
<style>
.tile { @apply rounded aspect-square flex justify-center items-center text-center font-medium transition-colors; }
.tile.playable { @apply bg-gray-100 text-gray-800; }
.tile.playable:hover { @apply bg-gray-200; }
.has-been-played { @apply bg-gray-900 text-white cursor-not-allowed shadow-sm rounded; }
</style>
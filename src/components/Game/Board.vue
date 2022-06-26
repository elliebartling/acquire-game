<template lang="">
    <div id="board" :class="`grid-cols-${size.width} grid-rows-${size.height}`" class="grid gap-1 grid-cols-12">
        <template v-for="h in size.height">
            <BoardTile v-for="w in size.width" :coordinates="{width: w, height: h}" :game="game" :moves="moves" />
        </template>
    </div>
</template>
<script>
import { useAuthStore } from '../../stores/auth'
import { useMovesStore } from '../../stores/moves'
import BoardTile from './BoardTile.vue'

export default {
    setup() {
        const movesStore = useMovesStore()
        const authStore = useAuthStore()
        return { movesStore, authStore }
    },
    props: ['size', 'game', 'moves'],
    components: {BoardTile},
}
</script>
<style lang="">
    
</style>
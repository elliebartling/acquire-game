<script>
 import { usePlayersStore } from '../stores/players'
 import { useGamesStore } from '../stores/games'

    export default {
        setup() {
            const playersStore = usePlayersStore()
            const gamesStore = useGamesStore()

            return { playersStore, gamesStore }
        },
        computed: {
            game() {
                // return this.gamesStore.all.find((game) => this.$route.params.id === game.id)
                return this.gamesStore.gameById(parseInt(this.$route.params.id))
            },
            size() {
                return {
                    width: 12,
                    height: 9
                }
            }
        }
    }
</script>
<template>
    <header class="py-10 bg-gray-800 pb-16">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-5">
            <h1 class="text-3xl font-bold text-white">Game</h1>
            <div v-if="game.rules > 1">
            </div>
            <div v-else class="rounded bg-slate-700 text-white p-2 mt-1 text-xs font-medium">Standard Rules</div>
            <div class="relative grow flex justify-end">
                <img v-for="player in game.players" class="h-8 w-8 rounded-full shadow-xl" :src="playersStore.playerById(player).avatar_url" alt="">
                <span class="absolute inset-0 shadow-inner rounded-full" aria-hidden="true"></span>
            </div>
        </div>
    </header>
    <main class="container mx-auto -mt-16 px-4">
        <div class="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-5 grid-rows-3 py-8">
            <div class="bg-white rounded-md px-6 pb-6 col-span-3 shadow-md">
                <h2 class="mt-4 mb-4">Board</h2>
                <div id="board" :class="`grid-cols-${size.width} grid-rows-${size.height}`" class="grid gap-1 grid-cols-12">
                    <template v-for="h in size.height">
                        <div v-for="w in size.width" class="aspect-square bg-gray-100 flex justify-center items-center text-center text-gray-800 font-medium">{{w}}{{(h + 9).toString(36).toUpperCase()}}</div>
                    </template>
                </div>
            </div>
        </div>
    </main>
    <code class="bg-gray-900 block rounded text-xs p-4 m-4 text-white"><pre>{{ game }}</pre></code>
</template>
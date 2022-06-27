<script>
import { usePlayersStore } from '../stores/players'
import { useGamesStore } from '../stores/games'
import { useMovesStore } from '../stores/moves'
import Board from '../components/Game/Board.vue'
import { useRoute } from "vue-router"
import { supabase } from '@/supabase'
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

export default {
    async setup() {
        const playersStore = usePlayersStore()
        const gamesStore = useGamesStore()
        const movesStore = useMovesStore()
        const authStore = useAuthStore()
        const route = useRoute()
        const gameId = route.params.id
        const game = await gamesStore.getCurrentGame(gameId)

        const joinable = route.query.join && game.players.length < game.number_of_seats
        const isAlreadyInGame = !!game.players.find((id) => id === authStore.user.id)

        if (joinable && !isAlreadyInGame) {
            gamesStore.joinGame(authStore.user.id, game)
        } else {
            console.log('full sorry')
        }

        return { playersStore, gamesStore, movesStore, authStore, game };
    },
    async mounted() {
        this.moves = await this.movesStore.getMoves(this.gameId)
        this.gamesStore.getCurrentGame(this.gameId)
        let app = this
        let movesSubscription = supabase
            .from('moves')
            .on("INSERT", (payload) => {
                console.log(payload.new)
                app.addMove(payload.new)
            })
            .subscribe();
    },
    computed: {
        moves() {
            return this.gamesStore.currentGame.moves
        },
        gameId() {
            return this.$route.params.id
        },
        game() {
            return this.gamesStore.gameById(this.gameId)
        },
        size() {
            return {
                width: 12,
                height: 9
            };
        },
        playerValues() {
            const values = {
                hand: Math.random(),
                cash: Math.random(),
                netWorth: Math.random()
            }
            return values
        }
    },
    methods: {
        addMove(move) {
            this.moves.unshift(move)
        },
        slugToTitle(slug) {
            return slug.replace("-", " ");
        },
        formatMoveAction(move_type) {
            return move_type === 'tile' ? 'played tile' : ''
        }
    },
    components: { Board }
}
</script>
<template>
    <header class="py-10 bg-gray-800 pb-16">
        <div v-if="game" class="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-end space-x-5">
            <h1 class="text-3xl font-bold text-white mb-2">Game</h1>
            <div v-if="game.rules.length > 0" class="flex flex-row justify-center items-center">
                <span class="text-gray-400 font-medium mr-2">Rules: </span>
                <div v-for="rule in game.rules" class="rounded bg-slate-700 text-white p-2 mt-1 text-xs font-medium">
                    {{slugToTitle(rule)}}
                </div>
            </div>
            <div v-else class="rounded bg-slate-700 text-white p-2 mt-1 text-xs font-medium">Standard Rules</div>
            <div class="relative grow flex justify-end">
                <span class="font-medium text-gray-400">Players: </span>
                <span v-for="(player, index) in game.players" class="text-white font-medium ml-2">
                    {{playersStore.playerById(player) ? playersStore.playerById(player).username : ""}}<span v-if="index < game.players.length - 1">,</span>
                </span>
                <!-- <span class="absolute inset-0 shadow-inner rounded-full" aria-hidden="true"></span> -->
            </div>
        </div>
    </header>
    <main v-if="game" class="container mx-auto -mt-16 px-4 h-screen">
        <div class="flex flex-row py-8 gap-y-4 gap-x-4 justify-start items-start h-full">
            <div class="flex flex-col gap-y-4 flex-grow">
                <div class="card col-span-4 row-span-4">
                    <h2 class="mt-4 mb-4">Board</h2>
                    <Board :size="size" :game="game" :moves="moves" />
                </div>
                <div class="card col-span-4 row-span-2">
                    <h2 class="mt-4 mb-4">Your hand</h2>
                    <p>{{playerValues}}</p>
                </div>
            </div>
            <div class="flex flex-col gap-y-4 min-w-fit w-20 h-full">
                <div class="card col-span-2 shadow-md row-span-2 w-80">
                    <h2 class="mt-4 mb-4">Scores</h2>
                </div>
                <div class="card flex flex-col col-span-2 shadow-md h-4/6">
                    <h2 class="mt-4 mb-4">Moves</h2>
                    <div class="flow-root overflow-y-auto overflow-hidden h-full">
                        <ul class="-mb-4">
                            <li v-for="move in moves">
                                <div class="relative pb-4">
                                    <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                    <div class="relative flex items-start space-x-3">
                                        <div>
                                            <div class="relative px-1">
                                                <div class="h-6 w-6 bg-violet-200 text-violet-500 rounded-full ring-4 ring-white flex items-center justify-center">
                                                    <svg v-if="move.move_type === 'tile'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fill-rule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clip-rule="evenodd" />
                                                    </svg>
                                                    <svg v-else-if="move.move_type === 'purchase'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
                                                    </svg>
                                                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="min-w-0 py-0">
                                            <div class="text-sm leading-1 mt-0.5 text-gray-500">
                                                <span class="mr-2.5 block">
                                                    <!-- aquiremonstress played A-2 -->
                                                    <span class="text-black">{{playersStore.playerById(move.player).username}}</span> 
                                                    {{formatMoveAction(move.move_type)}} 
                                                    <span class="text-black">{{move.move_value}}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <code class="bg-gray-900 block rounded text-xs p-4 m-4 text-white"><pre>{{ game }}</pre></code>
</template>

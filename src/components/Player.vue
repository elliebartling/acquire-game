<script>
    import { usePlayersStore } from '../stores/players'

    export default {
        setup() {
            const playersStore = usePlayersStore()

            return { playersStore }
        },
        computed: {
            player() {
                return this.playersStore.playerById(this.$route.params.id)
            }
        }
    }
</script>

<template>
    <header class="py-10 bg-gray-800 pb-20">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 flex items-start space-x-5">
            <div class="relative">
                <img class="h-20 w-20 rounded-full shadow-xl" :src="player.avatar_url" alt="">
                <span class="absolute inset-0 shadow-inner rounded-full" aria-hidden="true"></span>
            </div>
            <h1 class="text-3xl mt-2 font-bold text-white">{{player.username}}</h1>
        </div>
    </header>
    <main class="container mx-auto -mt-32 px-4">
        <div class="grid gap-4 grid-cols-2 md:grid-cols-3 grid-rows-3 py-8">
            <div class="bg-white rounded-md px-6 pb-6 col-span-2">
                <h2 class="mt-8 mb-8">What's new</h2>
            </div>
        </div>
    </main>
</template>
<script>
 import { usePlayersStore } from '../stores/players'
 import { useGamesStore } from '../stores/games'
 import { useAuthStore } from '../stores/auth'
 import Profile from '../components/Profile.vue'
 import Player from '../components/Player.vue'

    export default {
        setup() {
            const playersStore = usePlayersStore()
            const gamesStore = useGamesStore()

            return { playersStore, gamesStore }
        },
        components: { Profile, Player },
        computed: {
            isMyProfile() {
                return this.$route.params.id === useAuthStore().user.id
            },
            user() {
                return useAuthStore().user
            }
        }
    }
</script>
<template>
    <header class="py-10 bg-gray-800 pb-16">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-5">
            <h1 class="text-3xl font-bold text-white">
                <template v-if="isMyProfile">Your </template>
                Profile
            </h1>
        </div>
    </header>
    <main class="container mx-auto -mt-16 px-4">
        <div class="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-5 grid-rows-3 py-8">
            <div class="bg-white rounded-md px-6 pb-6 col-span-3 shadow-md">
                <Profile v-if="user && user.profile" :profile="user.profile" />
                <p v-else class="text-sm text-gray-500">Loading profile…</p>
            </div>
        </div>
    </main>
</template>
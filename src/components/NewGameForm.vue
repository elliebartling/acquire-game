<template lang="">
    <form @submit.prevent="gamesStore.createNewGame(settings)">
        <div>
            <div v-if="success">
                Success!
            </div>
            <div class="flex flex-col items-start justify-between">
            <h2 class="text-lg font-medium text-gray-900">Rules</h2>
            <p class="text-sm text-gray-500">Select any "extra" rulesets you want to play with.</p>
            </div>
        
            <fieldset class="space-y-5 mt-6 mb-6">
                <div class="relative flex items-start">
                <div class="flex items-center">
                    <input v-model="rules" value='extra-hotels'  aria-describedby="comments-description" name="comments" type="checkbox" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded">
                </div>
                <div class="ml-3 text-sm">
                    <label for="comments" class="font-medium text-gray-700">More hotels</label>
                    <p class="text-gray-500">Add 3 more hotels to the board.</p>
                </div>
                </div>
                <div class="relative flex items-start">
                <div class="flex items-center">
                    <input v-model="rules" value='loans' aria-describedby="candidates-description" name="candidates" type="checkbox" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded">
                </div>
                <div class="ml-3 text-sm">
                    <label for="candidates" class="font-medium text-gray-700">Loans</label>
                    <p class="text-gray-500">Allow players to take out loans.</p>
                </div>
                </div>
            </fieldset>

            <label class="text-base font-medium text-gray-900">Players</label>
            <p class="text-sm leading-5 text-gray-500">Select the maximum number of players.</p>
            <fieldset class="mt-4 mb-6">
            <legend class="sr-only">Number of players</legend>
            <div class="grid grid-cols-3 gap-y-2 lg:grid-cols-4">
                <div class="flex items-center justify-start">
                <input v-model="numberOfSeats" value="2" id="2 players" name="players" type="radio" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
                <label for="2 players" class="ml-3 block text-sm font-medium text-gray-700"> 2 </label>
                </div>
        
                <div class="flex items-center justify-start">
                <input v-model="numberOfSeats" value="3" id="3 players" name="players" type="radio" checked class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
                <label for="3 players" class="ml-3 block text-sm font-medium text-gray-700"> 3 </label>
                </div>
        
                <div class="flex items-center justify-start">
                <input v-model="numberOfSeats" value="4" id="4 players" name="players" type="radio" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
                <label for="4 players" class="ml-3 block text-sm font-medium text-gray-700"> 4 </label>
                </div>

                <div class="flex items-center justify-start">
                    <input v-model="numberOfSeats" value="5" id="4 (teams)" name="players" type="radio" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
                    <label for="4 (teams)" class="ml-3 block text-sm font-medium text-gray-700 whitespace-nowrap"> 4 (teams) </label>
                </div>
            </div>
            </fieldset>

            <!-- This example requires Tailwind CSS v2.0+ -->
            <div class="flex flex-col items-start justify-between mb-6">
                <span class="flex-grow flex flex-col mb-3">
                    <span class="text-lg font-medium text-gray-900" >Make game public</span>
                    <span class="text-sm text-gray-500" >Unlisted games will not show up in the Lobby; you'll need to send your friends the link for them to join.</span>
                </span>
                <fieldset class="mt-4 mb-6">
                    <div class="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                    <div class="flex items-center justify start">
                        <input v-model="publicGame" :value="true" id="publicGame" name="publicGame" type="radio" checked class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
                        <label for="2 players" class="ml-3 block text-sm font-medium text-gray-700"> Public </label>
                    </div>
                
                    <div class="flex items-center justify start">
                        <input v-model="publicGame" :value="false" id="unlistedGame" name="publicGame" type="radio" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
                        <label for="3 players" class="ml-3 block text-sm font-medium text-gray-700"> Unlisted </label>
                    </div>
                    </div>
                </fieldset>
            </div>
        </div>
        <button class="button primary">Create</button>
    </form>
</template>
<script>
    // import { mapActions } from 'pinia'
    import { useAuthStore } from '../stores/auth'
import { useGamesStore } from '../stores/games'
    export default {
        data() {
            return {
                publicGame: true,
                numberOfSeats: 3,
                rules: [],
                success: false
            }
        },
        setup(props) {
          const gamesStore = useGamesStore()  
          const authStore = useAuthStore()
          return { gamesStore, authStore }
        },
        computed: {
            settings() {
                return {
                    public: this.publicGame,
                    numberOfSeats: this.numberOfSeats,
                    rules: this.rules,
                    players: [this.authStore.user.id]
                }
            }
        },
    }
</script>

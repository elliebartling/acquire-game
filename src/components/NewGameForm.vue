<template lang="">
    <form @submit.prevent="handleCreateGame">
        <div>
            <div v-if="success" class="mb-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                Game created! Redirecting you now...
            </div>
            <div v-else-if="error" class="mb-4 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {{ error }}
            </div>
            <div class="flex flex-col items-start justify-between">
            <h2 class="text-lg font-medium text-gray-900">Rules</h2>
            <p class="text-sm text-gray-500">Select any "extra" rulesets you want to play with.</p>
            </div>
        
            <fieldset class="space-y-5 mt-6 mb-6">
                <div v-for="rule in optionalRules" :key="rule.id" class="relative flex items-start">
                    <div class="flex items-center">
                        <input
                            :id="rule.id"
                            v-model="rules"
                            :value="rule.id"
                            type="checkbox"
                            class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        >
                    </div>
                    <div class="ml-3 text-sm">
                        <label :for="rule.id" class="font-medium text-gray-700">{{ rule.label }}</label>
                        <p class="text-gray-500">{{ rule.description }}</p>
                    </div>
                </div>
            </fieldset>

            <div class="flex flex-col items-start justify-between mb-6">
                <h2 class="text-lg font-medium text-gray-900">Board configuration</h2>
                <p class="text-sm text-gray-500">Choose a preset to control board size and pacing.</p>
            </div>
            <div class="grid grid-cols-1 gap-3 mb-10">
                <label v-for="preset in boardPresets" :key="preset.id" class="flex items-start p-3 border rounded-md cursor-pointer">
                    <input
                        v-model="boardPreset"
                        class="mt-1 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        type="radio"
                        :value="preset.id"
                    >
                    <span class="ml-3">
                        <span class="block text-sm font-medium text-gray-900">{{ preset.label }}</span>
                        <span class="block text-sm text-gray-500">{{ preset.description }}</span>
                    </span>
                </label>
            </div>

            <label class="text-base font-medium text-gray-900">Players</label>
            <p class="text-sm leading-5 text-gray-500">Select the maximum number of players.</p>
            <fieldset class="mt-4 mb-6">
            <legend class="sr-only">Number of players</legend>
            <div class="grid grid-cols-3 gap-y-2 lg:grid-cols-4">
                <div class="flex items-center justify-start">
                <input v-model="number_of_seats" value="2" id="2 players" name="players" type="radio" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
                <label for="2 players" class="ml-3 block text-sm font-medium text-gray-700"> 2 </label>
                </div>
        
                <div class="flex items-center justify-start">
                <input v-model="number_of_seats" value="3" id="3 players" name="players" type="radio" checked class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
                <label for="3 players" class="ml-3 block text-sm font-medium text-gray-700"> 3 </label>
                </div>
        
                <div class="flex items-center justify-start">
                <input v-model="number_of_seats" value="4" id="4 players" name="players" type="radio" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
                <label for="4 players" class="ml-3 block text-sm font-medium text-gray-700"> 4 </label>
                </div>

                <div class="flex items-center justify-start">
                    <input v-model="number_of_seats" value="5" id="4 (teams)" name="players" type="radio" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
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
        <button class="button primary" :disabled="isSubmitting">
          {{ isSubmitting ? 'Creating...' : 'Create' }}
        </button>
    </form>
</template>
<script>
import { useAuthStore } from '../stores/auth'
import { useGamesStore } from '../stores/games'
import { RULES_REGISTRY } from '@/game/rules/rulesRegistry'
import { CONFIG_PRESETS } from '@/game/config/ConfigPresets'
    export default {
        data() {
            return {
                publicGame: true,
                number_of_seats: 3,
                rules: [],
                success: false,
                boardPreset: 'standard',
                isSubmitting: false,
                error: ''
            }
        },
        setup(props) {
          const gamesStore = useGamesStore()  
          const authStore = useAuthStore()
          return { gamesStore, authStore }
        },
        computed: {
            optionalRules() {
                return RULES_REGISTRY.filter(rule => !rule.required && rule.id !== 'standard')
            },
            boardPresets() {
                return Object.values(CONFIG_PRESETS)
            },
            settings() {
                return {
                    public: this.publicGame,
                    number_of_seats: Number(this.number_of_seats),
                    rules: this.rules,
                    players: this.authStore.user?.id ? [this.authStore.user.id] : [],
                    boardPreset: this.boardPreset
                }
            }
        },
        methods: {
          async handleCreateGame() {
            if (!this.authStore.user?.id) {
              this.error = 'Please sign in before creating a game.'
              return
            }

            this.isSubmitting = true
            this.success = false
            this.error = ''
            try {
              const newGame = await this.gamesStore.createNewGame(this.settings)
              this.success = true
              if (newGame?.id) {
                await this.$router.push({ name: 'game', params: { id: newGame.id } })
              }
            } catch (err) {
              console.error('Failed to create game', err)
              this.error = err.message || 'Unable to create game. Please try again.'
            } finally {
              this.isSubmitting = false
            }
          }
        }
    }
</script>

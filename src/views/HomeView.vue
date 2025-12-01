<script setup>
import { computed } from 'vue'
import { useGamesStore } from '../stores/games'
import Game from '../components/Feed/Game.vue'
import NewGameForm from '../components/NewGameForm.vue';
const games = useGamesStore()
const lobbyGames = computed(() => games.lobbyGames)
</script>

<template>
  <header class="py-10 bg-gray-800 pb-32">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-white">Lobby</h1>
    </div>
  </header>
  <main class="container mx-auto -mt-32">
    <!-- <div class="grid gap-4 grid-cols-2 md:grid-cols-3 grid-rows-3 py-8"> -->
      <div class="flex flex-row align-top items-start gap-4 py-8">
        <div class="bg-white rounded-md px-6 pb-6 flex-grow">
            <h2 class="mt-4 mb-8">What's new</h2>
            <div class="flow-root mb-8">
                <div class="flex flex-col gap-1 mb-4">
                    <h2 class="text-2xl font-semibold text-gray-900">Live public games</h2>
                    <p class="text-sm text-gray-500">Watch updated seats and phases appear in real time.</p>
                </div>
                <ul v-if="lobbyGames.length" class="-mb-8">
                    <Game v-for="game in lobbyGames" :key="game.id" :game="game"/>
                </ul>
                <div v-else class="rounded-md border border-dashed border-violet-200 bg-violet-50 p-6 text-gray-700">
                    <p class="font-medium">No public games yet</p>
                    <p class="text-sm text-gray-500">Create a match or wait for someone else to start one. The lobby refreshes automatically.</p>
                </div>
            </div>
        </div>
        <div class="bg-white rounded-md px-6 pb-6 hidden md:block max-w-xs	lg:max-w-md">
          <div class="-mt-6">
              <div>
                <span class="inline-flex items-center justify-center rounded-md bg-violet-500 p-3 shadow-lg">
                  <!-- Heroicon name: outline/cloud-upload -->
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
                </span>
              </div>
            </div>
            <h2 class="mt-4 mb-8">Start a new game</h2>
            <NewGameForm />
        </div>
    </div>
  </main>
</template>

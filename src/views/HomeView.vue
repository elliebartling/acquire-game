<script setup>
// import TheWelcome from '@/components/TheWelcome.vue'
import { useGamesStore } from '../stores/games'
import Game from '../components/Feed/Game.vue'
const games = useGamesStore()
console.log(games.allGames)
</script>

<template>
  <header class="py-10 bg-gray-800 pb-32">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-white">Lobby</h1>
    </div>
  </header>
  <main class="container mx-auto -mt-32">
    <div class="grid gap-4 grid-cols-2 md:grid-cols-3 grid-rows-3 py-8">
        <div class="bg-white rounded-md px-6 pb-6 col-span-2">
            <h2 class="mt-4 mb-8">What's new</h2>
            <div class="flow-root mb-8">
                <ul class="-mb-8">
                    <Game v-for="game in games.allGames" :game="game"/>
                    <!-- {#each $allGames as game}
                        <NewGame game={game} />
                    {/each}
                    <NewMessage />
                    <NewMessage />
                    <NewMessage />
                    <NewGame /> -->
                </ul>
            </div>
        </div>
        <div class="bg-white rounded-md px-6 pb-6 hidden md:block">
          <div class="-mt-6">
              <div>
                <span class="inline-flex items-center justify-center rounded-md bg-indigo-500 p-3 shadow-lg">
                  <!-- Heroicon name: outline/cloud-upload -->
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
                </span>
              </div>
            </div>
            <h2 class="mt-4 mb-8">Start a new game</h2>
            <!-- <NewGameForm /> -->
        </div>
    </div>
  </main>
</template>

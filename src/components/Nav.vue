<script>
    import { useAuthStore } from '../stores/auth'
    import { usePlayersStore } from '../stores/players'
    export default {
        setup() {
          const authStore = useAuthStore()
          const playersStore = usePlayersStore()
          return { authStore, playersStore }
        },
        props: ['user'],
        created() {
          console.log(this.user)
        }
    }
</script>
<template>
<nav class="bg-gray-800">
    <div class="container mx-auto sm:px-6 lg:px-8">
      <div class="border-b border-gray-700">
        <div class="flex items-center justify-between h-16 px-4 sm:px-0">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <!-- <img class="h-8 w-8" src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg" alt="Workflow"> -->
              <span class="text-lg text-white font-bold">Acquire</span>
            </div>
            <div class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-4">
                <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
                <router-link to="/" class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium" aria-current="page">Lobby</router-link>

                <router-link to="/stats" class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Stats</router-link>

                <router-link to="/rules" class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Rules</router-link>
              </div>
            </div>
          </div>
          <div v-if="!user" class="block">
            <a href="/login" class="text-white text-sm font-medium">Log in</a>
          </div>
          <div v-else-if="user && !user.profile">
            <router-link :to="`/player/${user.id}`" class="text-white text-sm font-medium">Set up your profile</router-link>
            <button class="button block secondary" @click="authStore.signOut()" :disabled="loading">
              Sign Out
            </button>
          </div>
          <div v-else class="hidden md:block">
            <div class="ml-4 flex items-center md:ml-6">
              <!-- Profile dropdown -->
              <div class="ml-3 relative">
                <div>
                  <router-link :to="`/player/${user.id}`" class="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white" aria-expanded="false" aria-haspopup="true">
                    <span class="sr-only">Open user menu</span>
                    <!-- <img class="h-8 w-8 rounded-full" :src="user.profile.avatar_url" alt=""> -->
                    <span class="text-white mr-2 ml-2">{{user.profile.username}}</span>
                  </router-link>
                </div>
              </div>
              <button type="button" class="ml-1 button button-sm bg-gray-800 p-1 text-gray-400 rounded-full hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                <span class="sr-only">View notifications</span>
                <!-- Heroicon name: outline/bell -->
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <router-link v-if="user.hasActiveGame" to="/current-game" class="button button-sm hover:text-white primary mr-2 font-medium ml-4">Re-Join Current Game</router-link>
              <button class="button button-sm block secondary" @click="authStore.signOut()" :disabled="loading">
                Sign Out
              </button>
            </div>
          </div>
          
          <div class="-mr-2 flex md:hidden">
            <!-- Mobile menu button -->
            <button type="button" class="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white" aria-controls="mobile-menu" aria-expanded="false">
              <span class="sr-only">Open main menu</span>
              <!--
                Heroicon name: outline/menu

                Menu open: "hidden", Menu closed: "block"
              -->
              <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <!--
                Heroicon name: outline/x

                Menu open: "block", Menu closed: "hidden"
              -->
              <svg class="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
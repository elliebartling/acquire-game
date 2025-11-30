<script setup>
import { computed, Suspense } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGamesStore } from '@/stores/games'
import { usePlayersStore } from '@/stores/players'
import { supabase } from "./supabase"
import Auth from "./components/Auth.vue"
import Nav from "./components/Nav.vue"

const authStore = useAuthStore()
authStore.loadUser()

const sessionUser = supabase.auth.user()
if (sessionUser) {
  authStore.user = sessionUser
  authStore.loadUserProfile()
}

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    authStore.user = session.user
    authStore.loadUserProfile()
  } else if (event === 'SIGNED_OUT') {
    authStore.clearUser()
  }
})

const games = useGamesStore()
games.loadRecentGames()

const players = usePlayersStore()
players.loadAllPlayers()

const route = useRoute()
const showNav = computed(() => route.name !== 'game')
// authStore.$onAction(({ name, store, after }) => {
//   if (name === 'loadRedirectRoute') {
//     after(async () => {
//       const redirectRoute = store.redirectRoute;
//       if (redirectRoute) {
//         // await router.isReady()
//         // await router.replace(redirectRoute as RouteLocationRaw)
//         authStore.clearRedirectRoute()
//       }
//     });
//   }
// });
</script>

<template>
  <Nav v-if="showNav" :user="authStore.user" />
  <Suspense v-if="authStore.user">
    <RouterView />
  </Suspense>
  <Auth v-else />
</template>

<style>
/* @import '@/assets/base.css'; */
@import '@/assets/index.css';
</style>

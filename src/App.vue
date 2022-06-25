<script setup>
import { RouterLink, RouterView } from 'vue-router'
// import HelloWorld from '@/components/HelloWorld.vue'
import { useAuthStore } from '@/stores/auth'
import { useGamesStore } from '@/stores/games'
import { usePlayersStore } from '@/stores/players'
// import { store } from "./store"
import { supabase } from "./supabase"
import Auth from "./components/Auth.vue"
import Profile from "./components/Profile.vue"
import Nav from "./components/Nav.vue"
import ProfileView from './views/ProfileView.vue'
import SetUpProfileView from './views/SetUpProfileView.vue'
import { Suspense } from 'vue'

const authStore = useAuthStore()
authStore.loadUser()
console.log("main app loaded")

supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN') {
    authStore.loadUser()
    authStore.loadUserProfile()
    console.log("auth state changed")
    // authStore.loadRedirectRoute()
  } else if (event === 'SIGNED_OUT') {
    authStore.clearUser()
  }
});

authStore.user = supabase.auth.user()
supabase.auth.onAuthStateChange((_, session) => {
  authStore.user = session.user
})

const games = useGamesStore()
games.loadRecentGames()

const players = usePlayersStore()
players.loadAllPlayers()
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
  <Nav :user="authStore.user" />
  <Suspense v-if="authStore.user && authStore.user.profile">
    <RouterView />
  </Suspense>
  <SetUpProfileView v-else-if="authStore.user && !authStore.user.profile" />
  <Auth v-else />
</template>

<style>
/* @import '@/assets/base.css'; */
@import '@/assets/index.css';
</style>

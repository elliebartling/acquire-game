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

const authStore = useAuthStore()
authStore.loadUser()
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN') {
    authStore.loadUser()
    authStore.loadUserProfile()
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
  <!-- <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  -->
  <Nav :user="authStore.user" />
  <RouterView v-if="authStore.user" />
  <Auth v-else />
</template>

<style>
/* @import '@/assets/base.css'; */
@import '@/assets/index.css';

/* #app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;

  font-weight: normal;
}

header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

a,
.green {
  text-decoration: none;
  color: hsla(160, 100%, 37%, 1);
  transition: 0.4s;
}

@media (hover: hover) {
  a:hover {
    background-color: hsla(160, 100%, 37%, 0.2);
  }
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  body {
    display: flex;
    place-items: center;
  }

  #app {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 0 2rem;
  }

  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
} */
</style>

<template>
<header class="py-10 bg-gray-800 pb-16">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-5">
            <h1 class="text-3xl font-bold text-white">Login</h1>
        </div>
    </header>
    <main class="container mx-auto -mt-16 px-4">
        <div class="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-5 grid-rows-3 py-8">
            <div class="bg-white rounded-md px-6 pb-6 col-span-3 shadow-md">
              <form class="row flex flex-center" @submit.prevent="handleLogin">
                <div class="col-6 form-widget">
                  <h1 class="mt-4 mb-2">Sign in/up</h1>
                  <p class="description label">Sign in or up with your email & password</p>
                  <div class="mt-2 flex flex-row gap-2">
                    <input
                      class="input border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      type="email"
                      placeholder="Your email"
                      v-model="email"
                    />
                    <input
                      class="input border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      type="password"
                      placeholder="Your password"
                      v-model="password"
                    />
                  </div>
                  <div class="mt-2">
                    <input
                      type="submit"
                      class="button block inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      :value="loading ? 'Loading' : 'Sign in or up'"
                      :disabled="loading"
                    />
                  </div>
                </div>
              </form>
              <form class="row flex flex-center" @submit.prevent="authStore.login({ email, password })">
                <div class="col-6 form-widget">
                  <h1 class="mt-4 mb-2">Get a magic link</h1>
                  <p class="description label">Got an account already? Sign in via magic link with your email below</p>
                  <div class="mt-2">
                    <input
                      class="input border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      type="email"
                      placeholder="Your email"
                      v-model="email"
                    />
                  </div>
                  <div class="mt-2">
                    <input
                      type="submit"
                      class="button block inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      :value="loading ? 'Loading' : 'Send magic link'"
                      :disabled="loading"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
      </main>
</template>

<script>
import { ref } from "vue"
import { supabase } from "../supabase"
import { useAuthStore } from '../stores/auth'

export default {
  setup() {
    const loading = ref(false)
    const email = ref("")
    const password = ref("")
    const authStore = useAuthStore()

    const handleLogin = async () => {
      try {
        loading.value = true
        const { error } = await supabase.auth.signIn({ email: email.value }, {
          redirectTo: import.meta.env.REDIRECT_URL
        })
        console.log('redirect url auth', import.meta.env.REDIRECT_URL)
        if (error) throw error
        alert("Check your email for the login link!")
      } catch (error) {
        alert(error.error_description || error.message)
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      email,
      handleLogin,
      authStore
    }
  },
}
</script>
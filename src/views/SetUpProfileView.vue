<script>
 
import { useAuthStore } from '../stores/auth'
 import Profile from '../components/Profile.vue'

    export default {
        setup() {
            const blankProfile = {
                username: '',
                avatar_url: ''
            }

            return { blankProfile }
        },
        components: { Profile },
        computed: {
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
                Set up your profile
            </h1>
        </div>
    </header>
    <main class="container mx-auto -mt-16 px-4">
        <div class="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-5 grid-rows-3 py-8">
            <div class="bg-white rounded-md px-6 pb-6 col-span-3 shadow-md">
                <Profile :profile="blankProfile"/>
            </div>
        </div>
    </main>
    <code class="bg-gray-900 block rounded text-xs p-4 m-4 text-white mt-2">
        <pre>
            {{ user }}
        </pre>
    </code>
</template>
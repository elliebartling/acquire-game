<template>
  <form class="form-widget py-6 space-y-4" @submit.prevent="authStore.updateUserProfile(this.profile)">
    <div>
      <label class="label" for="email">Email</label>
      <input id="email" class="input text-gray-500" type="text" :value="user.email" disabled />
      <p class="mt-2 text-sm text-gray-500">You can't change your email address after signing up, but you can see what it is here.</p>
    </div>
    <div>
      <label class="label" for="username">Username</label>
      <input id="username" class="input" v-model="profile.username" type="text" />
      <p class="mt-2 text-sm text-gray-500">A username is required to continue.</p>
    </div>

    <!-- <AvatarUpload v-model:path="profile.avatar_url" @upload="authStore.updateUserProfile(profile)" /> -->

    <div class="flex flex-row gap-4">
      <input
        type="submit"
        class="button block primary cursor-pointer hover:bg-violet-600"
        :value="loading ? 'Loading ...' : 'Update'"
        :disabled="loading"
      />
      <button class="button block secondary hover:bg-violet-600 hover:text-white" @click="authStore.signOut()" :disabled="loading">
        Sign Out
      </button>
    </div>
  </form>
    <code class="bg-gray-900 block rounded text-xs p-4 mt-4 text-white mt-2">
        <pre>
            {{ user }}
        </pre>
    </code>
</template>

<script>
 import { supabase } from "../supabase"
 import { useAuthStore } from '../stores/auth'
 import AvatarUpload from '../components/AvatarUpload.vue'

    export default {
        setup() {
            const authStore = useAuthStore()

            let loading = false
            let profile = {
              username: '',
              avatar_url: ''
            }

            return { loading, authStore }
        },
        props: ['profile'],
        components: {AvatarUpload},
        computed: {
            user() {
              return useAuthStore().user
            }
        },
        mounted() {
          // this.profile.username = this.authStore.user.profile.username
        }
    }

// export default {
//   setup() {
//     const loading = ref(true)
//     const username = ref("")
//     const website = ref("")
//     const avatar_url = ref("")

//     async function getProfile() {
//       try {
//         loading.value = true
//         store.user = supabase.auth.user()

//         let { data, error, status } = await supabase
//           .from("profiles")
//           .select(`username, website, avatar_url`)
//           .eq("id", store.user.id)
//           .single()

//         if (error && status !== 406) throw error

//         if (data) {
//           username.value = data.username
//           website.value = data.website
//           avatar_url.value = data.avatar_url
//         }
//       } catch (error) {
//         alert(error.message)
//       } finally {
//         loading.value = false
//       }
//     }

//     async function updateProfile() {
//       try {
//         loading.value = true
//         store.user = supabase.auth.user()

//         const updates = {
//           id: store.user.id,
//           username: username.value,
//           website: website.value,
//           avatar_url: avatar_url.value,
//           updated_at: new Date(),
//         }

//         let { error } = await supabase.from("profiles").upsert(updates, {
//           returning: "minimal", // Don't return the value after inserting
//         })

//         if (error) throw error
//       } catch (error) {
//         alert(error.message)
//       } finally {
//         loading.value = false
//       }
//     }

//     async function signOut() {
//       try {
//         loading.value = true
//         let { error } = await supabase.auth.signOut()
//         if (error) throw error
//       } catch (error) {
//         alert(error.message)
//       } finally {
//         loading.value = false
//       }
//     }

//     onMounted(() => {
//       getProfile()
//     })

//     return {
//       store,
//       loading,
//       username,
//       website,
//       avatar_url,

//       updateProfile,
//       signOut,
//     }
//   },
// }
</script>

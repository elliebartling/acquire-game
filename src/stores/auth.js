import { defineStore } from 'pinia'
// import { RouteLocation } from 'vue-router'
// import { User } from '@supabase/supabase-js'
import { supabase } from '@/supabase'

// https://jrxkyegtcvztdaipafow.supabase.co/auth/v1/verify?token=rkteirrybtfquzkstscc&type=magiclink&redirect_to=http://localhost:3000,https://acquire-game.netlify.app

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    loading: true,
    user: null,
    redirectRoute: null,
  }),
  getters: {
    // username: (state) => state.u * 2
    // isAuthenticated: !!this.user
  },
  actions: {
    loadUser() {
        this.user = supabase.auth.user();
        // ToDo: hook this up to database
    },
    async login(data) {
      const { user, error } = await supabase.auth.signIn(data, {
        redirectTo: import.meta.env.VITE_REDIRECT_URL
      })
      console.log('redirect url', import.meta.env.VITE_REDIRECT_URL)
      this.user = supabase.auth.user()
    },
    async getAvatarUrl(path) {
      const { publicURL, error } = await supabase.storage
        .from("avatars")
        .getPublicUrl(path)
        if (error && status !== 406) throw error
      
        return publicURL
    },
    async loadUserProfile() {
      let avatar_url = ''
      let { data, error, status } = await supabase
        .from('profiles')
        .select(`username, avatar_url`)
        .eq('id', this.user.id)
        .single()
      
      if (data.avatar_url) {
        avatar_url = await this.getAvatarUrl(data.avatar_url)
      }
      
        this.user = {
          ...this.user,
          profile: {
            username: data.username,
            avatar_url: avatar_url
          }
        }
    },
    async updateUserProfile(newValues) {
      const updates = {
        id: this.user.id,
        ...newValues
      }
      console.log(updates)
      let { error } = await supabase
        .from("profiles")
        .upsert(updates)
        .eq('id', this.user.id)
      
      if (error) throw error

      this.loadUserProfile()
      return true
    },
    async signOut() {
      console.log('signing out...')
      let { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    clearUser() {
      this.user = null
    }
  }
})

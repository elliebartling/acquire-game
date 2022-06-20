import { defineStore } from 'pinia'
// import { RouteLocation } from 'vue-router'
// import { User } from '@supabase/supabase-js'
import { supabase } from '@/supabase'

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    user: null,
    redirectRoute: null
  }),
  getters: {
    // username: (state) => state.u * 2
    // isAuthenticated: !!this.user
  },
  actions: {
    loadUser() {
        this.user = supabase.auth.user();
    },
    async loadUserProfile() {
      let { data, error, status } = await supabase
        .from('profiles')
        .select(`username, avatar_url`)
        .eq('id', this.user.id)
        .single()

        if (error) {
          console.log(error)
        }
      
        this.user = {
          ...this.user,
          profile: data
        }
    }
  }
})

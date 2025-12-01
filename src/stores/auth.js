import { defineStore } from 'pinia'
// import { RouteLocation } from 'vue-router'
// import { User } from '@supabase/supabase-js'
import { supabase } from '@/supabase'
import {
  buildDicebearOptions,
  deserializeAvatarOptions,
  generateAvatarAssets,
  getDicebearStyleName,
  serializeAvatarOptions
} from '@/utils/avatarGenerator'

const AVATAR_BUCKET = 'avatars'

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
    async loadUser() {
        const { data: { user } } = await supabase.auth.getUser()
        this.user = user
        // ToDo: hook this up to database
    },
    async login(data) {
      const { data: { user }, error } = await supabase.auth.signInWithPassword(data)
      console.log('redirect url', import.meta.env.VITE_REDIRECT_URL)
      if (error) {
        console.error('Login error:', error)
        throw error
      }
      this.user = user
    },
    async getAvatarUrl(path) {
      if (!path) return ''
      if (path.startsWith('data:') || path.startsWith('http')) {
        return path
      }
      const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
      return data?.publicUrl || ''
    },
    async loadUserProfile() {
      if (!this.user?.id) return

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, avatar_url, avatar_seed, avatar_style, avatar_options`)
        .eq('id', this.user.id)
        .single()

      if (error && status !== 406) throw error

      let profileData = data

      if (!profileData) {
        const defaultSeed = this.user.email || this.user.id
        const defaultOptions = serializeAvatarOptions({})
        const defaultProfile = {
          id: this.user.id,
          username: '',
          avatar_seed: defaultSeed,
          avatar_style: getDicebearStyleName(),
          avatar_options: defaultOptions,
          avatar_url: ''
        }
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(defaultProfile, { onConflict: 'id' })

        if (upsertError) throw upsertError

        profileData = defaultProfile
      }

      const avatarOptions = deserializeAvatarOptions(profileData.avatar_options)
      const { seed, options } = buildDicebearOptions({
        username: profileData.username,
        storedSeed: profileData.avatar_seed,
        storedOptions: avatarOptions
      })
      const serializedOptions = serializeAvatarOptions(options)
      const assets = await generateAvatarAssets({ seed, options: serializedOptions })

      const avatarStoragePath = profileData.avatar_url
      let avatarUrl = assets.dataUri

      if (avatarStoragePath) {
        avatarUrl = await this.getAvatarUrl(avatarStoragePath)
      }

      this.user = {
        ...this.user,
        profile: {
          username: profileData.username,
          avatar_url: avatarUrl,
          avatar_preview: assets.dataUri,
          avatar_storage_path: avatarStoragePath,
          avatar_seed: seed,
          avatar_style: profileData.avatar_style || getDicebearStyleName(),
          avatar_options: serializedOptions
        }
      }
    },
    async persistGeneratedAvatar(svgMarkup) {
      if (!svgMarkup) {
        return this.user?.profile?.avatar_storage_path || null
      }
      const blob = new Blob([svgMarkup], { type: 'image/svg+xml' })
      const storagePath = `generated/${this.user.id}.svg`
      const { error } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(storagePath, blob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/svg+xml'
        })

      if (error) {
        console.warn('[avatars] Unable to upload avatar, falling back to data URI:', error.message)
        return null
      }
      return storagePath
    },
    async updateUserProfile(newValues) {
      const username = newValues.username ?? this.user?.profile?.username ?? ''
      const {
        seed,
        options
      } = buildDicebearOptions({
        username,
        seedOverride: newValues.avatar_seed,
        storedSeed: this.user?.profile?.avatar_seed,
        colorHex: newValues.avatar_color_hex,
        storedOptions: newValues.avatar_options || this.user?.profile?.avatar_options,
        overrides: newValues.avatar_overrides
      })

      const serializedOptions = serializeAvatarOptions(options)
      const { dataUri, svg } = await generateAvatarAssets({ seed, options: serializedOptions })
      const avatarPath = await this.persistGeneratedAvatar(svg)

      const updates = {
        id: this.user.id,
        username,
        avatar_seed: seed,
        avatar_style: getDicebearStyleName(),
        avatar_options: serializedOptions,
        avatar_url: avatarPath || dataUri,
        updated_at: new Date()
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(updates)
        .eq('id', this.user.id)

      if (error) throw error

      await this.loadUserProfile()
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

import { defineStore } from 'pinia'
import { supabase } from '@/supabase'

const AVATAR_BUCKET = 'avatars'

export const usePlayersStore = defineStore({
  id: 'players',
  state: () => ({
    all: [],
  }),
  getters: {
    allPlayers(state) {
        return state.all
    },
    playerById(state) {
        return (userId) => state.all.find((player) => player.id === userId)
    }
  },
  actions: {
    async loadAllPlayers() {
        let { data: players, error } = await supabase
            .from('profiles')
            .select('*')
        
        if (error) throw error

        const mapAvatarUrl = async (path) => {
          if (!path) return ''
          if (path.startsWith('http') || path.startsWith('data:')) return path
          const { publicURL, data, error } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
          if (error) {
            console.warn('[avatars] Unable to fetch public URL for player:', error.message)
            return ''
          }
          return publicURL || data?.publicUrl || ''
        }

        const withAvatars = []
        for (const player of players || []) {
          const avatar_url = await mapAvatarUrl(player.avatar_url)
          withAvatars.push({ ...player, avatar_url })
        }
        this.all = withAvatars
    }
  }
})

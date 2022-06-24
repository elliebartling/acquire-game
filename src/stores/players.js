import { defineStore } from 'pinia'
import { supabase } from '@/supabase'

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
        
            this.all = players
    }
  }
})

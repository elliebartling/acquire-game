<script>
    import TimeAgo from 'javascript-time-ago'
    import en from 'javascript-time-ago/locale/en.json'
    import { usePlayersStore } from '../../stores/players'
    import { mapState } from 'pinia'
    

    TimeAgo.addLocale(en, {
      now: {
        now: {
          current: "now",
          future: "just now",
          past: "just now"
        }
      },
    })
    const timeAgo = new TimeAgo('en-US')  
    // let playerOne = ''
    // let timeStarted = ''
    // let currentPlayers = 0
    // let totalSeats = 0
  
    // if (game.id !== null) {
    //   playerOne = $allPlayers.length > 0 ? $allPlayers.find(p => p.id === game.players[0]) : { username: '' }
    //   const date = Date.parse(game.created_at)
    //   timeStarted = timeAgo.format(date)
    //   currentPlayers = game.players.length
    //   totalSeats = game.number_of_seats
    // }
  
    // console.log('game', game)
  
    // console.log('game prop', game)
    // console.log('player one', playerOne)
    
    export default {
        name: 'Game',
        props: ['game'],
        computed: {
            ...mapState(usePlayersStore, ['allPlayers']),
            playerOne() {
                return usePlayersStore().playerById(this.game.players[0])
            },
            timeStarted() {
                console.log(this.game.created_at)
                return timeAgo.format(Date.parse(this.game.created_at), { future: false })
            },
            isFull() {
              return !(this.game.players.length < this.game.number_of_seats)
            }
        }
    }
  </script>
  
  <template>
    <li>
      <div class="relative pb-8">
        <span class="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
        <div class="relative flex items-start space-x-3">
          <div>
            <div class="relative px-1">
              <div class="h-8 w-8 bg-violet-200 text-violet-500 rounded-full ring-8 ring-white flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                  </svg>
              </div>
            </div>
          </div>
          <div class="min-w-0 flex-1 py-0">
              <div class="text-sm leading-1 text-gray-500">
                <span class="mr-2.5 mb-2 w-full md:max-w-fit block">
                  <router-link :to="`/player/${playerOne ? playerOne.id : 0}`" class="font-medium text-gray-900">{{playerOne ? playerOne.username : ''}}</router-link>
                  started a new game
                  <span class="whitespace-nowrap">{{ timeStarted }}</span>
                </span>
                <span class="mr-0.5">
                  <div href="/" class="relative inline-flex items-center rounded-full border border-gray-300 px-3 py-0.5 text-sm mr-2">
                    <span class="absolute flex-shrink-0 flex items-center justify-center">
                      <span class="h-1.5 w-1.5 rounded-full" :class="game.isFull ? 'bg-red-500' : 'bg-green-500'" aria-hidden="true"></span>
                    </span>
                    <span class="ml-3.5 font-medium text-gray-900">{{game.players.length}} <span class="text-gray-400">/ {{game.number_of_seats}} players</span></span>
                  </div>
                  <router-link v-if="game.isFull" :to="`/game/${game.id}`" class="relative inline-flex items-center rounded-full text-white bg-sky-500 px-3 border border-sky-500 py-0.5 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span class="ml-3.5 font-medium">Watch</span>
                  </router-link>
                  <router-link v-else :to="`/game/${game.id}?join=true`" class="relative inline-flex items-center rounded-full bg-violet-600 px-3 border border-violet-600 py-0.5 text-sm text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                    <span class="font-medium">Join</span>
                  </router-link>
                </span>
              </div>
            </div>
        </div>
      </div>
    </li>
</template>
export const CHAIN_COLOR_MAP = {
  Luxor: {
    board: 'bg-red-600 text-white',
    button: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-200'
  },
  Tower: {
    board: 'bg-yellow-400 text-gray-900',
    button: 'bg-yellow-400 hover:bg-yellow-300 text-gray-900 focus:ring-yellow-200'
  },
  American: {
    board: 'bg-blue-600 text-white',
    button: 'bg-blue-600 hover:bg-blue-500 text-white focus:ring-blue-200'
  },
  Worldwide: {
    board: 'bg-amber-700 text-white',
    button: 'bg-amber-700 hover:bg-amber-600 text-white focus:ring-amber-200'
  },
  Festival: {
    board: 'bg-emerald-600 text-white',
    button: 'bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-200'
  },
  Imperial: {
    board: 'bg-pink-600 text-white',
    button: 'bg-pink-600 hover:bg-pink-500 text-white focus:ring-pink-200'
  },
  Continental: {
    board: 'bg-cyan-600 text-white',
    button: 'bg-cyan-600 hover:bg-cyan-500 text-white focus:ring-cyan-200'
  }
}

const DEFAULT_BOARD_CLASS = 'bg-gray-900 text-white'
const DEFAULT_BUTTON_CLASS = 'bg-violet-600 hover:bg-violet-500 text-white focus:ring-violet-200'

export function getChainBoardClass(name) {
  return CHAIN_COLOR_MAP[name]?.board || DEFAULT_BOARD_CLASS
}

export function getChainButtonClass(name) {
  return CHAIN_COLOR_MAP[name]?.button || DEFAULT_BUTTON_CLASS
}


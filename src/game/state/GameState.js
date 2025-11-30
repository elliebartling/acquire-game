import { GameConfig } from '../config/GameConfig'
import { BoardState } from './BoardState'
import { PlayerState } from './PlayerState'
import { ChainState } from './ChainState'

function buildDefaultChains(config) {
  return config.chainNames.map(
    (name, index) =>
      new ChainState({
        id: `chain-${index}`,
        name,
        safeThreshold: config.safeChainSize,
        stockRemaining: config.stockSupply
      })
  )
}

export class GameState {
  constructor({
    config = new GameConfig(),
    board = new BoardState({ width: config.width, height: config.height }),
    players = [],
    chains = buildDefaultChains(config),
    moves = [],
    phase = 'setup',
    turnOrder = [],
    currentTurnIndex = 0,
    market = {},
    pendingAction = null
  } = {}) {
    this.config = config
    this.board = board
    this.players = players
    this.chains = chains
    this.moves = moves
    this.phase = phase
    this.turnOrder = turnOrder
    this.currentTurnIndex = currentTurnIndex
    this.market = Object.keys(market).length
      ? market
      : this.buildDefaultMarket(config.chainNames)
    this.pendingAction = pendingAction
  }

  buildDefaultMarket(chainNames) {
    return chainNames.reduce((acc, name) => {
      acc[name] = { price: 200, sharesRemaining: this.config.stockSupply }
      return acc
    }, {})
  }

  get currentPlayerId() {
    return this.turnOrder[this.currentTurnIndex] || null
  }

  getPlayerById(playerId) {
    return this.players.find((player) => player.id === playerId)
  }

  recordMove(move) {
    this.moves = [move, ...(this.moves || [])]
  }

  toJSON() {
    return {
      config: this.config.toJSON(),
      board: this.board.toJSON(),
      players: this.players.map((player) => player.toPrivateJSON()),
      chains: this.chains.map((chain) => chain.toJSON()),
      moves: this.moves,
      phase: this.phase,
      turnOrder: this.turnOrder,
      currentTurnIndex: this.currentTurnIndex,
      market: this.market,
      pendingAction: this.pendingAction
    }
  }

  static fromJSON(json = {}) {
    return new GameState({
      config: GameConfig.fromJSON(json.config),
      board: BoardState.fromJSON(json.board),
      players: (json.players || []).map((player) => PlayerState.fromJSON(player)),
      chains: (json.chains || []).map((chain) => ChainState.fromJSON(chain)),
      moves: json.moves || [],
      phase: json.phase || 'setup',
      turnOrder: json.turnOrder || [],
      currentTurnIndex: json.currentTurnIndex || 0,
      market: json.market || {},
      pendingAction: json.pendingAction || null
    })
  }

  static fromLegacyRecord(record = {}, config = new GameConfig()) {
    const board = new BoardState({ width: config.width, height: config.height })
    const legacyMoves = Array.isArray(record.moves) ? record.moves : []
    legacyMoves.forEach((move) => {
      if (move.move_type === 'tile') {
        try {
          board.placeTile(move.move_value, { player: move.player })
        } catch {
          // Ignore duplicates from historical data.
        }
      }
    })
    const players = (record.players || []).map(
      (playerId) =>
        new PlayerState({
          id: playerId,
          cash: config.startingCash,
          netWorth: config.startingCash
        })
    )
    return new GameState({
      config,
      board,
      players,
      chains: buildDefaultChains(config),
      moves: legacyMoves,
      phase: legacyMoves.length ? 'active' : 'setup',
      turnOrder: record.players || [],
      currentTurnIndex: 0
    })
  }
}


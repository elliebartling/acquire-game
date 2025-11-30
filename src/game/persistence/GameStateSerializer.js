import { GameState } from '../state/GameState'
import { GameConfig } from '../config/GameConfig'
import { PublicGameState } from './PublicGameState'
import { PrivateGameState } from './PrivateGameState'
import { getPresetConfig } from '../config/ConfigPresets'
import { RulesEngine } from '../rules/RulesEngine'
import { buildRules } from '../rules/rulesRegistry'

export class GameStateSerializer {
  constructor({ preset = 'standard', rules = [] } = {}) {
    this.rules = rules
    this.preset = preset
  }

  deserialize(record = {}, playerId = null) {
    const config = record.board_config
      ? GameConfig.fromJSON(record.board_config)
      : getPresetConfig(this.preset)

    const baseState = record.game_state
      ? GameState.fromJSON(record.game_state)
      : GameState.fromLegacyRecord(record, config)

    const publicView = record.public_state || PublicGameState.fromGameState(baseState)
    const privateView = playerId ? PrivateGameState.forPlayer(baseState, playerId) : null

    const rulesEngine = new RulesEngine({
      variations: buildRules(record.rules || [])
    })

    const extendedConfig = rulesEngine.extendConfig(config)
    baseState.config = extendedConfig

    return {
      config: extendedConfig,
      gameState: baseState,
      publicView,
      privateView,
      rulesEngine
    }
  }

  serialize(gameState) {
    return {
      game_state: gameState.toJSON(),
      public_state: PublicGameState.fromGameState(gameState),
      board_config: gameState.config.toJSON()
    }
  }
}


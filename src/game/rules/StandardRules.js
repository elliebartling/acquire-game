import { RuleInterface } from './RuleInterface'
import { GameConfig } from '../config/GameConfig'

export class StandardRules extends RuleInterface {
  constructor() {
    super({
      id: 'standard',
      label: 'Standard Rules',
      description: 'Classic Acquire experience as published by Hasbro.'
    })
  }

  extendConfig(config = new GameConfig()) {
    return new GameConfig({
      ...config.toJSON()
    })
  }
}


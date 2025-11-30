import { RuleInterface } from '../RuleInterface'
import { GameConfig } from '../../config/GameConfig'

export class ExtraHotelsRule extends RuleInterface {
  constructor() {
    super({
      id: 'extra-hotels',
      label: 'Extra Hotels',
      description: 'Adds three additional hotels to the bag for longer games.'
    })
  }

  extendConfig(config) {
    const base = config instanceof GameConfig ? config : new GameConfig(config)
    const extraTiles = ['13-A', '13-B', '13-C']
    const tileSet = Array.from(new Set([...base.tileSet, ...extraTiles]))
    return new GameConfig({
      ...base.toJSON(),
      width: Math.max(base.width, 13),
      tileSet
    })
  }
}


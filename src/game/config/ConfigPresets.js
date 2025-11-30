import { GameConfig } from './GameConfig'

export const CONFIG_PRESETS = {
  standard: {
    id: 'standard',
    label: 'Standard 12x9',
    description: 'Classic Acquire board with 12 columns, 9 rows and 7 hotel chains.',
    build: () => new GameConfig()
  },
  extended: {
    id: 'extended',
    label: 'Extended 13x10',
    description: 'Adds an extra column and row for longer games.',
    build: () =>
      new GameConfig({
        width: 13,
        height: 10,
        tileSet: new GameConfig({ width: 13, height: 10 }).generateTileSet()
      })
  },
  compact: {
    id: 'compact',
    label: 'Compact 10x8',
    description: 'Shorter sessions with fewer tiles and slightly faster endgame.',
    build: () =>
      new GameConfig({
        width: 10,
        height: 8,
        safeChainSize: 10,
        tileSet: new GameConfig({ width: 10, height: 8 }).generateTileSet()
      })
  }
}

export function getPresetConfig(presetId = 'standard') {
  const preset = CONFIG_PRESETS[presetId] || CONFIG_PRESETS.standard
  return preset.build()
}


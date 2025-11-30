const DEFAULT_CHAIN_NAMES = [
  'Luxor',
  'Tower',
  'American',
  'Worldwide',
  'Festival',
  'Imperial',
  'Continental'
]

/**
 * Declarative configuration for a single game instance.
 * The config is immutable once a game starts.
 */
export class GameConfig {
  constructor({
    width = 12,
    height = 9,
    chainNames = DEFAULT_CHAIN_NAMES,
    startingCash = 6000,
    stockSupply = 25,
    safeChainSize = 11,
    maxChains = 7,
    handSize = 6,
    allowLoans = false,
    maxLoan = 2000,
    tileSet
  } = {}) {
    this.width = width
    this.height = height
    this.chainNames = chainNames
    this.startingCash = startingCash
    this.stockSupply = stockSupply
    this.safeChainSize = safeChainSize
    this.maxChains = maxChains
    this.handSize = handSize
    this.allowLoans = allowLoans
    this.maxLoan = maxLoan
    this.tileSet = tileSet || this.generateTileSet()
  }

  generateTileSet() {
    const tiles = []
    for (let row = 0; row < this.height; row += 1) {
      const letter = String.fromCharCode('A'.charCodeAt(0) + row)
      for (let col = 1; col <= this.width; col += 1) {
        tiles.push(`${col}-${letter}`)
      }
    }
    return tiles
  }

  toJSON() {
    return {
      width: this.width,
      height: this.height,
      chainNames: this.chainNames,
      startingCash: this.startingCash,
      stockSupply: this.stockSupply,
      safeChainSize: this.safeChainSize,
      maxChains: this.maxChains,
      handSize: this.handSize,
      allowLoans: this.allowLoans,
      maxLoan: this.maxLoan,
      tileSet: this.tileSet
    }
  }

  static fromJSON(json = {}) {
    return new GameConfig(json)
  }
}


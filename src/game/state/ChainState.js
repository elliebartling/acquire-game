export class ChainState {
  constructor({
    id,
    name,
    tiles = [],
    founderId = null,
    safeThreshold = 11,
    stockRemaining = 25
  }) {
    this.id = id
    this.name = name
    this.tiles = tiles
    this.founderId = founderId
    this.safeThreshold = safeThreshold
    this.stockRemaining = stockRemaining
  }

  get size() {
    return this.tiles.length
  }

  get isSafe() {
    return this.size >= this.safeThreshold
  }

  addTile(tile) {
    this.tiles = [...this.tiles, tile]
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      tiles: this.tiles,
      founderId: this.founderId,
      safeThreshold: this.safeThreshold,
      stockRemaining: this.stockRemaining
    }
  }

  static fromJSON(json) {
    return new ChainState(json)
  }
}


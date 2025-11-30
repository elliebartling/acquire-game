const LETTER_OFFSET = 'A'.charCodeAt(0)

function parseKey(key) {
  const [column, rowLetter] = key.split('-')
  return {
    column: Number(column),
    row: rowLetter.charCodeAt(0) - LETTER_OFFSET
  }
}

function toKey(column, rowIndex) {
  const letter = String.fromCharCode(LETTER_OFFSET + rowIndex)
  return `${column}-${letter}`
}

export class BoardState {
  constructor({ width, height, tiles = {} } = {}) {
    this.width = width
    this.height = height
    this.tiles = tiles
  }

  clone() {
    return new BoardState({
      width: this.width,
      height: this.height,
      tiles: JSON.parse(JSON.stringify(this.tiles))
    })
  }

  isTileOccupied(key) {
    return Boolean(this.tiles[key])
  }

  placeTile(key, payload) {
    if (this.isTileOccupied(key)) {
      throw new Error(`Tile ${key} has already been played`)
    }
    this.tiles[key] = payload || { status: 'occupied' }
    return this
  }

  getAdjacentKeys(key) {
    const { column, row } = parseKey(key)
    const deltas = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0]
    ]
    const neighbors = []
    deltas.forEach(([dx, dy]) => {
      const newCol = column + dx
      const newRow = row + dy
      if (newCol < 1 || newCol > this.width) return
      if (newRow < 0 || newRow >= this.height) return
      neighbors.push(toKey(newCol, newRow))
    })
    return neighbors
  }

  toJSON() {
    return {
      width: this.width,
      height: this.height,
      tiles: this.tiles
    }
  }

  static fromJSON(json = {}) {
    return new BoardState(json)
  }
}


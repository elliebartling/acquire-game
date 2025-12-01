const LETTER_OFFSET = 'A'.charCodeAt(0)

function parseKey(key = '') {
  const [column, rowLetter] = key.split('-')
  return {
    column: Number(column),
    row: (rowLetter?.charCodeAt(0) ?? LETTER_OFFSET) - LETTER_OFFSET
  }
}

function clampNeighbors(column, row, width, height) {
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
    if (Number.isNaN(newCol) || Number.isNaN(newRow)) return
    if (newCol < 1 || newCol > width) return
    if (newRow < 0 || newRow >= height) return
    neighbors.push({ column: newCol, row: newRow })
  })
  return neighbors
}

function coordsToKey(column, row) {
  const letter = String.fromCharCode(LETTER_OFFSET + row)
  return `${column}-${letter}`
}

function collectNeighborChains(tileKey, board, chainsById) {
  if (!board) return []
  const { column, row } = parseKey(tileKey)
  const neighbors = clampNeighbors(column, row, board.width, board.height)
  const chainIds = new Set()
  neighbors.forEach(({ column: col, row: r }) => {
    const neighborKey = coordsToKey(col, r)
    const tileInfo = board.tiles?.[neighborKey]
    if (tileInfo?.chainId) {
      chainIds.add(tileInfo.chainId)
    }
  })
  return Array.from(chainIds).map((id) => chainsById[id]).filter(Boolean)
}

function willCreateChainCluster(tileKey, board) {
  if (!board?.tiles) return false
  const { column, row } = parseKey(tileKey)
  const neighbors = clampNeighbors(column, row, board.width, board.height)
  let adjacentUnassignedCount = 0
  neighbors.forEach(({ column: col, row: r }) => {
    const neighborKey = coordsToKey(col, r)
    const tileInfo = board.tiles?.[neighborKey]
    if (tileInfo && !tileInfo.chainId) {
      adjacentUnassignedCount += 1
    }
  })
  return adjacentUnassignedCount >= 1
}

export function buildTileHints(hand = [], board = null, chains = []) {
  if (!Array.isArray(hand) || !board) return {}
  const chainsById = (chains || []).reduce((acc, chain) => {
    acc[chain.id] = chain
    return acc
  }, {})

  const hints = {}
  hand.forEach((tileKey) => {
    if (!tileKey) return
    const normalizedKey = tileKey.toUpperCase()
    const boardTile = board.tiles?.[normalizedKey]
    if (boardTile) {
      hints[normalizedKey] = { status: 'blocked' }
      return
    }
    const neighborChains = collectNeighborChains(normalizedKey, board, chainsById)
    if (neighborChains.length >= 2) {
      const allSafe = neighborChains.every((chain) => chain.isSafe)
      if (allSafe) {
        hints[normalizedKey] = { status: 'blocked' }
        return
      }
      hints[normalizedKey] = {
        status: 'merge',
        chains: neighborChains
      }
      return
    }
    if (neighborChains.length === 1) {
      hints[normalizedKey] = {
        status: 'grow',
        chain: neighborChains[0]
      }
      return
    }
    if (!willCreateChainCluster(normalizedKey, board)) {
      hints[normalizedKey] = { status: 'neutral' }
      return
    }
    hints[normalizedKey] = { status: 'seed' }
  })
  return hints
}



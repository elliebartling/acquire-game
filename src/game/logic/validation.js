import { calculateStockPrice } from './stock'

export function validateTilePlacement({ board, tile }) {
  if (!tile) throw new Error('Tile is required')
  if (board.isTileOccupied(tile)) {
    return { valid: false, reason: 'tile-occupied' }
  }
  return { valid: true }
}

export function validateStockPurchase({ player, chain, shares }) {
  if (shares < 1 || shares > 3) {
    return { valid: false, reason: 'invalid-share-count' }
  }
  if (!chain) {
    return { valid: false, reason: 'missing-chain' }
  }
  const price = calculateStockPrice(chain.size || 0, chain.name)
  if (player.cash < price * shares) {
    return { valid: false, reason: 'insufficient-cash' }
  }
  return { valid: true }
}

export function validateMergerDisposal({ chain, action, shares }) {
  if (!chain) return { valid: false, reason: 'missing-chain' }
  if (!['hold', 'sell', 'trade'].includes(action)) {
    return { valid: false, reason: 'invalid-action' }
  }
  if (shares < 0) return { valid: false, reason: 'invalid-shares' }
  return { valid: true }
}

export function validateGameEnd(gameState) {
  const allSafe = gameState.chains.every((chain) => chain.size === 0 || chain.isSafe)
  const hugeChain = gameState.chains.some((chain) => chain.size >= 41)
  return allSafe || hugeChain
}


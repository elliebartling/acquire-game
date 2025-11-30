export function getCurrentPlayer(gameState) {
  return gameState.getPlayerById(gameState.currentPlayerId)
}

export function advanceTurn(gameState) {
  if (gameState.turnOrder.length === 0) return gameState
  const nextIndex = (gameState.currentTurnIndex + 1) % gameState.turnOrder.length
  gameState.currentTurnIndex = nextIndex
  return gameState
}

export function executeTurn(gameState, move) {
  gameState.recordMove(move)
  advanceTurn(gameState)
  return gameState
}


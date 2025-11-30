export class PrivateGameState {
  static forPlayer(gameState, playerId) {
    const player = gameState.getPlayerById(playerId)
    if (!player) return null
    const isPendingActionOwner =
      gameState.pendingAction && gameState.pendingAction.playerId === playerId
    return {
      player: player.toPrivateJSON(),
      currentPlayerId: gameState.currentPlayerId,
      hand: player.hand,
      cash: player.cash,
      stocks: player.stocks,
      needsAction: isPendingActionOwner || gameState.currentPlayerId === playerId,
      canPlayTile: !isPendingActionOwner && gameState.currentPlayerId === playerId,
      pendingAction: isPendingActionOwner ? gameState.pendingAction : null
    }
  }
}


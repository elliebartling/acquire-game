export class PrivateGameState {
  static forPlayer(gameState, playerId) {
    const player = gameState.getPlayerById(playerId)
    if (!player) return null
    const phase = gameState.phase
    const isPhaseOwner = phase && (
      (phase.type === 'tilePlacement' && phase.playerId === playerId) ||
      (phase.type === 'foundChain' && phase.playerId === playerId) ||
      (phase.type === 'mergerChoice' && phase.playerId === playerId) ||
      (phase.type === 'stockBuy' && phase.playerId === playerId) ||
      (phase.type === 'disposalLoop' && phase.queue.playerOrder[phase.currentIndex] === playerId)
    )
    return {
      player: player.toPrivateJSON(),
      currentPlayerId: gameState.currentPlayerId,
      hand: player.hand,
      cash: player.cash,
      stocks: player.stocks,
      needsAction: isPhaseOwner || gameState.currentPlayerId === playerId,
      canPlayTile: !isPhaseOwner && gameState.currentPlayerId === playerId,
      phase: isPhaseOwner ? phase : null
    }
  }
}


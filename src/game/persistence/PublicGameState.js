export class PublicGameState {
  static fromGameState(gameState) {
    return {
      board: gameState.board.toJSON(),
      chains: gameState.chains.map((chain) => ({
        id: chain.id,
        name: chain.name,
        size: chain.size,
        isSafe: chain.isSafe,
        stockRemaining: chain.stockRemaining
      })),
      players: gameState.players.map((player) => player.toPublicJSON()),
      market: gameState.market,
      moves: gameState.moves,
      phase: gameState.phase,
      currentPlayerId: gameState.currentPlayerId
    }
  }
}


/**
 * Turn management utilities for turn-based games
 */

export interface TurnState {
  turnOrder: string[]
  currentTurnIndex: number
}

/**
 * Ensures game_state has a valid turnOrder and currentTurnIndex.
 * If missing or incomplete, rebuilds from the full players list.
 */
export function ensureTurnStructure(
  gameState: Record<string, any>,
  players: Array<{ id: string }>
): { updated: boolean; state: Record<string, any> } {
  const currentOrder = gameState.turnOrder || []
  const allPlayerIds = players.map((p) => p.id)

  // Check if we need to rebuild
  const needsRebuild =
    !Array.isArray(currentOrder) ||
    currentOrder.length !== allPlayerIds.length ||
    !allPlayerIds.every((id) => currentOrder.includes(id))

  if (needsRebuild) {
    return {
      updated: true,
      state: {
        ...gameState,
        turnOrder: allPlayerIds,
        currentTurnIndex: 0,
      },
    }
  }

  // Ensure currentTurnIndex is valid
  if (
    typeof gameState.currentTurnIndex !== "number" ||
    gameState.currentTurnIndex < 0 ||
    gameState.currentTurnIndex >= currentOrder.length
  ) {
    return {
      updated: true,
      state: {
        ...gameState,
        currentTurnIndex: 0,
      },
    }
  }

  return { updated: false, state: gameState }
}

/**
 * Gets the current player ID based on turnOrder and currentTurnIndex
 */
export function getCurrentPlayerId(gameState: Record<string, any>): string | null {
  const { turnOrder, currentTurnIndex } = gameState
  if (!Array.isArray(turnOrder) || typeof currentTurnIndex !== "number") {
    return null
  }
  return turnOrder[currentTurnIndex] || null
}

/**
 * Advances to the next player in turn order
 */
export function advanceTurn(gameState: Record<string, any>): Record<string, any> {
  const { turnOrder, currentTurnIndex } = gameState
  if (!Array.isArray(turnOrder) || typeof currentTurnIndex !== "number") {
    return gameState
  }

  const nextIndex = (currentTurnIndex + 1) % turnOrder.length

  return {
    ...gameState,
    currentTurnIndex: nextIndex,
  }
}


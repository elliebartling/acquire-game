import { ChainState } from '../state/ChainState'

export function detectNeighborChains(boardState, chains, tileKey) {
  const adjacentKeys = boardState.getAdjacentKeys(tileKey)
  const neighbors = new Set()
  adjacentKeys.forEach((key) => {
    chains.forEach((chain) => {
      if (chain.tiles.includes(key)) {
        neighbors.add(chain.id)
      }
    })
  })
  return chains.filter((chain) => neighbors.has(chain.id))
}

export function canCreateNewChain(gameState) {
  return gameState.chains.filter((chain) => chain.tiles.length > 0).length < gameState.config.maxChains
}

export function createChain(gameState, chainName, starterTile, founderId) {
  const chain = gameState.chains.find((c) => c.name === chainName)
  if (!chain) {
    throw new Error(`Unknown chain ${chainName}`)
  }
  chain.addTile(starterTile)
  chain.founderId = founderId
  return chain
}

export function resolveMerger(gameState, survivingChainId, mergingChains) {
  const survivor = gameState.chains.find((chain) => chain.id === survivingChainId)
  if (!survivor) throw new Error('Missing surviving chain')
  mergingChains.forEach((chain) => {
    chain.tiles.forEach((tile) => survivor.addTile(tile))
    chain.tiles = []
    chain.founderId = null
  })
  return survivor
}

export function ensureChainSafety(chain, safeThreshold) {
  chain.safeThreshold = safeThreshold
  return chain
}

export function hydrateChains(config) {
  return config.chainNames.map(
    (name, index) =>
      new ChainState({
        id: `chain-${index}`,
        name,
        safeThreshold: config.safeChainSize
      })
  )
}


// Hotel chain pricing tiers based on official Acquire rules
const CHAIN_TIERS = {
  // Budget tier (Tier 0) - Tower, Luxor
  'Tower': 0,
  'Luxor': 0,
  // Mid-tier (Tier 1) - American, Worldwide, Festival
  'American': 1,
  'Worldwide': 1,
  'Festival': 1,
  // Luxury tier (Tier 2) - Imperial, Continental
  'Imperial': 2,
  'Continental': 2,
  // Legacy support
  'Sackson': 0
}

// Base prices by chain size
const SIZE_PRICE_TABLE = [
  { maxSize: 2, basePrice: 200 },
  { maxSize: 3, basePrice: 300 },
  { maxSize: 4, basePrice: 400 },
  { maxSize: 5, basePrice: 500 },
  { maxSize: 10, basePrice: 600 },
  { maxSize: 20, basePrice: 700 },
  { maxSize: 30, basePrice: 800 },
  { maxSize: 40, basePrice: 900 },
  { maxSize: Infinity, basePrice: 1000 }
]

export function calculateStockPrice(chainSize, chainName = null) {
  // Get base price from size
  const sizeEntry = SIZE_PRICE_TABLE.find((entry) => chainSize <= entry.maxSize) || 
    SIZE_PRICE_TABLE[SIZE_PRICE_TABLE.length - 1]
  const basePrice = sizeEntry.basePrice
  
  // Add tier premium if chain name is provided
  if (chainName && CHAIN_TIERS[chainName] !== undefined) {
    const tierPremium = CHAIN_TIERS[chainName] * 100
    return basePrice + tierPremium
  }
  
  // Fallback to base price if no chain name
  return basePrice
}

export function buyStock(player, chain, shares = 1) {
  if (shares < 1) throw new Error('Must buy at least one share')
  const price = calculateStockPrice(chain.size, chain.name)
  const totalCost = price * shares
  if (player.cash < totalCost) throw new Error('Insufficient funds')
  if (chain.stockRemaining < shares) throw new Error('No stock remaining')
  player.adjustCash(-totalCost)
  player.stocks[chain.name] = (player.stocks[chain.name] || 0) + shares
  chain.stockRemaining -= shares
  return { price, totalCost }
}

export function sellStock(player, chain, shares = 1) {
  const owned = player.stocks[chain.name] || 0
  if (shares > owned) throw new Error('Cannot sell more stock than owned')
  const price = calculateStockPrice(chain.size, chain.name)
  const total = price * shares
  player.adjustCash(total)
  player.stocks[chain.name] = owned - shares
  chain.stockRemaining += shares
  return { price, total }
}

export function tradeStock(player, fromChain, toChain, shares = 2) {
  if (shares % 2 !== 0) throw new Error('Trades must be in sets of two shares')
  const owned = player.stocks[fromChain.name] || 0
  if (shares > owned) throw new Error('Not enough shares to trade')
  const receiving = shares / 2
  if (toChain.stockRemaining < receiving) throw new Error('Destination chain out of stock')
  player.stocks[fromChain.name] = owned - shares
  player.stocks[toChain.name] = (player.stocks[toChain.name] || 0) + receiving
  fromChain.stockRemaining += shares
  toChain.stockRemaining -= receiving
  return receiving
}

/**
 * Calculate the net worth of a player (cash + value of stocks)
 * Stocks for chains not on the board (size = 0) have no value
 */
export function calculateNetWorth(player, chains) {
  let netWorth = player.cash || 0
  
  // Add value of all stocks
  if (player.stocks && chains) {
    Object.entries(player.stocks).forEach(([chainName, shares]) => {
      if (shares > 0) {
        // Find the chain to get its size
        const chain = chains.find(c => c.name === chainName)
        if (chain && chain.size > 0) {
          const price = calculateStockPrice(chain.size, chainName)
          netWorth += price * shares
        }
        // If chain is not on board (size = 0), stock has no value
      }
    })
  }
  
  return netWorth
}


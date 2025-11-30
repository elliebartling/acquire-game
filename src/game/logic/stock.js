const PRICE_TABLE = [
  { maxSize: 2, price: 200 },
  { maxSize: 3, price: 300 },
  { maxSize: 4, price: 400 },
  { maxSize: 5, price: 500 },
  { maxSize: 6, price: 600 },
  { maxSize: 10, price: 700 },
  { maxSize: 20, price: 800 },
  { maxSize: Infinity, price: 900 }
]

export function calculateStockPrice(chainSize) {
  const tier = PRICE_TABLE.find((entry) => chainSize <= entry.maxSize) || PRICE_TABLE[PRICE_TABLE.length - 1]
  return tier.price
}

export function buyStock(player, chain, shares = 1) {
  if (shares < 1) throw new Error('Must buy at least one share')
  const price = calculateStockPrice(chain.size)
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
  const price = calculateStockPrice(chain.size)
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


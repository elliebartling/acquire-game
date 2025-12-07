import { ChainRecord } from "./boardUtils.ts";
import { PlayerStateRecord } from "./gameState.ts";

// Re-export for convenience
export type { ChainRecord } from "./boardUtils.ts";

// Hotel chain pricing tiers based on official Acquire rules
export const CHAIN_TIERS: Record<string, number> = {
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
};

// Bonus payout table for mergers based on defunct chain size and tier
export const BONUS_PAYOUT_TABLE_TIERS: Record<string, Array<{ maxSize: number; majority: number; minority: number }>> = {
  'Tier 0': [ // Tower, Luxor
    { maxSize: 2, majority: 2000, minority: 1000 },
    { maxSize: 3, majority: 2000, minority: 1000 },
    { maxSize: 4, majority: 3000, minority: 1500 },
    { maxSize: 5, majority: 3000, minority: 1500 },
    { maxSize: 10, majority: 4000, minority: 2000 },
    { maxSize: 20, majority: 5000, minority: 2500 },
    { maxSize: 30, majority: 6000, minority: 3000 },
    { maxSize: 40, majority: 7000, minority: 3500 },
    { maxSize: Infinity, majority: 8000, minority: 4000 }
  ],
  'Tier 1': [ // American, Worldwide, Festival
    { maxSize: 2, majority: 3000, minority: 1500 },
    { maxSize: 3, majority: 3000, minority: 1500 },
    { maxSize: 4, majority: 4000, minority: 2000 },
    { maxSize: 5, majority: 4000, minority: 2000 },
    { maxSize: 10, majority: 5000, minority: 2500 },
    { maxSize: 20, majority: 6000, minority: 3000 },
    { maxSize: 30, majority: 7000, minority: 3500 },
    { maxSize: 40, majority: 8000, minority: 4000 },
    { maxSize: Infinity, majority: 9000, minority: 4500 }
  ],
  'Tier 2': [ // Imperial, Continental
    { maxSize: 2, majority: 5000, minority: 2500 },
    { maxSize: 3, majority: 5000, minority: 2500 },
    { maxSize: 4, majority: 6000, minority: 3000 },
    { maxSize: 5, majority: 6000, minority: 3000 },
    { maxSize: 10, majority: 7000, minority: 3500 },
    { maxSize: 20, majority: 8000, minority: 4000 },
    { maxSize: 30, majority: 9000, minority: 4500 },
    { maxSize: 40, majority: 10000, minority: 5000 },
    { maxSize: Infinity, majority: 11000, minority: 5500 }
  ]
};

export function calculateMergerBonuses(chainSize: number, chainName?: string | null): { majority: number; minority: number } {
  const tier = CHAIN_TIERS[chainName ?? 'Sackson'];
  const tierKey = `Tier ${tier}` as keyof typeof BONUS_PAYOUT_TABLE_TIERS;
  const payoutTable = BONUS_PAYOUT_TABLE_TIERS[tierKey] || BONUS_PAYOUT_TABLE_TIERS['Tier 0'];

  const entry = payoutTable.find((entry) => chainSize <= entry.maxSize) ||
    payoutTable[payoutTable.length - 1];
  return {
    majority: entry.majority,
    minority: entry.minority,
  };
}

export function getPlayersInOrder(
  startPlayerId: string,
  allPlayers: PlayerStateRecord[],
  turnOrder: string[]
): string[] {
  // Filter turnOrder to ensure all players exist in allPlayers
  const validPlayerIds = new Set(allPlayers.map(p => p.id));
  const filteredOrder = turnOrder.filter(id => validPlayerIds.has(id));
  
  if (filteredOrder.length === 0) {
    return allPlayers.map(p => p.id);
  }
  
  const startIndex = filteredOrder.indexOf(startPlayerId);
  if (startIndex === -1) {
    return filteredOrder.length > 0 ? filteredOrder : allPlayers.map(p => p.id);
  }
  return [...filteredOrder.slice(startIndex), ...filteredOrder.slice(0, startIndex)];
}

export function payMergerBonuses(
  defunctChain: ChainRecord,
  allPlayers: PlayerStateRecord[],
  bonuses: { majority: number; minority: number }
): void {
  const shareholders: Array<{ player: PlayerStateRecord; shares: number }> = [];
  
  allPlayers.forEach((player) => {
    const shares = player.stocks?.[defunctChain.name] ?? 0;
    if (shares > 0) {
      shareholders.push({ player, shares });
    }
  });

  if (shareholders.length === 0) {
    return;
  }

  shareholders.sort((a, b) => b.shares - a.shares);

  const maxShares = shareholders[0].shares;
  const majorityHolders = shareholders.filter(s => s.shares === maxShares);
  const minorityHolders = shareholders.filter(s => s.shares < maxShares && s.shares > 0);

  // Pay majority bonus(es)
  if (majorityHolders.length === 1) {
    majorityHolders[0].player.cash = (majorityHolders[0].player.cash ?? 0) + bonuses.majority;
    
    // If this is the ONLY shareholder, also give them the minority bonus
    if (shareholders.length === 1) {
      majorityHolders[0].player.cash = (majorityHolders[0].player.cash ?? 0) + bonuses.minority;
    }
  } else if (majorityHolders.length > 1) {
    // Tie: combine bonuses and divide equally
    const totalBonus = bonuses.majority + bonuses.minority;
    const perPlayer = Math.floor(totalBonus / majorityHolders.length);
    majorityHolders.forEach(({ player }) => {
      player.cash = (player.cash ?? 0) + perPlayer;
    });
  }

  // Pay minority bonus(es) if there are non-majority holders
  if (minorityHolders.length > 0 && majorityHolders.length === 1 && shareholders.length > 1) {
    const secondMaxShares = minorityHolders[0].shares;
    const secondHolders = minorityHolders.filter(s => s.shares === secondMaxShares);
    
    if (secondHolders.length === 1) {
      secondHolders[0].player.cash = (secondHolders[0].player.cash ?? 0) + bonuses.minority;
    } else {
      // Tie: divide minority bonus equally
      const perPlayer = Math.floor(bonuses.minority / secondHolders.length);
      secondHolders.forEach(({ player }) => {
        player.cash = (player.cash ?? 0) + perPlayer;
      });
    }
  }
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
];

export function calculateStockPrice(chainSize: number, chainName?: string | null): number {
  // Get base price from size
  const sizeEntry = SIZE_PRICE_TABLE.find((entry) => chainSize <= entry.maxSize) ||
    SIZE_PRICE_TABLE[SIZE_PRICE_TABLE.length - 1];
  const basePrice = sizeEntry.basePrice;
  
  // Add tier premium if chain name is provided
  if (chainName && CHAIN_TIERS[chainName] !== undefined) {
    const tierPremium = CHAIN_TIERS[chainName] * 100;
    return basePrice + tierPremium;
  }
  
  // Fallback to base price if no chain name
  return basePrice;
}

/**
 * Calculate the net worth of a player (cash + value of stocks)
 * Stocks for chains not on the board (size = 0) have no value
 */
export function calculateNetWorth(
  player: PlayerStateRecord,
  chains: ChainRecord[]
): number {
  let netWorth = player.cash || 0;
  
  // Add value of all stocks
  if (player.stocks && chains) {
    Object.entries(player.stocks).forEach(([chainName, shares]) => {
      if ((shares as number) > 0) {
        // Find the chain to get its size
        const chain = chains.find(c => c.name === chainName);
        const chainSize = chain ? (chain.tiles?.length || 0) : 0;
        if (chain && chainSize > 0) {
          const price = calculateStockPrice(chainSize, chainName);
          netWorth += price * (shares as number);
        }
        // If chain is not on board (size = 0), stock has no value
      }
    });
  }
  
  return netWorth;
}


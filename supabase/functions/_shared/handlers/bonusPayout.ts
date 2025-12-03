import { HandlerResult, GameEvent, BonusPayout } from "../events.ts";
import { GameStateRecord, PlayerStateRecord } from "../gameState.ts";
import { ChainRecord } from "../boardUtils.ts";
import { payMergerBonuses, calculateMergerBonuses } from "../gameLogic.ts";

export function handleBonusPayout(
  gameState: GameStateRecord,
  defunctChain: ChainRecord,
  defunctChainSize: number,
): HandlerResult {
  const players = gameState.players ?? [];
  const bonuses = calculateMergerBonuses(defunctChainSize, defunctChain.name);

  // Pay bonuses
  payMergerBonuses(defunctChain, players, bonuses);

  // Generate payout events
  const payouts: BonusPayout[] = [];
  players.forEach((player) => {
    const shares = player.stocks?.[defunctChain.name] ?? 0;
    if (shares > 0) {
      // Determine if this player got majority or minority
      const allShareholders = players
        .map((p) => ({ player: p, shares: p.stocks?.[defunctChain.name] ?? 0 }))
        .filter((s) => s.shares > 0)
        .sort((a, b) => b.shares - a.shares);

      const maxShares = allShareholders[0]?.shares ?? 0;
      const isMajority = shares === maxShares;
      const majorityCount = allShareholders.filter((s) => s.shares === maxShares).length;

      // Calculate what this player received
      const beforeCash = (player.cash ?? 0) - (isMajority ? bonuses.majority : bonuses.minority);
      const afterCash = player.cash ?? 0;
      const received = afterCash - beforeCash;

      if (received > 0) {
        payouts.push({
          playerId: player.id,
          amount: received,
          type: isMajority && majorityCount === 1 ? "majority" : "minority",
        });
      }
    }
  });

  const payoutDescriptions = payouts.map((p) => {
    const player = players.find((pl) => pl.id === p.playerId);
    const playerName = player?.username || `Player ${p.playerId.slice(0, 8)}`;
    return `${playerName} received $${p.amount / 1000}K ${p.type} bonus`;
  });

  const events: GameEvent[] = [
    {
      type: "BonusesPaid",
      defunctChainId: defunctChain.id,
      defunctChainName: defunctChain.name,
      defunctChainSize,
      payouts,
      description: `Bonuses paid for ${defunctChain.name} (size ${defunctChainSize}): ${payoutDescriptions.join(", ")}`,
    },
  ];

  return {
    updatedState: gameState,
    events,
    nextPhase: null,
    moveDescription: events[0].description,
  };
}


import { GamePhase, DisposalQueue, DefunctChain } from "../phases.ts";
import { HandlerResult, GameEvent } from "../events.ts";
import { GameStateRecord } from "../gameState.ts";
import { ChainRecord, assignConnectedClusterToChain, assignTilesToChain } from "../boardUtils.ts";
import { getPlayersInOrder } from "../gameLogic.ts";
import { handleBonusPayout } from "./bonusPayout.ts";
import { dealTilesToPlayer } from "../gameState.ts";
import { buildBuyPendingAction } from "./stockPurchase.ts";

export function handleMergerResolution(
  gameState: GameStateRecord,
  playerId: string,
  survivorChainId: string,
  currentPhase: GamePhase | null,
): HandlerResult {
  if (currentPhase?.type !== "mergerChoice") {
    throw new Error("No merger to resolve.");
  }
  if (currentPhase.playerId !== playerId) {
    throw new Error("Only the active player may resolve this.");
  }

  const board = gameState.board!;
  const chains = gameState.chains as ChainRecord[];
  const players = gameState.players ?? [];
  const turnOrder = gameState.turnOrder ?? [];

  const survivor = chains.find((chain) => chain.id === survivorChainId);
  if (!survivor) {
    throw new Error("Unknown surviving chain.");
  }

  const mergeChainIds = currentPhase.options.map((option) => option.id);
  const mergingChains = chains.filter(
    (chain) => mergeChainIds.includes(chain.id) && chain.id !== survivorChainId,
  );

  // Find largest defunct chain
  const largestDefunct = mergingChains.length > 0
    ? mergingChains.reduce((largest, chain) => {
        const size = chain.tiles?.length ?? 0;
        const largestSize = largest ? (largest.tiles?.length ?? 0) : 0;
        return size > largestSize ? chain : largest;
      }, mergingChains[0])
    : null;

  // Capture defunct chain size BEFORE merging clears the tiles
  const defunctChainSize = largestDefunct ? (largestDefunct.tiles?.length ?? 0) : 0;

  const events: GameEvent[] = [];

  // Pay bonuses for largest defunct chain
  if (largestDefunct) {
    const bonusResult = handleBonusPayout(gameState, largestDefunct, defunctChainSize);
    events.push(...bonusResult.events);
  }

  // Merge chains
  assignConnectedClusterToChain(survivorChainId, currentPhase.tile, board, chains);
  mergingChains.forEach((chain) => {
    assignTilesToChain(survivorChainId, chain.tiles ?? [], board.tiles, chains);
    chain.tiles = [];
    chain.founderId = null;
  });

  events.push({
    type: "MergerResolved",
    playerId,
    survivorId: survivorChainId,
    defunctChainIds: mergingChains.map((c) => c.id),
    description: `Player resolved merger: ${mergingChains.map((c) => c.name).join(", ")} merged into ${survivor.name}`,
  });

  // Setup stock disposal for players who have shares in the defunct chain
  let nextPhase: GamePhase | null = null;

  if (largestDefunct) {
    const playersWithStock = players.filter((p) => {
      const shares = p.stocks?.[largestDefunct.name] ?? 0;
      return shares > 0;
    });

    if (playersWithStock.length > 0) {
      const disposalOrder = getPlayersInOrder(playerId, playersWithStock, turnOrder);
      const firstPlayerId = disposalOrder[0];
      const firstPlayerShares = playersWithStock.find((p) => p.id === firstPlayerId)?.stocks?.[largestDefunct.name] ?? 0;

      const queue: DisposalQueue = {
        defunctChainId: largestDefunct.id,
        defunctChainName: largestDefunct.name,
        defunctChainSize,
        survivingChainId: survivorChainId,
        survivingChainName: survivor.name,
        playerOrder: disposalOrder,
        mergerMakerId: playerId,
      };

      nextPhase = {
        type: "disposalLoop",
        queue,
        currentIndex: 0,
        defunctChains: [], // For now, handle single merger
      };
    } else {
      // No disposal needed, offer stock buying
      const mergerMaker = players.find((p) => p.id === playerId);
      if (mergerMaker) {
        const buyAction = buildBuyPendingAction(
          playerId,
          mergerMaker.cash ?? 0,
          chains,
        );
        if (buyAction) {
          nextPhase = buyAction;
        } else {
          // No stock available, draw tile
          const drawn = dealTilesToPlayer(gameState, playerId, 1);
          if (drawn.length > 0) {
            events.push({
              type: "TilesDrawn",
              playerId,
              count: drawn.length,
              description: `Player drew ${drawn.length} tile(s)`,
            });
          }
        }
      }
    }
  } else {
    // No defunct chain (shouldn't happen in a real merger), offer stock buying
    const mergerMaker = players.find((p) => p.id === playerId);
    if (mergerMaker) {
      const buyAction = buildBuyPendingAction(
        playerId,
        mergerMaker.cash ?? 0,
        chains,
      );
      if (buyAction) {
        nextPhase = buyAction;
      } else {
        // No stock available, draw tile
        const drawn = dealTilesToPlayer(gameState, playerId, 1);
        if (drawn.length > 0) {
          events.push({
            type: "TilesDrawn",
            playerId,
            count: drawn.length,
            description: `Player drew ${drawn.length} tile(s)`,
          });
        }
      }
    }
  }

  return {
    updatedState: gameState,
    events,
    nextPhase,
    moveDescription: events.map((e) => e.description).join("; "),
  };
}


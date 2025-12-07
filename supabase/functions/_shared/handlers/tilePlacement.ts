import { GamePhase, ChainOption, DisposalQueue } from "../phases.ts";
import { HandlerResult, GameEvent } from "../events.ts";
import { GameStateRecord, PlayerStateRecord } from "../gameState.ts";
import {
  TileRecord,
  ChainRecord,
  getAdjacentKeys,
  getTileChainId,
  collectUnassignedCluster,
  assignConnectedClusterToChain,
  assignTilesToChain,
  collectNeighborChains,
} from "../boardUtils.ts";
import { playerHasTile, consumeTileFromHand, dealTilesToPlayer } from "../gameState.ts";
import { getPlayersInOrder, sortDefunctChainsBySize } from "../gameLogic.ts";
import { handleBonusPayout } from "./bonusPayout.ts";
import { buildBuyPendingAction } from "./stockPurchase.ts";

export function handleTilePlacement(
  gameState: GameStateRecord,
  playerId: string,
  tile: string,
  currentPhase: GamePhase | null,
): HandlerResult {
  const board = gameState.board!;
  const chains = gameState.chains as ChainRecord[];
  const players = gameState.players ?? [];
  const player = players.find((p) => p.id === playerId) as PlayerStateRecord | undefined;

  if (!player) {
    throw new Error("Player not found");
  }

  // Validation
  if (!tile) {
    throw new Error("Missing tile value.");
  }
  if (!playerHasTile(gameState, playerId, tile)) {
    throw new Error("Tile must be played from your hand.");
  }
  if (board.tiles[tile]) {
    throw new Error("Tile already occupied.");
  }

  // Consume tile from hand
  consumeTileFromHand(gameState, playerId, tile);
  board.tiles[tile] = {
    player: playerId,
    chainId: null,
  };

  const neighborChains = collectNeighborChains(tile, board, chains);
  const events: GameEvent[] = [];
  let nextPhase: GamePhase | null = null;
  let shouldDraw = true;

  if (neighborChains.size > 1) {
    // Multiple chains adjacent - potential merger
    const mergingChains = Array.from(neighborChains)
      .map((chainId) => chains.find((chain) => chain.id === chainId))
      .filter(Boolean) as ChainRecord[];

    const safeThreshold = gameState.config?.safeChainSize ?? 11;
    const allSafe = mergingChains.every((chain) => {
      return (chain?.tiles?.length ?? 0) >= safeThreshold;
    });

    if (allSafe) {
      // All chains are safe - discard tile
      delete board.tiles[tile];
      throw new Error("Tile discarded because all adjacent hotels are safe.");
    }

    // Determine survivor
    const maxSize = Math.max(...mergingChains.map((chain) => chain?.tiles?.length ?? 0));
    const topChains = mergingChains.filter((chain) => (chain?.tiles?.length ?? 0) === maxSize);

    if (topChains.length === 1) {
      // Single largest chain - auto-merge
      const survivor = topChains[0];
      const mergingOthers = mergingChains.filter((chain) => chain?.id !== survivor?.id);
      
      // Sort all defunct chains by size (largest first)
      const sortedDefunctChains = sortDefunctChainsBySize(mergingOthers);

      // Merge chains - all defunct chains merge into survivor
      assignConnectedClusterToChain(survivor?.id ?? "", tile, board, chains);
      mergingOthers.forEach((chain) => {
        if (!chain) return;
        assignTilesToChain(survivor?.id ?? "", chain.tiles ?? [], board.tiles, chains);
        chain.tiles = [];
        chain.founderId = null;
      });

      events.push({
        type: "TilePlayed",
        playerId,
        tile,
        description: `Player placed tile ${tile}`,
      });

      events.push({
        type: "MergerResolved",
        playerId,
        survivorId: survivor?.id ?? "",
        defunctChainIds: mergingOthers.map((c) => c.id),
        description: `Merger resolved: ${mergingOthers.map((c) => c.name).join(", ")} merged into ${survivor?.name}`,
      });

      // Check if we need player to choose order for equal-sized defunct chains
      if (sortedDefunctChains.length > 0) {
        const largestSize = sortedDefunctChains[0].size;
        const equalSizedChains = sortedDefunctChains.filter((c) => c.size === largestSize);
        const smallerChains = sortedDefunctChains.filter((c) => c.size < largestSize);
        const turnOrder = gameState.turnOrder ?? [];

        if (equalSizedChains.length > 1) {
          // Multiple chains of the same size - player must choose order
          nextPhase = {
            type: "selectDefunctOrder",
            playerId,
            survivingChainId: survivor?.id ?? "",
            survivingChainName: survivor?.name ?? "",
            tile,
            defunctOptions: equalSizedChains,
            processedDefuncts: [],
            remainingDefuncts: smallerChains,
          };
          shouldDraw = false;
        } else {
          // Single largest defunct chain - process it automatically
          const firstDefunct = mergingOthers.find((c) => c.id === sortedDefunctChains[0].id);
          
          if (firstDefunct) {
            // Pay bonuses for this defunct chain
            const bonusResult = handleBonusPayout(gameState, firstDefunct, sortedDefunctChains[0].size);
            events.push(...bonusResult.events);

            const playersWithStock = players.filter((p) => {
              const shares = p.stocks?.[firstDefunct.name] ?? 0;
              return shares > 0;
            });

            if (playersWithStock.length > 0) {
              const disposalOrder = getPlayersInOrder(playerId, playersWithStock, turnOrder);

              const queue: DisposalQueue = {
                defunctChainId: firstDefunct.id,
                defunctChainName: firstDefunct.name,
                defunctChainSize: sortedDefunctChains[0].size,
                survivingChainId: survivor?.id ?? "",
                survivingChainName: survivor?.name ?? "",
                playerOrder: disposalOrder,
                mergerMakerId: playerId,
              };

              // Remaining defunct chains to process after this one
              const remainingDefunctChains = sortedDefunctChains.slice(1);

              nextPhase = {
                type: "disposalLoop",
                queue,
                currentIndex: 0,
                defunctChains: remainingDefunctChains,
              };
              shouldDraw = false;
            } else {
              // No players with stock in this chain, check remaining chains
              const remainingDefunctChains = sortedDefunctChains.slice(1);
              
              if (remainingDefunctChains.length > 0) {
                // Check if next group needs selection
                const nextLargestSize = remainingDefunctChains[0].size;
                const nextEqualSized = remainingDefunctChains.filter((c) => c.size === nextLargestSize);
                const nextSmaller = remainingDefunctChains.filter((c) => c.size < nextLargestSize);

                if (nextEqualSized.length > 1) {
                  nextPhase = {
                    type: "selectDefunctOrder",
                    playerId,
                    survivingChainId: survivor?.id ?? "",
                    survivingChainName: survivor?.name ?? "",
                    tile,
                    defunctOptions: nextEqualSized,
                    processedDefuncts: [sortedDefunctChains[0]],
                    remainingDefuncts: nextSmaller,
                  };
                  shouldDraw = false;
                } else {
                  // Continue with next single chain that has shareholders
                  let foundNextChain = false;
                  
                  for (let i = 0; i < remainingDefunctChains.length; i++) {
                    const nextDefunct = mergingOthers.find((c) => c.id === remainingDefunctChains[i].id);
                    if (nextDefunct) {
                      const nextBonusResult = handleBonusPayout(gameState, nextDefunct, remainingDefunctChains[i].size);
                      events.push(...nextBonusResult.events);

                      const nextPlayersWithStock = players.filter((p) => {
                        const shares = p.stocks?.[nextDefunct.name] ?? 0;
                        return shares > 0;
                      });

                      if (nextPlayersWithStock.length > 0) {
                        const disposalOrder = getPlayersInOrder(playerId, nextPlayersWithStock, turnOrder);

                        const queue: DisposalQueue = {
                          defunctChainId: nextDefunct.id,
                          defunctChainName: nextDefunct.name,
                          defunctChainSize: remainingDefunctChains[i].size,
                          survivingChainId: survivor?.id ?? "",
                          survivingChainName: survivor?.name ?? "",
                          playerOrder: disposalOrder,
                          mergerMakerId: playerId,
                        };

                        nextPhase = {
                          type: "disposalLoop",
                          queue,
                          currentIndex: 0,
                          defunctChains: remainingDefunctChains.slice(i + 1),
                        };
                        shouldDraw = false;
                        foundNextChain = true;
                        break;
                      }
                    }
                  }
                  
                  // If no defunct chains have shareholders, continue normally (don't set phase)
                  if (!foundNextChain) {
                    shouldDraw = true;
                  }
                }
              }
            }
          }
        }
      }
    } else {
      // Multiple chains of same size - player must choose
      nextPhase = {
        type: "mergerChoice",
        playerId,
        tile,
        options: topChains.map((chain) => ({
          id: chain?.id ?? "",
          name: chain?.name ?? "Unknown",
        })),
      };
      shouldDraw = false;
      events.push({
        type: "TilePlayed",
        playerId,
        tile,
        description: `Player placed tile ${tile} (merger required)`,
      });
    }
  } else if (neighborChains.size === 1) {
    // Single chain adjacent - add to chain
    const [chainId] = Array.from(neighborChains);
    assignConnectedClusterToChain(chainId, tile, board, chains);
    events.push({
      type: "TilePlayed",
      playerId,
      tile,
      description: `Player placed tile ${tile}`,
    });
  } else {
    // No chains adjacent - check for new chain formation
    const cluster = collectUnassignedCluster(tile, board, chains);
    if (cluster.length >= 2) {
      const availableChains = chains.filter((chain) => (chain.tiles ?? []).length === 0);
      if (availableChains.length === 0) {
        // No chains available - tile is discarded
        delete board.tiles[tile];
        throw new Error("No available chains to form.");
      } else {
        // Player must choose which chain to start
        nextPhase = {
          type: "foundChain",
          playerId,
          tiles: cluster,
          options: availableChains.map((chain) => ({
            id: chain.id,
            name: chain.name,
          })),
        };
        shouldDraw = false;
        events.push({
          type: "TilePlayed",
          playerId,
          tile,
          description: `Player placed tile ${tile} (chain formation required)`,
        });
      }
    } else {
      // Single tile, no chain formation
      events.push({
        type: "TilePlayed",
        playerId,
        tile,
        description: `Player placed tile ${tile}`,
      });
    }
  }

  // If no next phase set (no merger or chain formation), offer stock buying
  // Tile will be drawn AFTER stock buying is complete
  if (!nextPhase && shouldDraw) {
    const player = players.find((p) => p.id === playerId);
    if (player) {
      const buyAction = buildBuyPendingAction(
        playerId,
        player.cash ?? 0,
        chains,
      );
      if (buyAction) {
        nextPhase = buyAction;
      } else {
        // No stock available to buy, draw tile now
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

  // Generate move description
  const moveDescription = events
    .map((e) => e.description)
    .join("; ");

  return {
    updatedState: gameState,
    events,
    nextPhase,
    moveDescription,
  };
}


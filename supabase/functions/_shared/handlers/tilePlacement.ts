import { GamePhase, ChainOption } from "../phases.ts";
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
      
      assignConnectedClusterToChain(survivor?.id ?? "", tile, board, chains);
      mergingOthers.forEach((chain) => {
        if (!chain) return;
        assignTilesToChain(survivor?.id ?? "", chain.tiles ?? [], board.tiles, chains);
        chain.tiles = [];
        chain.founderId = null;
      });

      // This will trigger bonus payout and disposal phases
      // For now, we'll handle this in the merger handler
      // Just record the tile placement event
      events.push({
        type: "TilePlayed",
        playerId,
        tile,
        description: `Player placed tile ${tile}`,
      });
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

  // Draw tile if appropriate
  if (shouldDraw) {
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


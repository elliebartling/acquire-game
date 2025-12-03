# Turn-by-turn architecture analysis

## Context
This document summarizes the current turn handling approach, key pain points, and options for restructuring move storage and phase control. No code has been changed; this is an analysis and set of recommendations.

## Observations
- **State shape**: A single serialized blob mixes board, players, chains, moves, and `pendingAction`. Moves are stored inline and mirrored into `public_state`, so every turn rewrites the full blob.
- **Server logic**: The Supabase `process-turn` function handles nearly all procedural steps (tile placement, founding, mergers, bonus payouts, disposal, buying, drawing) inside one handler with large conditional branches and interwoven side effects.
- **Client drift risk**: Client helpers record moves and advance indices without awareness of sub-phases; pending action flags are checked generically, so server and client can diverge on whose turn or action is next.
- **Lack of explicit phases**: Sub-phases (merger disposal loops, buy step) are encoded as ad-hoc `pendingAction` payloads rather than a discrete, validated state machine. Disposal order and buy allowances are recomputed in-line instead of stored as structured phase data.
- **Public/private projections**: Public and private views are derived from the same blob; ambiguity about the next actor arises because the blob does not expose a simple phase/actor token.

## Move storage options
- **Separate moves table (recommended medium-term)**: Store each move/event in an append-only table keyed by `game_id`. Benefits include smaller `game_state` rows, paginable history, clearer auditing/replay, and reduced contention. Keep a recent window of moves in `public_state` for quick rendering while treating the table as the source of truth.
- **Remain in the blob (short-term)**: Acceptable while refactoring logic, but the blob grows indefinitely and requires full-row updates. History reconstruction remains costly and intertwined with state updates.

## Recommendations for a more modular, robust turn flow
1. **Explicit phase machine**: Represent phases (`tilePlacement`, `foundChain`, `mergerChoice`, `bonusPayout`, `disposalLoop`, `stockBuy`, `drawTiles`) as a state machine with allowed transitions, replacing the generic `pendingAction` union. Persist the active phase and metadata so clients can deterministically render the next required input.
2. **Modular handlers**: Split the monolithic server handler into domain modules (tile placement, chain founding, merger resolution, bonus payout, disposal, stock buying, end turn). Each should return a uniform result (updated state, events, next phase token) to keep logic composable and testable.
3. **Structured queues for sub-loops**: Persist disposal queues and indices during mergers and advance them after each submission. Represent buy allowances (remaining shares, eligible chains) as structured phase state instead of re-deriving each time.
4. **Authoritative server progression**: Have the server emit the next actor/phase after every move; clients should consume this instead of inferring turn advancement locally to avoid drift.
5. **Event-sourced move log**: If adopting the moves table, type each event (e.g., `TilePlayed`, `ChainStarted`, `MergerResolved`, `BonusesPaid`, `StockDisposed`, `BuyCompleted`, `TilesDrawn`) and use it for auditing, timelines, and recovery. Trim or omit full history from the snapshot blob.
6. **Phase-specific validation**: Replace broad `pendingAction` checks with validators per phase (e.g., only the queued player may dispose; enforce 2-for-1 trade limits; ensure buy allowances and stock availability). This narrows the validation surface and clarifies errors.
7. **Lean public/private projections**: Publish compact public state (phase, active player, queue metadata, recent events). Private views should derive actionable prompts from explicit phase state rather than inferring from the blob.

## Suggested migration path
- **Short term**: Keep move history in the blob but introduce the phase machine and modular handlers; derive `pendingAction` from structured phase state to reduce ambiguity without schema changes.
- **Medium term**: Add a `game_moves` table and dual-write while trimming blob history. Update clients to source history from the table for replays/timelines.
- **Long term**: Move turn/phase state (disposal queues, buy allowances) into dedicated fields or a `turns` table, leaving `game_state` as the authoritative snapshot and using the move log for reconstruction/debugging.

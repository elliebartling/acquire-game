# Acquire Game Architecture

This document expands on the implementation plan to describe the moving parts
of the new Acquire experience. The intent is to give future contributors a
single place to understand how the different layers interact.

## Objectives

- Multiple games can run at the same time without interfering with one
  another. Every API call is scoped by `game_id`.
- Each player can only view the public state plus their own private data
  (hand, cash, private decisions).
- Game history is persisted so the system can surface stats, replays and
  audits.
- Rules and board configurations are pluggable to support variants.

## Layered Overview

| Layer | Responsibilities |
| --- | --- |
| Config (`src/game/config`) | Declarative board + economy settings. |
| Rules (`src/game/rules`) | Applies rule plugins that can mutate config and hook into lifecycle events. |
| State (`src/game/state`) | `GameState`, `BoardState`, `PlayerState`, `ChainState` are the authoritative in-memory model. |
| Logic (`src/game/logic`) | Pure helpers for chains, stock, validation and turn progression. |
| Persistence (`src/game/persistence`) | Serialise/deserialise state, split public/private views, manage history. |
| Stores (`src/stores`) | Pinia stores that interact with Supabase and expose data to Vue components. |
| Components (`src/components/Game`) | Render the UI, dispatch user intent back to stores. |

### Config + Rules

`GameConfig` describes immutable parameters (board dimensions, chain names,
starting cash, stock supply, safe sizes, etc). `ConfigPresets` exposes common
presets. The `RulesEngine` receives the base `StandardRules` plus any optional
plugins from `rulesRegistry`. Rules can:

- Adjust config (e.g. `ExtraHotelsRule` adds tiles to the bag).
- Inject lifecycle hooks (`beforeMove`, `afterMove`, etc).
- Declare UI metadata (label, description, incompatible rule ids).

### State Objects

- **GameState** – orchestrates the board, players, chains, market, move history
  and turn order.
- **BoardState** – tracks tile placement on a width/height grid, exposes helper
  methods for addressable keys (`3-B`), adjacency and placement.
- **PlayerState** – encapsulates public + private player values, including hand,
  cash, stocks, loans.
- **ChainState** – records hotel chains, members, safe status and founders.

State classes are serialisable into plain JSON via `toJSON()` and hydrators
(`fromJSON`, `fromLegacyRecord`) to bridge the existing schema.

### Logic Modules

- `chains.js` – adjacency detection, chain creation, safe chain rules, merger
  resolution helpers.
- `stock.js` – stock price table, buy/sell/trade helpers, majority bonuses.
- `validation.js` – client + server guardrails around tile placement, stock
  buys, merger disposal and end game triggers.
- `turns.js` – determines the current player, enforces draw/buy steps and moves
  to the next player.

These functions remain pure so they can be used both client-side and inside
Supabase Edge Functions.

### Persistence

`GameStateSerializer` is the single entry-point for converting database rows
into state objects. It also returns two filtered views:

- `PublicGameState` – board layout, chain status, stock market, player public
  stats, move log.
- `PrivateGameState` – private data for a single player (hand, cash breakdown,
  pending decisions).

`MoveHistory` keeps a denormalised list of moves for quick rendering and also
acts as the source for storing `game_history` snapshots when a game ends.

### Supabase Integration

- **Tables / Columns**
  - `games.game_state` (`JSONB`) – private canonical state.
  - `games.public_state` (`JSONB`) – cached public view.
  - `games.board_config`, `games.status`, `games.completed_at`.
  - `game_history` – archived final states for stats queries.
- **Edge Functions** (`supabase/functions`)
  - `get-game-state` – returns filtered views.
  - `validate-move` – server-side guard before writing moves.
  - `process-turn` – authoritative turn processor.
  - `resolve-merger` – handles merger payouts atomically.
- **RLS**
  - Enforces that only participants can fetch/update a private state.
  - Public state can be fetched by anyone when the game is marked public.

### Client Data Flow

1. Lobby loads via `useGamesStore`, which only consumes `public_state`.
2. `useGameStore` fetches the full state for a specific `game_id`, applies
   filtering for the authenticated player and subscribes to realtime updates.
3. Components (`Board`, `PlayerHand`, `StockPanel`, `ChainDisplay`) react to
   `publicState` and `playerView`.
4. User intents (play tile, buy stock, dispose post merger) are dispatched to
   Supabase Edge Functions, which validate + persist the authoritative changes.
5. Once a game reaches an end state, `GameHistory` stores a snapshot and emits
   updates so stats screens can refresh.

### Privacy Recap

- **Public**: Board, chains, stock market, move chronology, aggregate cash/net
  worth, player avatars.
- **Private**: Player hand, unspent cash details, pending merger choices.
- Filtering happens inside the server-side functions before responses are sent.

### Future Work

- Expand rule registry with more variants (team play, alternate stock pricing).
- Replay viewer that consumes `game_history`.
- Automated tests for Edge Functions once Supabase migrations are applied.

This document should evolve with the code – feel free to extend it as the game
gains new capabilities.


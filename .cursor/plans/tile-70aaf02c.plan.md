<!-- 70aaf02c-eb2a-41de-a375-3365dc028f0f 1bf1e332-4f66-4ff1-aaf5-3e6229e1fcb7 -->
# Acquire Turn Lifecycle Plan

## Goal

Document the intended end-to-end turn sequence and use that as the blueprint for the `process-turn` refactor.

## Lifecycle steps

1. **Hint generation** – The server examines the requesting player's hand before every move and creates hint metadata indicating:

- Which tiles are blocked because they now touch only safe hotels.
- Which tiles are available for merges (single or multiple chains).
- Which tiles are neutral or start new chains.
The client renders these hints so unplayable tiles are disabled and merge candidates are highlighted.

2. **Tile placement** – When the player submits a `tile` move, the server:

- Verifies the tile was in the hand.
- Places it on the board, updating adjacency and chain metadata.
- Determines whether the placement triggers an automatic merge, a forced merge decision, or a new hotel formation.

3. **Merge resolution / chain start** – Based on the placement result:

- If a merger is forced and one chain is strictly largest, the survivor is chosen automatically.
- If multiple chains tie, a `resolve-merger` pending action is emitted so the player can select the survivor.
- If the tile starts a new hotel, a `start-chain` pending action is emitted.
The UI presents the appropriate buttons until the pending action clears.

4. **Optional stock buying** – After the placement and merge decisions finish, the server evaluates whether the player can afford any stock in active hotels.

- If there is at least one hotel on the board with stock remaining and the player has enough cash for the current price, emit a `buy-stock` pending action with up to 3 share allowance and the list of available hotels.
- If no hotels are affordable or no stock is on the board, skip this action so the turn continues.

5. **Hand cleanup** – Once the buy step completes (or is skipped):

- Discard any tiles that are now blocked by safe hotels.
- Refill the player's hand up to the configured hand size.
- Persist the refreshed hand in the private view so the next player sees six tiles.

## Immediate next steps

- helper-refactor: extract `process-turn` helpers for each lifecycle step so pending actions are created and cleared consistently.
- ui-buy-update: build the hand-aligned bulk-buy panel and wire the `buy-stock` action to it.
- validation-tests: add tests/scenarios for merger-driven pending actions, skipped buys, and blocked tiles.

Let me know if you’d like this plan saved to a dedicated doc (like `docs/turn-lifecycle.md`).
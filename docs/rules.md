# Acquire Rules (Reference)

The official Acquire rules from Hasbro are summarised below for convenience.
For the full text see the reference provided by Carnegie Mellon University:
<https://www.cs.cmu.edu/~lanthony/classes/SEng/Design/acquire.html>.

## Setup

- Each player starts with \$6,000 and draws six random hotel tiles to form
  their opening hand.
- Players draw a tile to determine turn order (lowest coordinate begins).
- The board is a 12×9 grid (columns 1–12, rows A–I).

## Turn Structure

1. **Place a tile** – The tile must match an empty square on the board. If its
   placement creates a chain or triggers a merger, resolve those effects before
   continuing.
2. **Buy stock** – Up to three shares total across any active chains, at prices
   based on chain size.
3. **Draw a tile** – Refill the player’s hand back to six tiles (if available).

## Chains

- Formed when two or more adjacent tiles (non-diagonal) are connected.
- The player who creates a new chain chooses the hotel brand token and receives
  a founder’s bonus of one free share.
- A maximum of seven chains may exist simultaneously; if all brands are taken
  a tile that would start an eighth chain cannot be played.
- Chains with 11+ tiles are “safe” and cannot be taken over.

## Mergers

- Occur when a tile touches tiles from two or more existing chains.
- The largest chain survives; the merging player decides ties.
- Majority and minority shareholders of the defunct chain receive bonuses as
  per the official payout table; if only one shareholder exists they receive
  both bonuses.
- After bonuses, players may **hold** (waiting for a future restart), **sell**
  back to the bank, or **trade** two shares for one share in the surviving chain
  (if stock is available). Players act in turn order starting with the merger
  initiator.
- Multiple mergers resolve in order from largest defunct chain to smallest,
  paying bonuses and handling stock for each.

## Ending the Game

- A player may declare the game over at the start of their turn if:
  - All active chains are safe, **or**
  - Any chain reaches 41 tiles.
- After declaration the player still completes their turn. Then all chains are
  liquidated, bonuses paid, stock sold, and cash counted. Highest total wins.

## Variations Supported in This Project

The new architecture allows optional rules, including:

- **Extra Hotels** – Adds additional tiles to the bag to extend the game.
- **Loans** – Players may take loans and repay them with interest when selling
  stock or at game end.

Rules are implemented as plugins, making it easy to add more variations (team
play, alternate board sizes, etc.). Update this document when new rule packs
are added.


# Supabase Setup & Migrations

The Vue client now depends on server-managed state that lives in Supabase.
Follow the steps below when setting up a new environment or applying schema
changes.

## 1. Configure Environment Variables

Add the following to your `.env.local` (or equivalent). These are already
referenced inside the Edge Functions:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_REDIRECT_URL=http://localhost:5173
```

Supabase Edge Functions additionally require `SUPABASE_SERVICE_ROLE_KEY`. This
is injected automatically when deploying via `supabase functions deploy`, but
when running locally set it through your shell:

```
export SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

## 2. Apply the Migration

```
supabase migration up
```

The migration `20251129120000_game_state_privacy.sql` adds:

- JSON columns (`game_state`, `public_state`, `board_config`, `status`,
  `completed_at`) on `public.games`
- Indexes for faster lookups
- `game_history` table plus `player_stats` view
- Helper function `is_game_participant`
- Column privileges + RLS policies enforcing:
  - Everyone can read lobby-safe columns for public games
  - Only participants can see/update their games
  - History rows are visible only to involved players

## 3. Deploy Edge Functions

```
supabase functions deploy validate-move
supabase functions deploy process-turn
supabase functions deploy get-game-state
supabase functions deploy resolve-merger
```

These functions now:

- Validate the calling user via the Authorization header
- Use the service-role key to fetch/update `games`
- Filter `game_state` so only participants receive private data
- Update `public_state` / `game_state` when moves are processed

## 4. Local Testing

```
supabase start
supabase functions serve validate-move
```

Point your web app to `http://localhost:54321` (default Supabase URL) and log
in so that `Authorization` headers are attached automatically by Supabase JS.

## 5. Troubleshooting

- **403 from get-game-state** – Either the game is private or the auth token is
  missing. Ensure you are logged in and the `Authorization` header is present.
- **Column permission errors** – Re-run `supabase migration up` to ensure the
  grants in the latest migration are applied.
- **Edge function unable to read env vars** – When running locally, export
  `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` before
  executing `supabase functions serve`.


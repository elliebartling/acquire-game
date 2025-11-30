-- Ensure helper extensions exist
create extension if not exists "pgcrypto";

-- Add JSON state columns and metadata to games table
alter table public.games
  add column if not exists game_state jsonb,
  add column if not exists public_state jsonb,
  add column if not exists board_config jsonb,
  add column if not exists status text not null default 'waiting',
  add column if not exists completed_at timestamptz,
  add column if not exists public boolean not null default true;

create index if not exists games_status_idx on public.games (status);
create index if not exists games_completed_at_idx on public.games (completed_at);
create index if not exists games_players_gin_idx on public.games using gin (players);

-- Historical snapshots for stats & replays
create table if not exists public.game_history (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  final_state jsonb not null,
  public_state jsonb not null,
  players uuid[] not null default '{}',
  winner uuid references public.profiles(id),
  final_scores jsonb,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists game_history_game_id_idx on public.game_history (game_id);
create index if not exists game_history_players_idx on public.game_history using gin (players);

-- View for coarse aggregate stats
create or replace view public.player_stats as
select
  player_id,
  count(*) as games_played,
  count(*) filter (where winner = player_id) as wins
from public.game_history,
lateral unnest(players) as player_id
group by player_id;

grant select on public.player_stats to anon, authenticated;

-- Helper function to reuse inside policies
create or replace function public.is_game_participant(game_row public.games)
returns boolean
language sql
stable
as $$
  select auth.uid() = any(game_row.players);
$$;

alter table public.games enable row level security;
alter table public.game_history enable row level security;

-- Column privileges: prevent clients from reading raw game_state
revoke all on public.games from anon, authenticated;
grant select (id, public, public_state, players, rules, status, number_of_seats, net_scores, created_at, board_config, completed_at)
  on public.games to anon, authenticated;
grant insert (id, public, public_state, game_state, players, rules, status, number_of_seats, net_scores, board_config, completed_at)
  on public.games to authenticated;
grant update (public, public_state, players, rules, status, number_of_seats, net_scores, board_config, completed_at)
  on public.games to authenticated;
grant delete on public.games to authenticated;

-- RLS policies for games
drop policy if exists "games public lobby" on public.games;
drop policy if exists "games participants read" on public.games;
drop policy if exists "games participants write" on public.games;

create policy "games public lobby"
  on public.games
  for select
  using (public);

create policy "games participants read"
  on public.games
  for select
  using (public.is_game_participant(games));

create policy "games participants write"
  on public.games
  for all
  using (public.is_game_participant(games))
  with check (public.is_game_participant(games));

create policy "game creator insert"
  on public.games
  for insert
  with check (auth.uid() = any(players));

-- RLS for history
drop policy if exists "history participants read" on public.game_history;
drop policy if exists "history service insert" on public.game_history;

create policy "history participants read"
  on public.game_history
  for select
  using (auth.uid() = any(players));

create policy "history service insert"
  on public.game_history
  for insert
  with check (true);

-- Allow realtime & admin roles to continue working
grant usage, select on all sequences in schema public to anon, authenticated;


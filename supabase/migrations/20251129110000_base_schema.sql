-- Base schema for Acquire game
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_url text,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are readable by everyone"
  on public.profiles
  for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  public boolean not null default true,
  number_of_seats integer not null default 3,
  players uuid[] not null default '{}',
  rules text[] not null default '{}',
  moves jsonb[] default '{}',
  net_scores jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists games_created_at_idx on public.games (created_at desc);

alter table public.games enable row level security;

create policy "Public games visible to everyone"
  on public.games
  for select
  using (public);

create policy "Participants manage their games"
  on public.games
  for all
  using (auth.uid() = any(players))
  with check (auth.uid() = any(players));

create table if not exists public.moves (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  player uuid not null,
  move_type text not null,
  move_value text,
  created_at timestamptz not null default now()
);

create index if not exists moves_game_idx on public.moves (game_id, created_at desc);

alter table public.moves enable row level security;

create policy "Participants can read moves"
  on public.moves
  for select
  using (
    exists (
      select 1 from public.games g
      where g.id = moves.game_id
        and auth.uid() = any(g.players)
    )
  );

create policy "Participants can insert moves"
  on public.moves
  for insert
  with check (
    exists (
      select 1 from public.games g
      where g.id = moves.game_id
        and auth.uid() = any(g.players)
    )
  );


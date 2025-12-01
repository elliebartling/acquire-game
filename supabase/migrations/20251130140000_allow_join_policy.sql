-- Helper function used by join policy
create or replace function public.can_join_game(game_row public.games)
returns boolean
language sql
stable
as $$
  select
    auth.uid() is not null
    and not (auth.uid() = any(game_row.players))
    and coalesce(array_length(game_row.players, 1), 0) < game_row.number_of_seats
    and game_row.status = 'waiting';
$$;

-- Update write policy so only participants can update/delete existing games
drop policy if exists "games participants write" on public.games;

create policy "games participants update"
  on public.games
  for update
  using (public.is_game_participant(games))
  with check (public.is_game_participant(games));

create policy "games participants delete"
  on public.games
  for delete
  using (public.is_game_participant(games))
  ;

-- Allow authenticated players to join a waiting game if there are empty seats
create policy "games allow join"
  on public.games
  for update
  using (public.can_join_game(games))
  with check (auth.uid() = any(players));


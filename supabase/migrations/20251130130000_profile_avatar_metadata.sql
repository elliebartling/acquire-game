-- Adds DiceBear avatar metadata fields to public.profiles and seeds defaults.

alter table public.profiles
  add column if not exists avatar_seed text;

alter table public.profiles
  add column if not exists avatar_style text default 'adventurerNeutral';

alter table public.profiles
  add column if not exists avatar_options jsonb default '{}'::jsonb;

-- Ensure existing rows have deterministic defaults so the app can render avatars immediately.
update public.profiles
set
  avatar_seed = coalesce(avatar_seed, username, id::text),
  avatar_style = coalesce(avatar_style, 'adventurerNeutral'),
  avatar_options = coalesce(
    avatar_options,
    jsonb_build_object(
      'backgroundColor',
      jsonb_build_array('8b5cf6')
    )
  )
where avatar_seed is null or avatar_style is null or avatar_options is null;



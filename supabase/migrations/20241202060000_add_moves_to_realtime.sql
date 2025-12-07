-- Add moves table to Supabase realtime publication
-- This enables postgres_changes subscriptions for the moves table
-- Use DO block to avoid error if table is already in publication

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'moves'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.moves;
  END IF;
END $$;


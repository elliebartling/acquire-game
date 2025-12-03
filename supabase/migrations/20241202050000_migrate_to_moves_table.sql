-- Add new columns to moves table for event sourcing
ALTER TABLE moves ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE moves ADD COLUMN IF NOT EXISTS event_data JSONB;
ALTER TABLE moves ADD COLUMN IF NOT EXISTS phase_before JSONB;
ALTER TABLE moves ADD COLUMN IF NOT EXISTS phase_after JSONB;
ALTER TABLE moves ADD COLUMN IF NOT EXISTS description TEXT;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_moves_game_created ON moves(game_id, created_at);

-- Add comment explaining the description field
COMMENT ON COLUMN moves.description IS 'Human-readable description of the move (e.g., "Player 2 bought 1 Imperial stock")';


-- ============================================
-- Add Free Sessions Support
-- ============================================
-- Allow admins to create free sessions accessible by all registered users

-- Add is_free column to sessions table
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false NOT NULL;

-- Add index for faster queries on free sessions
CREATE INDEX IF NOT EXISTS idx_sessions_is_free ON sessions(is_free);

-- Add comment for documentation
COMMENT ON COLUMN sessions.is_free IS 'If true, this session is free and accessible to all registered users regardless of subscription status';

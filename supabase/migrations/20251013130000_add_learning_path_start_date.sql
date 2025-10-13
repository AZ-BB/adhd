-- Add learning path start date to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS learning_path_started_at TIMESTAMP WITH TIME ZONE;

-- Add comment
COMMENT ON COLUMN users.learning_path_started_at IS 'Date when user first started the learning path. Used to calculate which days are available based on elapsed time.';


-- Modify the foreign key constraint to allow SET NULL on delete
-- This allows us to delete user records even if auth user deletion fails
-- Note: This means auth_id can be NULL, which we'll handle in the application

-- First, drop the existing constraint
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_auth_id_fkey;

-- Add new constraint with ON DELETE SET NULL
-- This allows the user record to be deleted even if auth.users deletion fails
ALTER TABLE users
ADD CONSTRAINT users_auth_id_fkey 
FOREIGN KEY (auth_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

COMMENT ON COLUMN users.auth_id IS 'References auth.users(id). Can be NULL if auth user was deleted separately or deletion failed.';

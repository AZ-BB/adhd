-- Add role columns to users table for admin functionality

-- Add role enum type
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');

-- Add role column to users table (defaults to 'user')
ALTER TABLE users 
ADD COLUMN role user_role DEFAULT 'user' NOT NULL;

-- Add index for faster role lookups
CREATE INDEX idx_users_role ON users(role);

-- Add index on auth_id for faster lookups (if not already exists)
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_auth_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE auth_id = user_auth_id 
        AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is a super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_auth_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE auth_id = user_auth_id 
        AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user_progress_summary view to include role (only if user_learning_path_days table exists)
DROP VIEW IF EXISTS user_progress_summary;

-- Check if user_learning_path_days table exists before creating view
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_learning_path_days'
    ) THEN
        -- Create view with learning path data
        EXECUTE '
        CREATE OR REPLACE VIEW user_progress_summary AS
        SELECT 
            u.id,
            u.auth_id,
            u.child_first_name,
            u.child_last_name,
            u.child_birthday,
            u.child_gender,
            u.parent_first_name,
            u.parent_last_name,
            u.parent_phone,
            u.initial_quiz_score,
            u.created_at,
            u.role,
            COUNT(DISTINCT ulpd.id) as completed_days,
            COALESCE(SUM(ulpd.games_completed), 0) as total_games_completed,
            COALESCE(AVG(ulpd.average_score), 0) as overall_avg_score,
            COALESCE(SUM(ulpd.time_spent), 0) as total_time_spent
        FROM users u
        LEFT JOIN user_learning_path_days ulpd ON u.id = ulpd.user_id AND ulpd.is_completed = true
        GROUP BY u.id, u.auth_id, u.child_first_name, u.child_last_name, u.child_birthday, 
                 u.child_gender, u.parent_first_name, u.parent_last_name, u.parent_phone, 
                 u.initial_quiz_score, u.created_at, u.role
        ';
    ELSE
        -- Create simplified view without learning path data
        EXECUTE '
        CREATE OR REPLACE VIEW user_progress_summary AS
        SELECT 
            u.id,
            u.auth_id,
            u.child_first_name,
            u.child_last_name,
            u.child_birthday,
            u.child_gender,
            u.parent_first_name,
            u.parent_last_name,
            u.parent_phone,
            u.initial_quiz_score,
            u.created_at,
            u.role,
            0 as completed_days,
            0 as total_games_completed,
            0 as overall_avg_score,
            0 as total_time_spent
        FROM users u
        ';
    END IF;
END $$;

-- Helper function to promote user to admin
CREATE OR REPLACE FUNCTION promote_to_admin(user_auth_id UUID, make_super_admin BOOLEAN DEFAULT FALSE)
RETURNS users AS $$
DECLARE
    v_user users;
    v_new_role user_role;
BEGIN
    -- Determine role
    IF make_super_admin THEN
        v_new_role := 'super_admin';
    ELSE
        v_new_role := 'admin';
    END IF;

    -- Update user role
    UPDATE users
    SET role = v_new_role, updated_at = NOW()
    WHERE auth_id = user_auth_id
    RETURNING * INTO v_user;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with auth_id % not found', user_auth_id;
    END IF;

    RETURN v_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to demote admin to regular user
CREATE OR REPLACE FUNCTION demote_to_user(user_auth_id UUID)
RETURNS users AS $$
DECLARE
    v_user users;
BEGIN
    UPDATE users
    SET role = 'user', updated_at = NOW()
    WHERE auth_id = user_auth_id
    RETURNING * INTO v_user;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with auth_id % not found', user_auth_id;
    END IF;

    RETURN v_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage (commented out):
-- To make a user an admin:
-- SELECT promote_to_admin('USER_AUTH_ID'::uuid, false);

-- To make a user a super admin:
-- SELECT promote_to_admin('USER_AUTH_ID'::uuid, true);

-- To demote an admin back to regular user:
-- SELECT demote_to_user('USER_AUTH_ID'::uuid);


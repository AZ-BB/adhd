-- Fix user_progress_summary view to use correct tables and calculate stats properly
DROP VIEW IF EXISTS user_progress_summary;

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
    -- Count completed days from user_day_progress
    COALESCE((
        SELECT COUNT(DISTINCT learning_day_id)
        FROM user_day_progress
        WHERE user_id = u.id AND is_completed = true
    ), 0) as completed_days,
    -- Count total games completed (correct attempts) from user_game_attempts
    COALESCE((
        SELECT COUNT(*)
        FROM user_game_attempts
        WHERE user_id = u.id AND is_correct = true
    ), 0) as total_games_completed,
    -- Calculate average score from all game attempts
    COALESCE((
        SELECT AVG(score)
        FROM user_game_attempts
        WHERE user_id = u.id
    ), 0) as overall_avg_score,
    -- Sum total time spent from all game attempts
    COALESCE((
        SELECT SUM(COALESCE(time_taken_seconds, 0))
        FROM user_game_attempts
        WHERE user_id = u.id
    ), 0) as total_time_spent
FROM users u;


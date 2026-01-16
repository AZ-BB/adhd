-- Quick fix: Expire duplicate active subscriptions
-- For users with multiple active subscription types, keep only the most recent one

DO $$
DECLARE
    user_record RECORD;
    latest_sub RECORD;
BEGIN
    -- Find all users with multiple active subscription types
    FOR user_record IN
        SELECT 
            user_id,
            COUNT(DISTINCT subscription_type) as type_count,
            array_agg(DISTINCT subscription_type) as types
        FROM subscriptions
        WHERE status = 'active'
          AND end_date >= CURRENT_TIMESTAMP
        GROUP BY user_id
        HAVING COUNT(DISTINCT subscription_type) > 1
    LOOP
        -- Get the most recent active subscription for this user
        SELECT * INTO latest_sub
        FROM subscriptions
        WHERE user_id = user_record.user_id
          AND status = 'active'
          AND end_date >= CURRENT_TIMESTAMP
        ORDER BY created_at DESC
        LIMIT 1;
        
        -- Expire all other active subscriptions for this user
        UPDATE subscriptions
        SET status = 'expired',
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = user_record.user_id
          AND status = 'active'
          AND id != latest_sub.id;
        
        RAISE NOTICE 'Expired duplicate subscriptions for user %. Kept subscription % (type: %)', 
            user_record.user_id,
            latest_sub.id,
            latest_sub.subscription_type;
    END LOOP;
END $$;

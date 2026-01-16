-- Fix duplicate active subscriptions
-- This script will:
-- 1. Keep only the most recent active subscription per user/type/package
-- 2. For users with multiple subscription types (games + group_sessions), keep only the most recent one
-- 3. Expire all others

DO $$
DECLARE
    duplicate_record RECORD;
    user_sub_record RECORD;
BEGIN
    -- Step 1: Fix duplicate active subscriptions of the same type/package
    FOR duplicate_record IN
        SELECT 
            user_id,
            subscription_type,
            package_id,
            array_agg(id ORDER BY created_at DESC) as subscription_ids
        FROM subscriptions
        WHERE status = 'active'
        GROUP BY user_id, subscription_type, package_id
        HAVING COUNT(*) > 1
    LOOP
        -- Keep the most recent one (first in array), expire the rest
        UPDATE subscriptions
        SET status = 'expired',
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = duplicate_record.user_id
          AND subscription_type = duplicate_record.subscription_type
          AND package_id = duplicate_record.package_id
          AND status = 'active'
          AND id != duplicate_record.subscription_ids[1]; -- Keep the first (most recent)
        
        RAISE NOTICE 'Expired duplicate subscriptions for user %, type %, package %', 
            duplicate_record.user_id, 
            duplicate_record.subscription_type, 
            duplicate_record.package_id;
    END LOOP;

    -- Step 2: For users with multiple subscription types (games + group_sessions), keep only the most recent one
    FOR user_sub_record IN
        SELECT 
            user_id,
            array_agg(id ORDER BY created_at DESC) as subscription_ids,
            array_agg(subscription_type ORDER BY created_at DESC) as subscription_types
        FROM subscriptions
        WHERE status = 'active'
          AND end_date >= CURRENT_TIMESTAMP
        GROUP BY user_id
        HAVING COUNT(DISTINCT subscription_type) > 1
    LOOP
        -- Keep only the most recent subscription (first in array), expire all others
        UPDATE subscriptions
        SET status = 'expired',
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = user_sub_record.user_id
          AND status = 'active'
          AND id != user_sub_record.subscription_ids[1]; -- Keep the first (most recent)
        
        RAISE NOTICE 'Expired older subscription for user % (had multiple types, keeping most recent: %)', 
            user_sub_record.user_id,
            user_sub_record.subscription_types[1];
    END LOOP;
END $$;

-- Step 3: Expire any subscriptions that have passed their end_date but still have status = 'active'
UPDATE subscriptions
SET status = 'expired',
    updated_at = CURRENT_TIMESTAMP
WHERE status = 'active'
  AND end_date < CURRENT_TIMESTAMP;

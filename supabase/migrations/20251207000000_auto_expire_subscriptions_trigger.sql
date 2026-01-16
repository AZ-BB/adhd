-- Trigger function to automatically expire other active subscriptions
-- when a new subscription is created or updated to active status
-- This ensures only ONE active subscription per user at a time (regardless of type)

CREATE OR REPLACE FUNCTION expire_other_subscriptions()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process if the new/updated subscription is active
    IF NEW.status = 'active' THEN
        -- Expire ALL other active subscriptions for the same user (all types)
        -- This ensures only one subscription is active at a time
        UPDATE subscriptions
        SET status = 'expired',
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id
          AND id != NEW.id
          AND status = 'active';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires AFTER insert or update
DROP TRIGGER IF EXISTS trigger_expire_other_subscriptions ON subscriptions;

CREATE TRIGGER trigger_expire_other_subscriptions
    AFTER INSERT OR UPDATE OF status, subscription_type, package_id ON subscriptions
    FOR EACH ROW
    WHEN (NEW.status = 'active')
    EXECUTE FUNCTION expire_other_subscriptions();

-- Add comment
COMMENT ON FUNCTION expire_other_subscriptions() IS 'Automatically expires ALL other active subscriptions when a new subscription is activated, ensuring only ONE active subscription per user at a time (regardless of type)';

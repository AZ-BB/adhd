-- Function to update expired subscriptions
-- This can be called periodically via a cron job or scheduled task
CREATE OR REPLACE FUNCTION update_expired_subscriptions()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE subscriptions
    SET status = 'expired',
        updated_at = CURRENT_TIMESTAMP
    WHERE status = 'active'
      AND end_date < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job using pg_cron (if extension is enabled)
-- Uncomment the following if you have pg_cron extension enabled:
-- SELECT cron.schedule(
--     'update-expired-subscriptions',
--     '0 0 * * *', -- Run daily at midnight
--     $$SELECT update_expired_subscriptions()$$
-- );

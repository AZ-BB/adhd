-- Add payment_pending status to solo_session_status enum if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'payment_pending'
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'solo_session_status')
    ) THEN
        ALTER TYPE solo_session_status ADD VALUE 'payment_pending';
    END IF;
END$$;



-- Allow users to update their own solo session requests for payment confirmation
-- while relying on server-side validation to enforce allowed transitions.

ALTER TABLE solo_session_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'solo_session_requests'
      AND policyname = 'Users can update own solo requests'
  ) THEN
    CREATE POLICY "Users can update own solo requests"
    ON solo_session_requests
    FOR UPDATE
    USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id))
    WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));
  END IF;
END$$;




-- ============================================
-- Solo 1:1 Sessions Requests
-- ============================================

-- Status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'solo_session_status') THEN
        CREATE TYPE solo_session_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS solo_session_requests (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    coach_id INT REFERENCES coaches(id) ON DELETE SET NULL,
    preferred_time TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INT DEFAULT 60,
    notes TEXT,
    status solo_session_status DEFAULT 'pending' NOT NULL,
    meeting_link TEXT,
    admin_reason TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    responded_by_user_id INT REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_solo_requests_user ON solo_session_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_solo_requests_coach ON solo_session_requests(coach_id);
CREATE INDEX IF NOT EXISTS idx_solo_requests_status ON solo_session_requests(status);
CREATE INDEX IF NOT EXISTS idx_solo_requests_time ON solo_session_requests(preferred_time);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_solo_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_solo_requests_updated_at_trg
    BEFORE UPDATE ON solo_session_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_solo_requests_updated_at();

-- RLS
ALTER TABLE solo_session_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own solo requests"
    ON solo_session_requests
    FOR SELECT
    USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- Users can insert their own requests
CREATE POLICY "Users can insert own solo requests"
    ON solo_session_requests
    FOR INSERT
    WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- Admins can view/manage all
CREATE POLICY "Admins can manage solo requests"
    ON solo_session_requests
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );



-- ============================================
-- Sessions & Coaches Module
-- ============================================

-- 1. Coaches Table
CREATE TABLE IF NOT EXISTS coaches (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    title VARCHAR(255),
    title_ar VARCHAR(255),
    bio TEXT,
    bio_ar TEXT,
    image_url TEXT
);

-- 2. Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    coach_id INT REFERENCES coaches(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    platform VARCHAR(50) NOT NULL, -- Zoom, Meet, Teams, etc.
    meeting_link TEXT NOT NULL,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_participants INT NOT NULL DEFAULT 10,
    duration_minutes INT DEFAULT 60
);

-- 3. Enrollments Table
CREATE TABLE IF NOT EXISTS session_enrollments (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    session_id INT REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(session_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_coach ON sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_session ON session_enrollments(session_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON session_enrollments(user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_sessions_module_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coaches_updated_at
    BEFORE UPDATE ON coaches
    FOR EACH ROW
    EXECUTE FUNCTION update_sessions_module_updated_at();

CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_sessions_module_updated_at();

-- RLS Policies

-- Enable RLS
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_enrollments ENABLE ROW LEVEL SECURITY;

-- Coaches Policies
CREATE POLICY "Everyone can view coaches"
    ON coaches FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage coaches"
    ON coaches FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Sessions Policies
CREATE POLICY "Everyone can view sessions"
    ON sessions FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage sessions"
    ON sessions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Enrollments Policies
CREATE POLICY "Users can view their own enrollments"
    ON session_enrollments FOR SELECT
    USING (
        auth.uid() = (SELECT auth_id FROM users WHERE id = user_id)
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can enroll themselves"
    ON session_enrollments FOR INSERT
    WITH CHECK (
        auth.uid() = (SELECT auth_id FROM users WHERE id = user_id)
    );

CREATE POLICY "Users can cancel their own enrollment"
    ON session_enrollments FOR DELETE
    USING (
        auth.uid() = (SELECT auth_id FROM users WHERE id = user_id)
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );


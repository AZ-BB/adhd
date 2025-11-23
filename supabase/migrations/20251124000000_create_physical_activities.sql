-- ============================================
-- Physical Activities System
-- ============================================
-- This migration creates the physical activities system
-- where users watch 4 random videos per day from the 'physical-activities' bucket
-- Videos are randomly selected each day and users can watch any or all of them

-- Add physical_activities_started_at column to users table
-- This tracks when the user first started watching physical activity videos
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS physical_activities_started_at TIMESTAMP WITH TIME ZONE;

-- Create table to track user's physical activity video progress
CREATE TABLE IF NOT EXISTS user_physical_activity_progress (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    video_number INT NOT NULL, -- The video number (1, 2, 3, etc.)
    watched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_completed BOOLEAN DEFAULT TRUE, -- Whether the user completed watching the video
    watch_duration_seconds INT -- How long they watched (optional)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_physical_activity_user_id 
ON user_physical_activity_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_user_physical_activity_watched_at 
ON user_physical_activity_progress(watched_at);

-- Create table to store physical activity video metadata
CREATE TABLE IF NOT EXISTS physical_activity_videos (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    video_number INT UNIQUE NOT NULL, -- The video number (1, 2, 3, etc.)
    title VARCHAR(255) NOT NULL, -- English title
    title_ar VARCHAR(255) NOT NULL, -- Arabic title
    description TEXT, -- English description
    description_ar TEXT, -- Arabic description
    duration_seconds INT, -- Video duration in seconds
    thumbnail_url TEXT, -- Optional thumbnail URL
    is_active BOOLEAN DEFAULT TRUE, -- Whether this video is available
    storage_path TEXT NOT NULL -- Path in storage bucket (e.g., '1.mp4')
);

-- Create index for video_number
CREATE INDEX IF NOT EXISTS idx_physical_activity_videos_number 
ON physical_activity_videos(video_number);

-- Insert sample physical activity videos (can be updated via admin panel)
INSERT INTO physical_activity_videos (video_number, title, title_ar, description, description_ar, storage_path, is_active)
VALUES
    (1, 'Warm-up Exercises', 'تمارين الإحماء', 'Basic warm-up exercises to start your day', 'تمارين إحماء أساسية لبدء يومك', '1.mp4', true),
    (2, 'Jumping Activities', 'أنشطة القفز', 'Fun jumping exercises for energy', 'تمارين قفز ممتعة للطاقة', '2.mp4', true),
    (3, 'Balance Training', 'تمارين التوازن', 'Improve your balance with these moves', 'حسّن توازنك بهذه الحركات', '3.mp4', true),
    (4, 'Stretching Routine', 'روتين التمدد', 'Gentle stretching for flexibility', 'تمدد لطيف للمرونة', '4.mp4', true),
    (5, 'Coordination Games', 'ألعاب التنسيق', 'Activities to improve coordination', 'أنشطة لتحسين التنسيق', '5.mp4', true),
    (6, 'Dancing Moves', 'حركات الرقص', 'Fun dance movements for kids', 'حركات رقص ممتعة للأطفال', '6.mp4', true),
    (7, 'Animal Walks', 'مشية الحيوانات', 'Imitate animal movements', 'تقليد حركات الحيوانات', '7.mp4', true),
    (8, 'Yoga for Kids', 'اليوغا للأطفال', 'Simple yoga poses', 'وضعيات يوغا بسيطة', '8.mp4', true),
    (9, 'Running Games', 'ألعاب الجري', 'Fun running activities', 'أنشطة جري ممتعة', '9.mp4', true),
    (10, 'Cool Down', 'تهدئة', 'Relaxing cool-down exercises', 'تمارين تهدئة مريحة', '10.mp4', true)
ON CONFLICT (video_number) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_physical_activity_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_physical_activity_progress_updated_at
    BEFORE UPDATE ON user_physical_activity_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_physical_activity_updated_at();

CREATE TRIGGER update_physical_activity_videos_updated_at
    BEFORE UPDATE ON physical_activity_videos
    FOR EACH ROW
    EXECUTE FUNCTION update_physical_activity_updated_at();

-- Grant necessary permissions (adjust based on your RLS policies)
-- These are examples - adjust to your security model
ALTER TABLE user_physical_activity_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_activity_videos ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view and insert their own progress
CREATE POLICY "Users can view own physical activity progress"
    ON user_physical_activity_progress FOR SELECT
    USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can insert own physical activity progress"
    ON user_physical_activity_progress FOR INSERT
    WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update own physical activity progress"
    ON user_physical_activity_progress FOR UPDATE
    USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- Policy: Everyone can view active videos
CREATE POLICY "Users can view active physical activity videos"
    ON physical_activity_videos FOR SELECT
    USING (is_active = true);

-- Policy: Admins can manage videos (you'll need to adjust this based on your admin role setup)
CREATE POLICY "Admins can manage physical activity videos"
    ON physical_activity_videos FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );


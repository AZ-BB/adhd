-- Learning Days Table
CREATE TABLE learning_days (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    day_number INT UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    required_correct_games INT DEFAULT 5 NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Games Table
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(50) NOT NULL, -- 'memory', 'matching', 'sequence', 'attention', 'sorting'
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    difficulty_level INT DEFAULT 1, -- 1-5
    config JSONB, -- Game-specific configuration (grid size, number of items, etc.)
    is_active BOOLEAN DEFAULT true
);

-- Day Games Junction Table (links games to specific days)
CREATE TABLE day_games (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    learning_day_id INT REFERENCES learning_days(id) ON DELETE CASCADE NOT NULL,
    game_id INT REFERENCES games(id) ON DELETE CASCADE NOT NULL,
    order_in_day INT NOT NULL, -- 1-5 for the order of games in a day
    UNIQUE(learning_day_id, game_id),
    UNIQUE(learning_day_id, order_in_day)
);

-- User Day Progress Table
CREATE TABLE user_day_progress (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    learning_day_id INT REFERENCES learning_days(id) ON DELETE CASCADE NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    games_correct_count INT DEFAULT 0,
    current_game_order INT DEFAULT 1, -- Track which game they're on
    UNIQUE(user_id, learning_day_id)
);

-- User Game Attempts Table
CREATE TABLE user_game_attempts (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    game_id INT REFERENCES games(id) ON DELETE CASCADE NOT NULL,
    learning_day_id INT REFERENCES learning_days(id) ON DELETE CASCADE NOT NULL,
    day_game_id INT REFERENCES day_games(id) ON DELETE CASCADE,
    is_correct BOOLEAN NOT NULL,
    score INT DEFAULT 0,
    time_taken_seconds INT, -- Time taken to complete the game
    attempt_number INT DEFAULT 1, -- Allow multiple attempts
    mistakes_count INT DEFAULT 0,
    game_data JSONB -- Store game-specific data (moves, sequence, etc.)
);

-- Indexes for better query performance
CREATE INDEX idx_day_games_learning_day ON day_games(learning_day_id);
CREATE INDEX idx_day_games_game ON day_games(game_id);
CREATE INDEX idx_user_day_progress_user ON user_day_progress(user_id);
CREATE INDEX idx_user_day_progress_day ON user_day_progress(learning_day_id);
CREATE INDEX idx_user_day_progress_completed ON user_day_progress(is_completed);
CREATE INDEX idx_user_game_attempts_user ON user_game_attempts(user_id);
CREATE INDEX idx_user_game_attempts_game ON user_game_attempts(game_id);
CREATE INDEX idx_user_game_attempts_day ON user_game_attempts(learning_day_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_learning_days_updated_at BEFORE UPDATE ON learning_days
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_day_progress_updated_at BEFORE UPDATE ON user_day_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update user day progress when a game is completed
CREATE OR REPLACE FUNCTION update_day_progress_on_game_attempt()
RETURNS TRIGGER AS $$
DECLARE
    required_games INT;
    correct_count INT;
BEGIN
    -- Only proceed if the game attempt was correct
    IF NEW.is_correct THEN
        -- Get required correct games for this day
        SELECT required_correct_games INTO required_games
        FROM learning_days
        WHERE id = NEW.learning_day_id;

        -- Count distinct correct games for this user and day
        SELECT COUNT(DISTINCT game_id) INTO correct_count
        FROM user_game_attempts
        WHERE user_id = NEW.user_id
            AND learning_day_id = NEW.learning_day_id
            AND is_correct = true;

        -- Update or insert user day progress
        INSERT INTO user_day_progress (user_id, learning_day_id, games_correct_count, is_completed, completed_at)
        VALUES (NEW.user_id, NEW.learning_day_id, correct_count, 
                correct_count >= required_games,
                CASE WHEN correct_count >= required_games THEN CURRENT_TIMESTAMP ELSE NULL END)
        ON CONFLICT (user_id, learning_day_id)
        DO UPDATE SET
            games_correct_count = correct_count,
            is_completed = correct_count >= required_games,
            completed_at = CASE 
                WHEN correct_count >= required_games AND user_day_progress.completed_at IS NULL 
                THEN CURRENT_TIMESTAMP 
                ELSE user_day_progress.completed_at 
            END,
            updated_at = CURRENT_TIMESTAMP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update day progress when a game attempt is inserted
CREATE TRIGGER trigger_update_day_progress
    AFTER INSERT ON user_game_attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_day_progress_on_game_attempt();


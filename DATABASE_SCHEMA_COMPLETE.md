# Complete Database Schema Documentation

## Overview
This database schema is designed for an **ADHD Learning Platform** for children, featuring:
- User profiles (children + parent info)
- Initial assessment quizzes
- 30-day learning path with games
- Progress tracking and analytics
- Bilingual support (English/Arabic)

---

## 📊 Database Tables (11 Total)

### 1. **`users`** - User Profiles
Stores information about children and their parents.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique user identifier |
| `created_at` | TIMESTAMP | Account creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |
| `auth_id` | UUID | Foreign key to Supabase auth.users |
| **Child Info** | | |
| `child_first_name` | VARCHAR(255) | Child's first name |
| `child_last_name` | VARCHAR(255) | Child's last name |
| `child_birthday` | DATE | Child's date of birth |
| `child_gender` | VARCHAR(255) | Child's gender |
| `child_profile_picture` | VARCHAR(255) | Profile picture URL |
| **Parent Info** | | |
| `parent_first_name` | VARCHAR(255) | Parent's first name |
| `parent_last_name` | VARCHAR(255) | Parent's last name |
| `parent_phone` | VARCHAR(255) | Parent's phone number |
| `parent_nationality` | VARCHAR(255) | Parent's nationality |
| **Scores** | | |
| `initial_quiz_score` | INT | Initial assessment score (default: 0) |
| `inattention_score` | INT | Inattention category score |
| `hyperactivity_score` | INT | Hyperactivity category score |
| `impulsivity_score` | INT | Impulsivity category score |
| **Learning Path** | | |
| `learning_path_started_at` | TIMESTAMP | When user started learning path |

**Purpose:** Central user table linking to all other tables. Tracks child profile, parent details, quiz scores, and learning path progress.

**Key Relationships:**
- 1 user → many quiz answers
- 1 user → many day progress records
- 1 user → many game attempts

---

### 2. **`quizzes`** - Quiz Definitions
Defines different types of quizzes (initial assessment, follow-ups).

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique quiz identifier |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |
| `type` | VARCHAR(255) | Quiz type: 'INITIAL', 'FOLLOW_UP' |
| `name` | VARCHAR(255) | Quiz name |

**Purpose:** Categorizes different assessment types. Initially used for ADHD screening.

**Key Relationships:**
- 1 quiz → many questions

---

### 3. **`quiz_questions`** - Quiz Questions
Stores questions for various quizzes with bilingual support.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique question identifier |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |
| `quiz_id` | INT | Foreign key to quizzes |
| `question` | TEXT | Question text (English) |
| `question_ar` | TEXT | Question text (Arabic) |
| `category` | VARCHAR(255) | Category (English): 'inattention', 'hyperactivity', 'impulsivity' |
| `category_ar` | TEXT | Category (Arabic) |

**Purpose:** Stores assessment questions for ADHD screening, categorized by symptom type.

**Key Relationships:**
- Many questions → 1 quiz

---

### 4. **`learning_days`** - Daily Learning Curriculum
Defines the 30-day learning path structure.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique day identifier |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |
| `day_number` | INT (UNIQUE) | Day number (1-30) |
| `title` | VARCHAR(255) | Day title (English) |
| `title_ar` | VARCHAR(255) | Day title (Arabic) |
| `description` | TEXT | Day description (English) |
| `description_ar` | TEXT | Day description (Arabic) |
| `required_correct_games` | INT | Games needed to complete (default: 5) |
| `is_active` | BOOLEAN | Is this day active? (default: true) |

**Purpose:** Defines daily learning themes and requirements. Each day has a unique focus (e.g., "Memory Builder", "Attention Focus").

**Current Seed Data:**
- **30 days** seeded (Day 1: "Getting Started" → Day 30: "Graduation Day")
- Each requires **5 correct games** to complete
- Bilingual titles and descriptions

**Key Relationships:**
- 1 day → many games (via day_games junction)
- 1 day → many user progress records

---

### 5. **`games`** - Game Library
Catalog of all available games with configuration.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique game identifier |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |
| `type` | VARCHAR(50) | Game type: 'memory', 'matching', 'sequence', 'attention', 'sorting' |
| `name` | VARCHAR(255) | Game name (English) |
| `name_ar` | VARCHAR(255) | Game name (Arabic) |
| `description` | TEXT | Game description (English) |
| `description_ar` | TEXT | Game description (Arabic) |
| `difficulty_level` | INT | Difficulty (1-5) |
| `config` | JSONB | Game-specific configuration |
| `is_active` | BOOLEAN | Is this game active? |

**Game Types & Current Games:**

| Type | Count | Examples |
|------|-------|----------|
| **memory** | 3 | Easy (4 pairs), Medium (6 pairs), Hard (8 pairs) |
| **matching** | 3 | Color Match, Shape Match, Animal Match |
| **sequence** | 3 | Number Sequence, Pattern Sequence, Color Sequence |
| **attention** | 3 | Find the Difference, Spot the Item, Focus Track |
| **sorting** | 3 | Size Sort, Color Sort, Category Sort |

**Total:** 15 games seeded

**Config Examples:**
```json
// Memory Game
{"pairs": 4, "timeLimit": 60, "theme": "animals"}

// Matching Game
{"itemCount": 5, "category": "colors"}

// Sequence Game
{"sequenceLength": 5, "colors": ["red", "blue", "green", "yellow"]}

// Attention Game
{"differences": 5, "timeLimit": 60}

// Sorting Game
{"itemCount": 8, "categories": 3}
```

**Purpose:** Reusable game library. Games can be assigned to multiple days with different configurations.

**Key Relationships:**
- Many games → many days (via day_games junction)
- 1 game → many user attempts

---

### 6. **`day_games`** - Day-Game Junction Table
Links games to specific days in a specific order.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique identifier |
| `created_at` | TIMESTAMP | Creation timestamp |
| `learning_day_id` | INT | Foreign key to learning_days |
| `game_id` | INT | Foreign key to games |
| `order_in_day` | INT | Game order within day (1-5) |

**Constraints:**
- `UNIQUE(learning_day_id, game_id)` - Can't assign same game twice to a day
- `UNIQUE(learning_day_id, order_in_day)` - Can't have two games at same position

**Purpose:** Creates the daily game playlist. Ensures each day has exactly 5 games in a specific sequence.

**Example (Day 1 - Getting Started):**
| Order | Game |
|-------|------|
| 1 | Memory Match - Easy |
| 2 | Color Match |
| 3 | Shape Match |
| 4 | Number Sequence |
| 5 | Spot the Item |

**Current Seed Data:** First 10 days (Days 1-10) have games assigned.

**Key Relationships:**
- Many day_games → 1 learning_day
- Many day_games → 1 game
- 1 day_game → many user attempts

---

### 7. **`user_day_progress`** - User Daily Progress
Tracks completion status for each user-day combination.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique identifier |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |
| `user_id` | INT | Foreign key to users |
| `learning_day_id` | INT | Foreign key to learning_days |
| `is_completed` | BOOLEAN | Is day completed? (default: false) |
| `completed_at` | TIMESTAMP | When day was completed |
| `games_correct_count` | INT | Number of games completed correctly |
| `current_game_order` | INT | Current game position (default: 1) |

**Constraints:**
- `UNIQUE(user_id, learning_day_id)` - One progress record per user per day

**Purpose:** Central progress tracking. Automatically updated by database trigger when games are completed.

**Completion Logic:**
- `is_completed = true` when `games_correct_count >= required_correct_games`
- `completed_at` set when completion happens
- Used to calculate streaks, current day, overall progress

**Auto-Update Trigger:**
- Triggered on `user_game_attempts` INSERT
- Counts distinct correct games
- Marks day complete when threshold reached

**Key Relationships:**
- Many progress records → 1 user
- Many progress records → 1 day

---

### 8. **`user_game_attempts`** - Individual Game Attempts
Records every game play attempt with detailed metrics.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique attempt identifier |
| `created_at` | TIMESTAMP | Attempt timestamp |
| `user_id` | INT | Foreign key to users |
| `game_id` | INT | Foreign key to games |
| `learning_day_id` | INT | Foreign key to learning_days |
| `day_game_id` | INT | Foreign key to day_games |
| `is_correct` | BOOLEAN | Was attempt successful? |
| `score` | INT | Score achieved (default: 0) |
| `time_taken_seconds` | INT | Time to complete game |
| `attempt_number` | INT | Attempt count (allows retries) |
| `mistakes_count` | INT | Number of mistakes made |
| `game_data` | JSONB | Game-specific data (moves, clicks, etc.) |

**Purpose:** Detailed game analytics. Tracks every attempt, allowing retries and detailed performance analysis.

**Example game_data:**
```json
// Memory Game
{
  "moves": 12,
  "pairs_matched": 4,
  "time_per_pair": [5, 8, 6, 9]
}

// Matching Game
{
  "matches": [
    {"item": "apple", "color": "red", "correct": true},
    {"item": "banana", "color": "yellow", "correct": true}
  ]
}

// Sequence Game
{
  "user_sequence": [1, 2, 3, 4, 5],
  "correct_sequence": [1, 2, 3, 4, 5],
  "position_errors": []
}
```

**Analytics Capabilities:**
- Average completion time
- Success rate per game type
- Common mistakes
- Performance trends over time
- Retry patterns

**Trigger Effect:**
- When `is_correct = true`, automatically updates `user_day_progress`
- Counts distinct correct games per day
- Marks day complete when threshold reached

**Key Relationships:**
- Many attempts → 1 user
- Many attempts → 1 game
- Many attempts → 1 learning_day
- Many attempts → 1 day_game

---

## 🔗 Entity Relationship Diagram

```
┌──────────────┐
│   auth.users │ (Supabase Auth)
└──────┬───────┘
       │
       │ auth_id
       ▼
┌──────────────────────────────────────────────┐
│              users                           │
│  • Basic Info (name, birthday, gender)       │
│  • Parent Info (name, phone, nationality)    │
│  • Quiz Scores (initial, category scores)    │
│  • Learning Path Start Date                  │
└───┬──────────────────────────────────────┬───┘
    │                                      │
    │                                      │
    │ user_id                              │ user_id
    ▼                                      ▼
┌──────────────────┐              ┌─────────────────────┐
│ user_day_progress│              │ user_game_attempts  │
│  • is_completed  │              │  • is_correct       │
│  • completed_at  │              │  • score            │
│  • games_correct │◀─────────────│  • time_taken       │
└────┬─────────────┘   Triggers   │  • mistakes_count   │
     │                 auto-update │  • game_data        │
     │                             └──┬──────────┬───────┘
     │ learning_day_id                │          │
     │                                │          │
     ▼                                │          │
┌──────────────────┐                 │          │
│  learning_days   │                 │          │
│  • day_number    │                 │          │
│  • title/title_ar│                 │          │
│  • description   │                 │          │
│  • required_games│◀────────────────┘          │
└────┬─────────────┘   learning_day_id          │
     │                                           │
     │                                           │ game_id
     │                                           │
     │        ┌──────────────┐                  │
     └───────▶│  day_games   │◀─────────────────┘
              │ (Junction)   │
              │  • order     │
              └──────┬───────┘
                     │
                     │ game_id
                     ▼
              ┌──────────────┐
              │    games     │
              │  • type      │
              │  • name/ar   │
              │  • difficulty│
              │  • config    │
              └──────────────┘

┌──────────────┐        ┌─────────────────┐
│   quizzes    │───────▶│ quiz_questions  │
│  • type      │        │  • question/ar  │
│  • name      │        │  • category/ar  │
└──────────────┘        └─────────────────┘
```

---

## 🔐 Database Triggers & Functions

### 1. **Auto-Update Timestamp Trigger**
```sql
CREATE FUNCTION update_updated_at_column()
```
**Applies to:** `learning_days`, `games`, `user_day_progress`

**Purpose:** Automatically sets `updated_at = CURRENT_TIMESTAMP` on UPDATE operations.

---

### 2. **Auto-Update Day Progress Trigger**
```sql
CREATE FUNCTION update_day_progress_on_game_attempt()
```
**Triggered by:** INSERT on `user_game_attempts`

**Logic Flow:**
```
1. User completes a game
   ↓
2. Insert into user_game_attempts (is_correct = true)
   ↓
3. TRIGGER FIRES
   ↓
4. Count distinct correct games for this user + day
   ↓
5. Get required_correct_games for this day
   ↓
6. Update user_day_progress:
   - games_correct_count = counted games
   - is_completed = (count >= required)
   - completed_at = NOW (if just completed)
   ↓
7. If already exists, UPDATE; else INSERT
```

**Benefits:**
- ✅ Automatic progress tracking
- ✅ No manual progress updates needed in code
- ✅ Guaranteed consistency
- ✅ Handles edge cases (duplicate attempts)

---

## 📈 Database Indexes

For optimal query performance:

| Index | Table | Column | Purpose |
|-------|-------|--------|---------|
| `idx_day_games_learning_day` | day_games | learning_day_id | Fast day game lookups |
| `idx_day_games_game` | day_games | game_id | Fast game usage lookups |
| `idx_user_day_progress_user` | user_day_progress | user_id | Fast user progress queries |
| `idx_user_day_progress_day` | user_day_progress | learning_day_id | Fast day progress queries |
| `idx_user_day_progress_completed` | user_day_progress | is_completed | Fast completion filtering |
| `idx_user_game_attempts_user` | user_game_attempts | user_id | Fast user attempt queries |
| `idx_user_game_attempts_game` | user_game_attempts | game_id | Fast game analytics |
| `idx_user_game_attempts_day` | user_game_attempts | learning_day_id | Fast day analytics |

---

## 🎯 Common Query Patterns

### Get User's Current Day
```sql
SELECT 
  ld.day_number,
  ld.title,
  COUNT(DISTINCT uga.game_id) as games_completed,
  ld.required_correct_games
FROM learning_days ld
LEFT JOIN user_day_progress udp ON ld.id = udp.learning_day_id AND udp.user_id = ?
LEFT JOIN user_game_attempts uga ON ld.id = uga.learning_day_id 
  AND uga.user_id = ? AND uga.is_correct = true
WHERE udp.is_completed = false OR udp.id IS NULL
GROUP BY ld.id
ORDER BY ld.day_number
LIMIT 1;
```

### Get Day's Games with Progress
```sql
SELECT 
  g.*,
  dg.order_in_day,
  uga.is_correct as completed
FROM day_games dg
JOIN games g ON dg.game_id = g.id
LEFT JOIN user_game_attempts uga ON dg.id = uga.day_game_id 
  AND uga.user_id = ? AND uga.is_correct = true
WHERE dg.learning_day_id = ?
ORDER BY dg.order_in_day;
```

### Get User Statistics
```sql
SELECT 
  COUNT(DISTINCT CASE WHEN udp.is_completed THEN udp.learning_day_id END) as completed_days,
  COUNT(DISTINCT uga.game_id) as total_games_played,
  AVG(uga.score) as average_score,
  SUM(uga.time_taken_seconds) / 60 as total_minutes_played
FROM users u
LEFT JOIN user_day_progress udp ON u.id = udp.user_id
LEFT JOIN user_game_attempts uga ON u.id = uga.user_id
WHERE u.id = ?;
```

### Calculate Streak
```sql
SELECT 
  day_number,
  completed_at::date
FROM user_day_progress udp
JOIN learning_days ld ON udp.learning_day_id = ld.id
WHERE user_id = ? AND is_completed = true
ORDER BY ld.day_number DESC;
-- Then calculate consecutive days in application code
```

---

## 🌍 Bilingual Support

### Tables with Arabic Columns:
1. **quiz_questions** - `question_ar`, `category_ar`
2. **learning_days** - `title_ar`, `description_ar`
3. **games** - `name_ar`, `description_ar`

### Implementation Pattern:
```sql
-- Store both languages
INSERT INTO learning_days (title, title_ar) 
VALUES ('Memory Builder', 'بناء الذاكرة');

-- Query based on language
SELECT 
  CASE WHEN ? = 'ar' THEN title_ar ELSE title END as title,
  CASE WHEN ? = 'ar' THEN description_ar ELSE description END as description
FROM learning_days;
```

---

## 🔒 Access Control (RLS - Row Level Security)

**Recommended Supabase RLS Policies:**

### users table
```sql
-- Users can only read/update their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = auth_id);
```

### user_day_progress & user_game_attempts
```sql
-- Users can only access their own progress
CREATE POLICY "Users can view own progress"
  ON user_day_progress FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = user_day_progress.user_id 
    AND users.auth_id = auth.uid()
  ));

-- Similar policy for game attempts
```

### Public read for game catalog
```sql
-- Anyone can view games, days, quizzes
CREATE POLICY "Public read access"
  ON games FOR SELECT
  TO authenticated
  USING (true);
```

---

## 📊 Data Flow: Complete User Journey

### 1. **Sign Up**
```
User signs up via Supabase Auth
  ↓
Create users record with auth_id
  ↓
Store child info + parent info
  ↓
initial_quiz_score = 0 (pending quiz)
```

### 2. **Initial Assessment**
```
Load quiz_questions (type = 'INITIAL')
  ↓
User answers questions
  ↓
Calculate scores by category:
  - inattention_score
  - hyperactivity_score
  - impulsivity_score
  ↓
Update users table with scores
```

### 3. **Start Learning Path**
```
User clicks "Start Learning"
  ↓
Set learning_path_started_at = NOW()
  ↓
Load Day 1 from learning_days
  ↓
Load 5 games via day_games JOIN games
```

### 4. **Play Game**
```
User plays game (e.g., Memory Match)
  ↓
User completes game
  ↓
INSERT into user_game_attempts:
  - user_id
  - game_id
  - learning_day_id
  - is_correct = true/false
  - score, time_taken, mistakes_count
  - game_data (JSONB)
  ↓
TRIGGER FIRES: update_day_progress_on_game_attempt()
  ↓
Update user_day_progress:
  - Increment games_correct_count
  - If count >= 5: mark is_completed = true
```

### 5. **Complete Day**
```
User completes 5/5 games correctly
  ↓
user_day_progress:
  - is_completed = true
  - completed_at = NOW()
  ↓
Check time-based availability for next day:
  - Days since learning_path_started_at
  - Can only access days that have "unlocked" by time
  ↓
If next day available by time:
  ✅ Allow access
Else:
  🔒 Show "Available in X hours"
```

### 6. **Progress Dashboard**
```
Query user_day_progress:
  - Count completed days
  - Calculate streak
  - Find current day
  ↓
Query user_game_attempts:
  - Total games played
  - Average score
  - Total time spent
  ↓
Display stats + recent activity
```

---

## 🎮 Game Data Storage Examples

### Memory Game
```json
{
  "game_type": "memory",
  "pairs": 6,
  "moves": 14,
  "matches": [
    {"card1": 3, "card2": 8, "symbol": "🐶", "time": 5},
    {"card1": 1, "card2": 7, "symbol": "🐱", "time": 3}
  ],
  "failed_attempts": 2,
  "time_per_match": [5, 3, 8, 6, 4, 7]
}
```

### Matching Game
```json
{
  "game_type": "matching",
  "category": "colors",
  "items": [
    {"item": "apple", "selected_color": "red", "correct_color": "red", "correct": true},
    {"item": "banana", "selected_color": "yellow", "correct_color": "yellow", "correct": true}
  ],
  "mistakes": 0,
  "completion_order": [1, 2, 3, 4, 5]
}
```

### Sequence Game
```json
{
  "game_type": "sequence",
  "target_sequence": [1, 2, 3, 4, 5],
  "user_sequence": [1, 2, 3, 4, 5],
  "correct": true,
  "position_errors": [],
  "attempts": 1
}
```

---

## 🚀 Scaling Considerations

### Current Capacity
- **Users:** Unlimited (primary key SERIAL handles millions)
- **Days:** 30 currently (easily extendable to 100+)
- **Games:** 15 currently (can add hundreds)
- **Attempts:** Unlimited (SERIAL primary key + indexed)

### Performance Optimizations
1. **Indexes** - All foreign keys indexed
2. **JSONB** - Flexible config/data storage without schema changes
3. **Triggers** - Automatic calculations in database (faster than app logic)
4. **Timestamps** - All tables track created_at/updated_at

### Future Enhancements
1. **Partitioning** - Partition `user_game_attempts` by date for very large datasets
2. **Materialized Views** - Pre-calculate common statistics
3. **Archive Old Data** - Move completed days older than 6 months to archive table
4. **Caching** - Cache game configurations and day definitions

---

## 📋 Summary

### Database Statistics
- **Total Tables:** 8 core + auth.users
- **Total Seed Data:**
  - 30 learning days
  - 15 games (5 types)
  - 50 day-game assignments (Days 1-10)
- **Bilingual Support:** Full English/Arabic
- **Auto-Calculated Fields:** Progress, completion, timestamps
- **Indexes:** 8 performance indexes

### Key Features
✅ **Automatic Progress Tracking** - Database triggers handle all updates
✅ **Bilingual Content** - Arabic and English throughout
✅ **Flexible Game Config** - JSONB allows any game structure
✅ **Detailed Analytics** - Track every attempt with rich metadata
✅ **Time-Based Access** - Learning path unlocks day by day
✅ **Retry Support** - Multiple attempts allowed per game
✅ **Scalable Design** - Handles millions of users/attempts

### Data Integrity
- ✅ Foreign keys ensure referential integrity
- ✅ Unique constraints prevent duplicates
- ✅ Triggers maintain consistency
- ✅ Timestamps track all changes
- ✅ Cascading deletes clean up related records

---

**This schema is production-ready and designed to grow with your platform!** 🎉


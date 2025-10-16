# Database Schema - Quick Reference

## 🗂️ Tables at a Glance

### 👤 User Management
```
users (Main user profile)
├── id (PK)
├── auth_id → auth.users
├── child info (name, birthday, gender, photo)
├── parent info (name, phone, nationality)
├── quiz scores (initial, inattention, hyperactivity, impulsivity)
└── learning_path_started_at (when they started)
```

### 📝 Assessment System
```
quizzes                    quiz_questions
├── id (PK)               ├── id (PK)
├── type (INITIAL)        ├── quiz_id → quizzes
├── name                  ├── question (EN)
                          ├── question_ar (AR)
                          ├── category (inattention/hyperactivity/impulsivity)
                          └── category_ar
```

### 🎮 Learning Path System
```
learning_days (30 days)
├── id (PK)
├── day_number (1-30, UNIQUE)
├── title / title_ar
├── description / description_ar
├── required_correct_games (default: 5)
└── is_active
      │
      ├── day_games (Junction Table)
      │   ├── id (PK)
      │   ├── learning_day_id → learning_days
      │   ├── game_id → games
      │   └── order_in_day (1-5)
      │
      └── games (15 games)
          ├── id (PK)
          ├── type (memory/matching/sequence/attention/sorting)
          ├── name / name_ar
          ├── description / description_ar
          ├── difficulty_level (1-5)
          ├── config (JSONB - game settings)
          └── is_active
```

### 📊 Progress Tracking
```
user_day_progress (User's daily completion)
├── id (PK)
├── user_id → users
├── learning_day_id → learning_days
├── is_completed (auto-updated by trigger)
├── completed_at
├── games_correct_count (auto-updated)
└── current_game_order

user_game_attempts (Every game play)
├── id (PK)
├── user_id → users
├── game_id → games
├── learning_day_id → learning_days
├── day_game_id → day_games
├── is_correct (success/fail)
├── score
├── time_taken_seconds
├── attempt_number (allows retries)
├── mistakes_count
└── game_data (JSONB - detailed stats)
```

---

## 🔄 Data Flow

### 1️⃣ User Journey
```
Sign Up
  ↓
users table created (auth_id linked)
  ↓
Take Initial Quiz
  ↓
quiz_questions loaded → answers calculated → scores saved to users
  ↓
Start Learning Path
  ↓
learning_path_started_at set → Day 1 unlocked
  ↓
Load Day 1 games via day_games
  ↓
Play Game
  ↓
Record attempt in user_game_attempts
  ↓
🤖 TRIGGER: Auto-update user_day_progress
  ↓
Complete 5/5 games
  ↓
user_day_progress.is_completed = true
  ↓
Next day unlocks (time-based)
```

### 2️⃣ Automatic Progress Update (Trigger)
```
INSERT into user_game_attempts (is_correct = true)
  ↓
TRIGGER: update_day_progress_on_game_attempt()
  ↓
Count distinct correct games for user + day
  ↓
Compare with required_correct_games
  ↓
UPDATE user_day_progress:
  - games_correct_count = count
  - is_completed = (count >= required)
  - completed_at = NOW (if just completed)
```

---

## 🎯 Key Relationships

```
users (1) ──→ (many) user_day_progress
users (1) ──→ (many) user_game_attempts

learning_days (1) ──→ (many) day_games ←── (many) games
learning_days (1) ──→ (many) user_day_progress
learning_days (1) ──→ (many) user_game_attempts

games (1) ──→ (many) day_games
games (1) ──→ (many) user_game_attempts

day_games (1) ──→ (many) user_game_attempts

quizzes (1) ──→ (many) quiz_questions
```

---

## 🔑 Unique Constraints

| Table | Constraint | Purpose |
|-------|------------|---------|
| `learning_days` | `day_number` UNIQUE | Each day number appears once |
| `day_games` | `(learning_day_id, game_id)` UNIQUE | Same game can't repeat in a day |
| `day_games` | `(learning_day_id, order_in_day)` UNIQUE | Each position 1-5 used once |
| `user_day_progress` | `(user_id, learning_day_id)` UNIQUE | One progress record per user per day |

---

## 📈 Important Indexes

```sql
-- User progress queries
idx_user_day_progress_user (user_id)
idx_user_day_progress_completed (is_completed)

-- User attempts queries  
idx_user_game_attempts_user (user_id)
idx_user_game_attempts_day (learning_day_id)

-- Day/Game lookups
idx_day_games_learning_day (learning_day_id)
idx_day_games_game (game_id)
```

---

## 🌍 Bilingual Columns

| Table | English Column | Arabic Column |
|-------|---------------|---------------|
| `quiz_questions` | `question` | `question_ar` |
| `quiz_questions` | `category` | `category_ar` |
| `learning_days` | `title` | `title_ar` |
| `learning_days` | `description` | `description_ar` |
| `games` | `name` | `name_ar` |
| `games` | `description` | `description_ar` |

**Usage Pattern:**
```typescript
// In server actions
const title = isArabic ? day.title_ar : day.title
```

---

## 📊 Common Queries (TypeScript Examples)

### Get User's Current Day
```typescript
const { data: currentDay } = await supabase
  .from('learning_days')
  .select(`
    *,
    user_day_progress!inner(is_completed, games_correct_count)
  `)
  .eq('user_day_progress.user_id', userId)
  .eq('user_day_progress.is_completed', false)
  .order('day_number', { ascending: true })
  .limit(1)
  .single()
```

### Get Day with Games
```typescript
const { data } = await supabase
  .from('learning_days')
  .select(`
    *,
    day_games(
      order_in_day,
      games(*)
    )
  `)
  .eq('day_number', dayNumber)
  .single()
```

### Record Game Attempt
```typescript
const { data } = await supabase
  .from('user_game_attempts')
  .insert({
    user_id: userId,
    game_id: gameId,
    learning_day_id: dayId,
    day_game_id: dayGameId,
    is_correct: true,
    score: 100,
    time_taken_seconds: 45,
    mistakes_count: 0,
    game_data: { moves: 12, pairs: 6 }
  })
// Trigger automatically updates user_day_progress!
```

### Get User Statistics
```typescript
const { data: stats } = await supabase
  .from('user_day_progress')
  .select('is_completed')
  .eq('user_id', userId)
  .eq('is_completed', true)
// Count completed days

const { data: attempts } = await supabase
  .from('user_game_attempts')
  .select('score, time_taken_seconds')
  .eq('user_id', userId)
// Calculate averages
```

---

## 🤖 Database Triggers

### 1. Auto-update `updated_at`
```sql
Applies to: learning_days, games, user_day_progress
Trigger: BEFORE UPDATE
Effect: Sets updated_at = CURRENT_TIMESTAMP
```

### 2. Auto-update Day Progress
```sql
Table: user_game_attempts
Trigger: AFTER INSERT
Condition: is_correct = true
Effect:
  1. Count distinct correct games for user + day
  2. Update user_day_progress:
     - games_correct_count = count
     - is_completed = (count >= required_correct_games)
     - completed_at = NOW (if newly completed)
```

---

## 🎮 Game Types & Config

| Type | Count | Config Example |
|------|-------|----------------|
| **memory** | 3 | `{"pairs": 6, "timeLimit": 90, "theme": "shapes"}` |
| **matching** | 3 | `{"itemCount": 5, "category": "colors"}` |
| **sequence** | 3 | `{"sequenceLength": 5, "colors": ["red","blue"]}` |
| **attention** | 3 | `{"differences": 5, "timeLimit": 60}` |
| **sorting** | 3 | `{"itemCount": 8, "categories": 3}` |

**Total Games:** 15

---

## 🚦 Access Control (Time-Based)

### How It Works:
```typescript
// When user starts learning path
users.learning_path_started_at = NOW()

// Calculate available day
const daysElapsed = Math.floor(
  (Date.now() - learningPathStartedAt) / (1000 * 60 * 60 * 24)
)
const availableDay = daysElapsed + 1

// Check access
canAccessDay = requestedDay <= availableDay
```

**Result:** Users can only access days that have "unlocked" by time, preventing binge-playing.

---

## 📦 Current Seed Data

| Item | Count | Status |
|------|-------|--------|
| Learning Days | 30 | ✅ Fully seeded |
| Games | 15 | ✅ Fully seeded |
| Day-Game Links | 50 | ⚠️ Days 1-10 only |
| Users | 0 | Created on signup |
| Progress Records | 0 | Created on first game |

**Next Steps:** Add games to Days 11-30.

---

## 🎯 Quick Stats

- **Tables:** 8 core tables
- **Relationships:** 12 foreign keys
- **Indexes:** 8 performance indexes
- **Triggers:** 2 automation triggers
- **Bilingual Fields:** 6 Arabic columns
- **Auto-Calculated:** Progress, completion, timestamps
- **Max Days:** 30 (easily extendable)
- **Max Games:** Unlimited
- **Max Users:** Unlimited

---

## 🔒 Security Notes

### Recommended RLS (Row Level Security)
```sql
-- users: Can only view/update own profile
auth.uid() = auth_id

-- user_day_progress: Can only view own progress
user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())

-- user_game_attempts: Can only view own attempts
user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())

-- games, learning_days: Public read for authenticated users
TO authenticated USING (true)
```

---

**Need more details? See `DATABASE_SCHEMA_COMPLETE.md`** 📚


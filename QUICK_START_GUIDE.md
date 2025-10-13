# Quick Start Guide - Learning Path System

## Step 1: Run Database Migrations

First, apply the migrations to your Supabase database:

```bash
# Make sure you have Supabase CLI installed
# If not: npm install -g supabase

# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

Or you can manually run the SQL files in your Supabase SQL editor:
1. `supabase/migrations/20251013120000_create_learning_path.sql`
2. `supabase/migrations/20251013120001_seed_learning_path.sql`

## Step 2: Access the Learning Path

The learning path is now available at:
- Main overview: `/learning-path`
- Individual days: `/learning-path/1`, `/learning-path/2`, etc.

## Step 3: Understanding the Flow

### User Journey
1. User visits `/learning-path` - sees all 30 days with their progress
2. User can only access Day 1 initially (locked progression)
3. User clicks on Day 1 to start
4. User plays 5 games, each must be completed correctly
5. Once all 5 games are correct, Day 1 is marked complete
6. Day 2 becomes unlocked
7. Process repeats for all 30 days

### Automatic Progress Tracking
- When a game is completed correctly, a database trigger automatically:
  - Updates `user_day_progress.games_correct_count`
  - Marks day as complete when all games are done
  - Sets the `completed_at` timestamp

## Available Games

Currently implemented:
- **Memory Match** - Full implementation in `src/components/games/MemoryGame.tsx`

Need to be implemented:
- Matching Games
- Sequence Games
- Attention Games
- Sorting Games

## How to Create a New Game Component

### 1. Create the Game Component

Create a new file: `src/components/games/YourGameName.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Game, GameConfig } from '@/types/learning-path'
import { recordGameAttempt } from '@/actions/learning-path'

interface YourGameProps {
  game: Game
  userId: number
  learningDayId: number
  dayGameId: number
  onComplete: (isCorrect: boolean, score: number) => void
}

export default function YourGame({ game, userId, learningDayId, dayGameId, onComplete }: YourGameProps) {
  const config = game.config as GameConfig
  const [gameCompleted, setGameCompleted] = useState(false)
  
  const handleGameEnd = async (isCorrect: boolean) => {
    if (gameCompleted) return
    setGameCompleted(true)
    
    const score = isCorrect ? 100 : 0
    
    await recordGameAttempt({
      userId,
      gameId: game.id,
      learningDayId,
      dayGameId,
      isCorrect,
      score,
      timeTakenSeconds: 0, // Track actual time
      mistakesCount: 0, // Track actual mistakes
      gameData: {
        // Your game-specific data
      }
    })
    
    onComplete(isCorrect, score)
  }
  
  return (
    <div>
      {/* Your game UI here */}
    </div>
  )
}
```

### 2. Add Game to LearningDayClient

Edit `src/app/(protected)/learning-path/[day]/LearningDayClient.tsx`:

```typescript
import YourGame from '@/components/games/YourGame'

// In the render section, add:
{currentGame.game.type === 'your_type' && (
  <YourGame
    game={currentGame.game}
    userId={userId}
    learningDayId={day.id}
    dayGameId={currentGame.dayGame.id}
    onComplete={handleGameComplete}
  />
)}
```

### 3. Add Game to Database

```sql
INSERT INTO games (type, name, name_ar, description, description_ar, difficulty_level, config) 
VALUES (
  'your_type',
  'Your Game Name',
  'اسم لعبتك',
  'Game description',
  'وصف اللعبة',
  1,
  '{"your": "config"}'::jsonb
);
```

### 4. Assign Game to Days

```sql
INSERT INTO day_games (learning_day_id, game_id, order_in_day)
SELECT 11, id, 1 FROM games WHERE name = 'Your Game Name';
```

## API Reference

### Get User's Current Day
```typescript
import { getUserCurrentDay } from '@/actions/learning-path'

const currentDay = await getUserCurrentDay(userId)
```

### Get Day Progress
```typescript
import { getDayProgressDetails } from '@/actions/learning-path'

const dayDetails = await getDayProgressDetails(userId, dayNumber)
```

### Record Game Attempt
```typescript
import { recordGameAttempt } from '@/actions/learning-path'

await recordGameAttempt({
  userId: 1,
  gameId: 5,
  learningDayId: 1,
  isCorrect: true,
  score: 95,
  timeTakenSeconds: 45,
  mistakesCount: 2,
  gameData: { /* game-specific data */ }
})
```

### Get User Statistics
```typescript
import { getUserLearningPathStats } from '@/actions/learning-path'

const stats = await getUserLearningPathStats(userId)
// Returns: totalDays, completedDays, currentDay, totalGamesPlayed, etc.
```

## Testing

### Test the System
1. Create a test user account
2. Visit `/learning-path`
3. Start Day 1
4. Complete all 5 games
5. Verify Day 1 shows as complete
6. Verify Day 2 becomes unlocked

### Check Database
```sql
-- Check user progress
SELECT * FROM user_day_progress WHERE user_id = YOUR_USER_ID;

-- Check game attempts
SELECT * FROM user_game_attempts WHERE user_id = YOUR_USER_ID;

-- Check day completion
SELECT 
  ld.day_number,
  ld.title,
  udp.is_completed,
  udp.games_correct_count,
  udp.completed_at
FROM learning_days ld
LEFT JOIN user_day_progress udp ON ld.id = udp.learning_day_id AND udp.user_id = YOUR_USER_ID
ORDER BY ld.day_number;
```

## Customization

### Change Number of Required Games Per Day
Update the `required_correct_games` column in `learning_days` table:

```sql
UPDATE learning_days 
SET required_correct_games = 3 
WHERE day_number = 1;
```

### Add More Days
```sql
INSERT INTO learning_days (day_number, title, title_ar, description, description_ar)
VALUES (31, 'Bonus Day', 'يوم إضافي', 'Extra challenges', 'تحديات إضافية');
```

### Modify Game Configuration
```sql
UPDATE games 
SET config = '{"pairs": 10, "timeLimit": 120}'::jsonb
WHERE id = 1;
```

## Troubleshooting

### Day not unlocking after completion
Check if the trigger is working:
```sql
SELECT * FROM user_day_progress WHERE user_id = YOUR_USER_ID;
```

If `is_completed` is false but `games_correct_count >= required_correct_games`, manually trigger:
```sql
UPDATE user_day_progress 
SET is_completed = true, 
    completed_at = NOW()
WHERE user_id = YOUR_USER_ID 
  AND learning_day_id = YOUR_DAY_ID
  AND games_correct_count >= (
    SELECT required_correct_games 
    FROM learning_days 
    WHERE id = YOUR_DAY_ID
  );
```

### Reset User Progress
```sql
-- Reset a specific day
DELETE FROM user_game_attempts WHERE user_id = YOUR_USER_ID AND learning_day_id = YOUR_DAY_ID;
DELETE FROM user_day_progress WHERE user_id = YOUR_USER_ID AND learning_day_id = YOUR_DAY_ID;

-- Reset all progress for a user
DELETE FROM user_game_attempts WHERE user_id = YOUR_USER_ID;
DELETE FROM user_day_progress WHERE user_id = YOUR_USER_ID;
```

## Next Steps

1. ✅ Database schema created
2. ✅ Server actions implemented
3. ✅ Types defined
4. ✅ UI pages created
5. ✅ Memory game implemented
6. ⬜ Implement remaining 4 game types
7. ⬜ Add sound effects and animations
8. ⬜ Add Row Level Security (RLS) policies
9. ⬜ Add rewards/badges system
10. ⬜ Add parent dashboard to view child progress

## Security Notes

Add RLS policies to protect user data:

```sql
-- Enable RLS
ALTER TABLE user_day_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_game_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own progress
CREATE POLICY "Users can view own progress" ON user_day_progress
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- Policy: Users can insert their own progress
CREATE POLICY "Users can insert own progress" ON user_day_progress
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- Similar policies for user_game_attempts
CREATE POLICY "Users can view own attempts" ON user_game_attempts
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can insert own attempts" ON user_game_attempts
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));
```

## Support

For questions or issues:
1. Check the documentation: `LEARNING_PATH_DOCUMENTATION.md`
2. Review the database schema in migration files
3. Check the TypeScript types in `src/types/learning-path.ts`
4. Review example implementations in `src/components/games/MemoryGame.tsx`


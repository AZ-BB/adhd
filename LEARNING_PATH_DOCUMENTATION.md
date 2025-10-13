# Learning Path System Documentation

## Overview
This learning path system allows kids to progress through 30 days of educational games. Each day contains 5 games that must be completed correctly to mark the day as complete. The system tracks all progress and game attempts in the database.

## Database Schema

### Tables Created

#### 1. `learning_days`
Stores information about each day in the learning path.
- `id`: Primary key
- `day_number`: Unique day number (1-30)
- `title` / `title_ar`: Day title in English/Arabic
- `description` / `description_ar`: Day description
- `required_correct_games`: Number of games needed to complete the day (default: 5)
- `is_active`: Whether the day is active

#### 2. `games`
Stores all available games.
- `id`: Primary key
- `type`: Game type (`memory`, `matching`, `sequence`, `attention`, `sorting`)
- `name` / `name_ar`: Game name in English/Arabic
- `description` / `description_ar`: Game description
- `difficulty_level`: 1-5 difficulty rating
- `config`: JSON configuration for game-specific settings
- `is_active`: Whether the game is active

#### 3. `day_games`
Junction table linking games to specific days.
- `id`: Primary key
- `learning_day_id`: Reference to learning_days
- `game_id`: Reference to games
- `order_in_day`: Order of the game (1-5)

#### 4. `user_day_progress`
Tracks user progress for each day.
- `id`: Primary key
- `user_id`: Reference to users
- `learning_day_id`: Reference to learning_days
- `is_completed`: Whether the day is completed
- `completed_at`: Timestamp of completion
- `games_correct_count`: Number of games completed correctly
- `current_game_order`: Current game the user is on

#### 5. `user_game_attempts`
Records every game attempt by users.
- `id`: Primary key
- `user_id`: Reference to users
- `game_id`: Reference to games
- `learning_day_id`: Reference to learning_days
- `day_game_id`: Reference to day_games
- `is_correct`: Whether the attempt was successful
- `score`: Score achieved (0-100)
- `time_taken_seconds`: Time to complete
- `attempt_number`: Attempt number for this game
- `mistakes_count`: Number of mistakes made
- `game_data`: JSON data with game-specific details

## Automatic Progress Tracking

The system includes a database trigger that automatically updates `user_day_progress` when a game attempt is recorded:

1. When a user completes a game correctly, the trigger fires
2. It counts the number of distinct correct games for that day
3. Updates the `games_correct_count` in `user_day_progress`
4. Automatically marks the day as complete when `games_correct_count >= required_correct_games`
5. Sets the `completed_at` timestamp

## Game Types

### 1. Memory Games
Match pairs of cards. Configuration includes:
- `pairs`: Number of card pairs (4-8)
- `timeLimit`: Time limit in seconds
- `theme`: Visual theme (animals, shapes, colors)

### 2. Matching Games
Match related items. Configuration includes:
- `itemCount`: Number of items to match
- `category`: Category of items (colors, shapes, animals)

### 3. Sequence Games
Remember or complete sequences. Configuration includes:
- `sequenceLength`: Length of sequence
- `patternLength`: Length of pattern
- `difficulty`: Difficulty level

### 4. Attention Games
Focus and attention tasks. Configuration includes:
- `differences`: Number of differences to find
- `duration`: Time duration
- `targetCount`: Number of targets to find

### 5. Sorting Games
Sort items into categories. Configuration includes:
- `itemCount`: Number of items
- `categories`: Number of categories
- `colorGroups`: Number of color groups

## Server Actions (API)

All server actions are in `src/actions/learning-path.ts`:

### Learning Days
- `getLearningDays()`: Get all learning days
- `getLearningDayWithGames(dayId)`: Get a specific day with its games
- `getLearningDayByNumber(dayNumber)`: Get day by number (1-30)

### User Progress
- `getUserDayProgress(userId, learningDayId)`: Get user's progress for a day
- `getUserAllDayProgress(userId)`: Get all user's day progress
- `getUserGameAttemptsForDay(userId, learningDayId)`: Get game attempts for a day
- `getDayProgressDetails(userId, dayNumber)`: Get comprehensive day details with progress

### Game Attempts
- `recordGameAttempt({userId, gameId, learningDayId, isCorrect, score, ...})`: Record a game attempt

### Statistics
- `getUserLearningPathStats(userId)`: Get comprehensive user statistics including:
  - Total days and completed days
  - Current day
  - Total games played/completed
  - Average score
  - Total time played
  - Streak (consecutive days)
  - Last played date

### Utility
- `getUserCurrentDay(userId)`: Get user's current active day
- `canAccessDay(userId, dayNumber)`: Check if user can access a day (must complete previous)
- `resetDayProgress(userId, learningDayId)`: Reset day progress for retry
- `getGameLeaderboard(gameId, limit)`: Get leaderboard for a game

## TypeScript Types

All types are in `src/types/learning-path.ts`:

- `Game`, `LearningDay`, `DayGame`: Base entities
- `UserDayProgress`, `UserGameAttempt`: Progress tracking
- `GameConfig`, `GameAttemptData`: Configuration and data
- `DayProgressResponse`: Complete day details
- `UserLearningPathStats`: User statistics
- Game state types for frontend: `MemoryGameState`, `MatchingGameState`, etc.

## Usage Example

### Getting User's Current Day
```typescript
import { getUserCurrentDay } from '@/actions/learning-path'

const currentDay = await getUserCurrentDay(userId)
console.log(`Current day: ${currentDay.day_number} - ${currentDay.title}`)
```

### Recording a Game Attempt
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
  gameData: {
    moves: 20,
    matchedPairs: [1, 2, 3, 4]
  }
})
```

### Getting Day Progress
```typescript
import { getDayProgressDetails } from '@/actions/learning-path'

const dayDetails = await getDayProgressDetails(userId, 1)

console.log(`Day: ${dayDetails.day.title}`)
console.log(`Progress: ${dayDetails.progress?.games_correct_count}/5 games`)
console.log(`Completed: ${dayDetails.progress?.is_completed}`)

dayDetails.games.forEach(game => {
  console.log(`${game.game.name}: ${game.isCompleted ? 'Complete' : 'Incomplete'}`)
})
```

### Getting User Statistics
```typescript
import { getUserLearningPathStats } from '@/actions/learning-path'

const stats = await getUserLearningPathStats(userId)

console.log(`Progress: ${stats.completedDays}/${stats.totalDays} days`)
console.log(`Current streak: ${stats.streak} days`)
console.log(`Average score: ${stats.averageScore}`)
```

## Seeded Data

The system comes pre-seeded with:
- 30 learning days with titles and descriptions (English & Arabic)
- 15 different games across 5 game types
- Games assigned to the first 10 days

Days 11-30 are created but don't have games assigned yet. You can add more games and assign them using:

```sql
INSERT INTO day_games (learning_day_id, game_id, order_in_day) VALUES
(11, 1, 1),
(11, 2, 2),
-- ... etc
```

## Migration Files

1. `20251013120000_create_learning_path.sql` - Creates all tables, indexes, and triggers
2. `20251013120001_seed_learning_path.sql` - Seeds initial data (days 1-30, 15 games, games for days 1-10)

## Next Steps for Implementation

1. **Create Game Components**: Build React components for each game type
2. **Create Day View Page**: Page to display a day and its games
3. **Create Progress Dashboard**: Overview of user's progress
4. **Implement Game Logic**: Actual game mechanics for each game type
5. **Add Rewards System**: Badges, points, or other rewards for completing days
6. **Add Animations**: Celebrate when games/days are completed
7. **Create Admin Panel**: To manage days, games, and assignments

## Security Considerations

- Add Row Level Security (RLS) policies to ensure users can only access their own progress
- Validate game attempts on the server side to prevent cheating
- Add rate limiting to prevent spam attempts

## Performance Optimizations

- All necessary indexes are already created
- Consider caching user statistics
- Implement pagination for leaderboards
- Add materialized views for complex statistics if needed


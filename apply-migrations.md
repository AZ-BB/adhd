# How to Apply Learning Path Migrations

## Option 1: Using Supabase CLI (Recommended)

If you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push
```

## Option 2: Manual SQL Execution

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Execute the following files in order:

### Step 1: Create Tables and Triggers
Copy and paste the entire contents of:
`supabase/migrations/20251013120000_create_learning_path.sql`

Click "Run" to execute.

### Step 2: Seed Initial Data
Copy and paste the entire contents of:
`supabase/migrations/20251013120001_seed_learning_path.sql`

Click "Run" to execute.

### Step 3: Add Time-Based Locking (NEW!)
Copy and paste the entire contents of:
`supabase/migrations/20251013130000_add_learning_path_start_date.sql`

Click "Run" to execute.

This adds time-based day unlocking so users can only access one day per calendar day.

## Verify Installation

After applying migrations, verify with these queries:

### Check Tables Created
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'learning_days',
  'games', 
  'day_games',
  'user_day_progress',
  'user_game_attempts'
);
```

Expected result: 5 rows

### Check Time-Based Column Added
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'learning_path_started_at';
```

Expected result: 1 row (column exists)

### Check Days Seeded
```sql
SELECT COUNT(*) as total_days FROM learning_days;
```

Expected result: 30

### Check Games Seeded
```sql
SELECT COUNT(*) as total_games FROM games;
```

Expected result: 15

### Check Day-Game Assignments
```sql
SELECT 
  ld.day_number,
  ld.title,
  COUNT(dg.id) as games_assigned
FROM learning_days ld
LEFT JOIN day_games dg ON ld.id = dg.learning_day_id
GROUP BY ld.day_number, ld.title
ORDER BY ld.day_number;
```

Expected result: 
- Days 1-10 should have 5 games each
- Days 11-30 should have 0 games (you can add later)

### Check Triggers
```sql
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('learning_days', 'games', 'user_day_progress', 'user_game_attempts');
```

Expected result: 4 triggers

## Add Row Level Security (RLS) - Recommended

After applying migrations, add RLS policies for security:

```sql
-- Enable RLS on user tables
ALTER TABLE user_day_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_game_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own progress
CREATE POLICY "Users can view own progress" 
ON user_day_progress FOR SELECT 
USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- Policy: Users can insert their own progress
CREATE POLICY "Users can insert own progress" 
ON user_day_progress FOR INSERT 
WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- Policy: Users can update their own progress
CREATE POLICY "Users can update own progress" 
ON user_day_progress FOR UPDATE 
USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- Policy: Users can only view their own attempts
CREATE POLICY "Users can view own attempts" 
ON user_game_attempts FOR SELECT 
USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- Policy: Users can insert their own attempts
CREATE POLICY "Users can insert own attempts" 
ON user_game_attempts FOR INSERT 
WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));
```

## Test the System

### 1. Create a Test User
Use your signup flow or create directly in Supabase.

### 2. Check Initial State
```sql
-- Replace YOUR_USER_ID with actual user id
SELECT * FROM user_day_progress WHERE user_id = YOUR_USER_ID;
```

Expected: Empty (no progress yet)

### 3. Visit the App
Go to: `http://your-domain.com/learning-path`

You should see:
- 30 days displayed
- Day 1 unlocked (blue)
- Days 2-30 locked (gray)
- Statistics showing 0/30 days completed

### 4. Play Day 1
Click on Day 1, play the games, and verify:
- Games are recorded in `user_game_attempts`
- Progress updates in `user_day_progress`
- Day 1 marked complete after 5 correct games
- Day 2 unlocks

## Troubleshooting

### Issue: Tables not created
**Solution**: Make sure you're running the SQL as a user with CREATE TABLE permissions.

### Issue: Foreign key constraint errors
**Solution**: Ensure the `users` table exists and has an `id` column.

### Issue: Trigger not firing
**Solution**: Check if the trigger was created:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_day_progress';
```

### Issue: RLS blocking inserts
**Solution**: Verify your RLS policies match your auth system:
```sql
SELECT * FROM pg_policies WHERE tablename IN ('user_day_progress', 'user_game_attempts');
```

## Reset Everything (if needed)

If you need to start fresh:

```sql
-- WARNING: This deletes all data!
DROP TABLE IF EXISTS user_game_attempts CASCADE;
DROP TABLE IF EXISTS user_day_progress CASCADE;
DROP TABLE IF EXISTS day_games CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS learning_days CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_day_progress_on_game_attempt() CASCADE;
```

Then re-run the migration files.

## Adding More Games to Days 11-30

Days 11-30 are created but have no games assigned. To add games:

```sql
-- Example: Assign games to Day 11
INSERT INTO day_games (learning_day_id, game_id, order_in_day) 
SELECT 
  (SELECT id FROM learning_days WHERE day_number = 11),
  id,
  ROW_NUMBER() OVER (ORDER BY id) as order_num
FROM games
LIMIT 5;
```

Or manually:

```sql
INSERT INTO day_games (learning_day_id, game_id, order_in_day) VALUES
((SELECT id FROM learning_days WHERE day_number = 11), 1, 1),
((SELECT id FROM learning_days WHERE day_number = 11), 2, 2),
((SELECT id FROM learning_days WHERE day_number = 11), 3, 3),
((SELECT id FROM learning_days WHERE day_number = 11), 4, 4),
((SELECT id FROM learning_days WHERE day_number = 11), 5, 5);
```

## Next Steps

1. ✅ Apply migrations
2. ✅ Verify with queries above
3. ✅ Add RLS policies
4. ✅ Test with a user account
5. ✅ Assign games to remaining days
6. ✅ Implement remaining game types
7. ✅ Customize content as needed

## Support

If you encounter issues:
1. Check the Supabase logs
2. Review the migration files
3. Verify your database schema
4. Check the documentation files


# Time-Based Day Locking Feature

## Overview

The learning path now includes time-based locking to encourage daily engagement. Users can only access **one day per calendar day**, even if they complete days quickly.

## How It Works

### Day 1 - First Access
1. User visits `/learning-path` for the first time
2. System records `learning_path_started_at` timestamp in the users table
3. Day 1 becomes available immediately
4. All other days are locked

### Day 2 - Next Calendar Day
1. User completes Day 1 on Monday
2. Day 2 becomes available on Tuesday (next calendar day)
3. Even if Day 1 was completed at 11:59 PM Monday, Day 2 unlocks at midnight

### Subsequent Days
- Day N becomes available on the Nth day after starting
- Example: Start on Monday (Day 1), Day 10 available on the following Wednesday

## Lock Types

The system now has **one type of lock**:

### Time Lock ⏰
- **Trigger**: Day has not reached its available date yet
- **Message**: "Coming Soon ⏰" + "Available in X days" or "Available tomorrow"
- **Icon/Color**: Orange text
- **Example**: User starts Monday, tries to access Day 5 on Tuesday
- **Note**: Once time-unlocked, users can access days in any order (no completion requirement)

## Database Changes

### New Column: `learning_path_started_at`
```sql
ALTER TABLE users 
ADD COLUMN learning_path_started_at TIMESTAMP WITH TIME ZONE;
```

This timestamp records when the user first accessed the learning path.

## Logic Flow

```
User tries to access Day N
    ↓
Check: Is learning_path_started_at set?
    ├─ No → Set it to current date
    └─ Yes → Continue
    ↓
Calculate: Days elapsed since start
    ↓
Check: Is Day N <= (days elapsed + 1)?
    ├─ No → TIME LOCKED ⏰
    └─ Yes → ACCESSIBLE ✓

Note: Users can access available days in any order.
No completion of previous days required.
```

## New Server Functions

### `initializeLearningPathStartDate(userId)`
- Automatically called when user first accesses learning path
- Sets `learning_path_started_at` to current timestamp
- Only sets once (idempotent)

### `getAvailableDayByTime(userId)`
- Calculates which day number should be available based on time elapsed
- Returns: 1-30 (max day number available)
- Formula: `min(daysElapsed + 1, 30)`

### `getDayAvailability(userId, dayNumber)`
- Returns detailed availability info for UI
- **Returns:**
  ```typescript
  {
    canAccess: boolean
    reason: 'available' | 'time_locked'
    availableDate?: string  // When day will unlock
  }
  ```

### Updated `canAccessDay(userId, dayNumber)`
- Now checks ONLY time-based access
- Returns simple boolean
- Used for access control
- No completion requirement

## UI Changes

### Learning Path Overview (`/learning-path`)

**Display:**
- Time-locked days: "Coming Soon ⏰" + "Available in X days"
- Available days: "Start" or "X/5 games" or "Completed ✓"
- Color coding: Orange for time-locked, Blue for available, Green for completed

### Click Behavior

**Time-Locked Day:**
```
Alert: "This day will be available on Friday, October 18. Come back tomorrow! 📅"
```

**Available Days:**
- Can be played in any order
- No completion requirement for previous days

## Examples

### Scenario 1: New User (Monday)
- User creates account on Monday
- Day 1: ✅ Available immediately
- Day 2: ⏰ Time-locked (available Tuesday)
- Day 3-30: ⏰ Time-locked

### Scenario 2: Fast Learner (Tuesday)
- User completes Day 1 on Monday
- Returns on Tuesday
- Day 1: ✅ Completed
- Day 2: ✅ Available (time allows)
- Day 3: ⏰ Time-locked (available Wednesday)

### Scenario 3: Flexible Play (Wednesday)
- User completes Day 1 Monday
- Skips Day 2
- Returns Wednesday
- Day 1: ✅ Completed
- Day 2: ✅ Available (can still play)
- Day 3: ✅ Available (can play without completing Day 2)

### Scenario 4: Week Later
- User starts Monday
- Returns next Monday (7 days later)
- Day 1-8: Time available (8 days have passed)
- Day 1-8: ✅ All can be accessed in any order
- Day 9: ⏰ Time-locked (available tomorrow)
- User can choose which days to play

## Testing

### Test Time-Based Locking

**Manual Testing:**
1. Create a test user
2. Visit `/learning-path` - Day 1 should be available
3. Check database: `learning_path_started_at` should be set
4. Try accessing `/learning-path/2` - should redirect back
5. UI should show "Coming Soon ⏰"

**Database Testing:**
```sql
-- Set start date to yesterday
UPDATE users 
SET learning_path_started_at = NOW() - INTERVAL '1 day'
WHERE id = YOUR_USER_ID;

-- Now Day 2 should be available by time
```

**Advance Time for Testing:**
```sql
-- Make user appear to have started 5 days ago
UPDATE users 
SET learning_path_started_at = NOW() - INTERVAL '5 days'
WHERE id = YOUR_USER_ID;

-- Now Days 1-6 should be available by time
```

### Verify Lock Reasons

```sql
-- Check what the function returns
SELECT * FROM users WHERE id = YOUR_USER_ID;

-- Days available = days_since_start + 1
SELECT 
  id,
  learning_path_started_at,
  EXTRACT(DAY FROM (NOW() - learning_path_started_at)) as days_elapsed,
  EXTRACT(DAY FROM (NOW() - learning_path_started_at)) + 1 as days_available
FROM users 
WHERE id = YOUR_USER_ID;
```

## Configuration

### Adjust Time Calculation
If you want to change how days unlock, edit `getAvailableDayByTime()` in `src/actions/learning-path.ts`:

```typescript
// Current: 1 day per calendar day
return Math.min(daysElapsed + 1, 30)

// Alternative: 2 days per calendar day
return Math.min((daysElapsed * 2) + 1, 30)

// Alternative: Weekly unlock (7 days at once)
return Math.min(Math.floor(daysElapsed / 7) * 7 + 7, 30)
```

### Reset User's Start Date
```sql
-- Reset to today (user can access Day 1 only)
UPDATE users 
SET learning_path_started_at = NOW()
WHERE id = YOUR_USER_ID;

-- Clear start date (will be set on next access)
UPDATE users 
SET learning_path_started_at = NULL
WHERE id = YOUR_USER_ID;
```

### Override for Testing
For testing or admin override, you can temporarily remove time-based checking:

```typescript
// In canAccessDay(), comment out time check:
export async function canAccessDay(userId: number, dayNumber: number): Promise<boolean> {
  // // Check time-based availability
  // const availableDayByTime = await getAvailableDayByTime(userId)
  // if (dayNumber > availableDayByTime) {
  //   return false
  // }
  
  // Rest of the function...
}
```

## Benefits

### 1. Daily Engagement
- Users return every day to play new content
- Builds habit and routine

### 2. Prevents Burnout
- Users can't binge all 30 days in one sitting
- Paced learning is more effective for ADHD

### 3. Better Learning
- Time between sessions helps consolidation
- Sleep between days improves retention

### 4. Parent Control
- Parents can ensure kids follow schedule
- Predictable daily routine

### 5. Progress Tracking
- Clear indication of program adherence
- Easy to see if child is keeping up

## Migration Steps

1. **Apply Migration:**
   ```bash
   # Run the new migration
   supabase db push
   
   # Or manually in Supabase SQL Editor:
   # Execute: 20251013130000_add_learning_path_start_date.sql
   ```

2. **Verify Column Added:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'users' 
   AND column_name = 'learning_path_started_at';
   ```

3. **Test with New User:**
   - Create new user
   - Visit `/learning-path`
   - Verify only Day 1 is available
   - Check database: `learning_path_started_at` should be set

4. **Test with Existing Users:**
   - Existing users will have `learning_path_started_at = NULL`
   - It will be set automatically on their next visit
   - They will start from Day 1 with time-based progression

## Optional: Set Start Date for Existing Users

If you have existing users who should keep their progress:

```sql
-- Option 1: Set to account creation date
UPDATE users 
SET learning_path_started_at = created_at
WHERE learning_path_started_at IS NULL;

-- Option 2: Set based on their earliest game attempt
UPDATE users u
SET learning_path_started_at = (
  SELECT MIN(created_at)
  FROM user_game_attempts
  WHERE user_id = u.id
)
WHERE learning_path_started_at IS NULL
AND EXISTS (
  SELECT 1 FROM user_game_attempts WHERE user_id = u.id
);

-- Option 3: Set to today (fresh start for everyone)
UPDATE users 
SET learning_path_started_at = NOW()
WHERE learning_path_started_at IS NULL;
```

## Troubleshooting

### Issue: All days showing as time-locked
**Cause:** `learning_path_started_at` not set or in future
**Fix:**
```sql
SELECT id, learning_path_started_at FROM users WHERE id = YOUR_USER_ID;
-- If NULL or future date, update:
UPDATE users SET learning_path_started_at = NOW() WHERE id = YOUR_USER_ID;
```

### Issue: Too many days available
**Cause:** `learning_path_started_at` set to past date
**Fix:**
```sql
-- Reset to today
UPDATE users SET learning_path_started_at = NOW() WHERE id = YOUR_USER_ID;
```

### Issue: Days not unlocking at midnight
**Cause:** Date comparison includes time component
**Fix:** The code already handles this with `setHours(0, 0, 0, 0)`, but verify timezone settings in your database

## Summary

✅ **What Changed:**
- Added `learning_path_started_at` column to users table
- Added time-based availability checking
- Updated UI to show different lock types
- Added detailed availability information

✅ **User Experience:**
- Can only access one new day per calendar day
- Clear visual indicators for lock types
- Informative messages about when days unlock
- Encourages daily return and engagement

✅ **Developer Experience:**
- Clean separation of concerns (time vs completion locks)
- Easy to test by manipulating start date
- Flexible configuration
- Well-documented API


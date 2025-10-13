# Time-Based Locking Update - Summary

## What Was Requested

**User Request:** "I don't want the user to be able to play a day that hasn't reached yet. So let's say this is the fourth day for the user, even if he completed the first 4 days in games, he needs to wait for tomorrow to access the fifth game."

## What Was Implemented

### ✅ Time-Based Day Unlocking System

Users can now only access **one day per calendar day**, even if they complete days quickly. This encourages:
- Daily engagement and routine
- Paced learning (better for ADHD)
- Prevents burnout from binge-playing
- Better retention through spaced learning

---

## Changes Made

### 1. Database Migration ⭐ NEW FILE
**File:** `supabase/migrations/20251013130000_add_learning_path_start_date.sql`

```sql
ALTER TABLE users 
ADD COLUMN learning_path_started_at TIMESTAMP WITH TIME ZONE;
```

This column tracks when the user first started the learning path.

### 2. Server Actions Updated
**File:** `src/actions/learning-path.ts`

**New Functions:**
- `initializeLearningPathStartDate(userId)` - Sets start date on first access
- `getAvailableDayByTime(userId)` - Calculates which day should be available based on elapsed time
- `getDayAvailability(userId, dayNumber)` - Returns detailed availability info with reason

**Updated Functions:**
- `canAccessDay()` - Now checks BOTH time-based AND completion-based access

### 3. UI Pages Updated

**File:** `src/app/(protected)/learning-path/page.tsx`
- Now uses `getDayAvailability()` instead of `canAccessDay()`
- Passes lock reason and available date to client component

**File:** `src/app/(protected)/learning-path/LearningPathClient.tsx`
- Shows different messages for time-locked vs completion-locked days
- Time-locked: "Coming Soon ⏰" + "Available in X days"
- Completion-locked: "Locked 🔒" + "Complete previous day"
- Shows countdown ("Available tomorrow", "Available in 3 days")
- Different colored alerts when clicking locked days

**File:** `src/app/(protected)/learning-path/[day]/page.tsx`
- Updated to use `getDayAvailability()` for access control

### 4. Documentation ⭐ NEW FILES

**`TIME_BASED_LOCKING.md`** - Complete documentation including:
- How the system works
- Lock types explained
- Database changes
- Logic flow diagrams
- Testing procedures
- Configuration options
- Troubleshooting

**Updated Files:**
- `apply-migrations.md` - Added Step 3 for new migration
- `IMPLEMENTATION_SUMMARY.md` - Updated with new features

---

## How It Works

### Example Timeline

**Monday (Day 0):**
- User creates account and visits `/learning-path`
- System sets `learning_path_started_at = Monday`
- Day 1: ✅ Available
- Day 2-30: ⏰ Time-locked

**Tuesday (Day 1):**
- User completes Day 1 on Monday evening
- User returns Tuesday
- Day 1: ✅ Completed
- Day 2: ✅ Available (time allows + Day 1 complete)
- Day 3: ⏰ Time-locked (available Wednesday)

**Wednesday (Day 2):**
- User skips Day 2, returns Wednesday
- Day 1: ✅ Completed
- Day 2: ✅ Available (time allows, but not completed)
- Day 3: 🔒 Completion-locked (Day 2 not done yet)

**Thursday (Day 3):**
- User completes Day 2 on Wednesday
- Day 2: ✅ Completed
- Day 3: ✅ Available (time allows + Day 2 complete)
- Day 4: ⏰ Time-locked (available Friday)

---

## Two Types of Locks

### 1. Time Lock ⏰ (NEW)
- **Trigger:** Day hasn't reached its calendar date yet
- **Badge:** "Coming Soon ⏰"
- **Message:** "Available in X days" or "Available tomorrow"
- **Color:** Orange text
- **Click Alert:** "This day will be available on Friday, October 18. Come back tomorrow! 📅"

### 2. Completion Lock 🔒 (Existing)
- **Trigger:** Previous day not completed
- **Badge:** "Locked 🔒"
- **Message:** "Complete previous day"
- **Color:** Gray text
- **Click Alert:** "Please complete the previous day first! 🔒"

### Access Rule
A day is accessible ONLY when:
```
✅ Time allows (Day N available on Nth day after start)
AND
✅ Previous day completed (Day N-1 is done)
```

---

## Migration Instructions

### Apply the New Migration

**Option 1: Supabase CLI**
```bash
supabase db push
```

**Option 2: Manual SQL**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20251013130000_add_learning_path_start_date.sql`
3. Run the query

### Verify
```sql
-- Check column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'learning_path_started_at';

-- Should return 1 row
```

---

## Testing

### Test with New User
1. Create a new user account
2. Visit `/learning-path`
3. Should see:
   - Day 1: Available (blue/active)
   - Day 2-30: Time-locked (gray with "Coming Soon ⏰")
4. Check database:
   ```sql
   SELECT id, learning_path_started_at FROM users WHERE id = YOUR_USER_ID;
   -- Should have today's date
   ```

### Test Time Advancement
```sql
-- Make user appear to have started 3 days ago
UPDATE users 
SET learning_path_started_at = NOW() - INTERVAL '3 days'
WHERE id = YOUR_USER_ID;

-- Now Days 1-4 should be available by time
-- (Still need to complete previous days though!)
```

### Test Different Scenarios
```sql
-- Scenario: Started 10 days ago
UPDATE users 
SET learning_path_started_at = NOW() - INTERVAL '10 days'
WHERE id = YOUR_USER_ID;

-- Days 1-11 available by time
-- Days 2-11 still locked by completion (need to finish Day 1 first)
```

---

## For Existing Users

Existing users have `learning_path_started_at = NULL`. 

**What happens:**
- When they visit `/learning-path` next time, the system automatically sets it to current date
- They restart from Day 1 with time-based progression
- Previous progress is preserved, but they follow new time rules

**Optional: Set for existing users**
```sql
-- Option 1: Set to account creation (if you want to credit their time)
UPDATE users 
SET learning_path_started_at = created_at
WHERE learning_path_started_at IS NULL;

-- Option 2: Set to today (fresh start)
UPDATE users 
SET learning_path_started_at = NOW()
WHERE learning_path_started_at IS NULL;

-- Option 3: Set based on first game attempt
UPDATE users u
SET learning_path_started_at = (
  SELECT MIN(created_at)
  FROM user_game_attempts
  WHERE user_id = u.id
)
WHERE learning_path_started_at IS NULL
AND EXISTS (SELECT 1 FROM user_game_attempts WHERE user_id = u.id);
```

---

## Configuration

### Change Unlock Rate

Edit `getAvailableDayByTime()` in `src/actions/learning-path.ts`:

```typescript
// Current: 1 day per calendar day
return Math.min(daysElapsed + 1, 30)

// Alternative: 2 days per calendar day
return Math.min((daysElapsed * 2) + 1, 30)

// Alternative: 1 day per week
return Math.min(Math.floor(daysElapsed / 7) + 1, 30)

// Alternative: 7 days unlock every Monday
const weeksPassed = Math.floor(daysElapsed / 7)
return Math.min((weeksPassed * 7) + 7, 30)
```

---

## Benefits

### 1. Daily Engagement ✅
Users have a reason to come back every day

### 2. Prevents Burnout ✅
Can't complete all 30 days in one sitting

### 3. Better Learning ✅
Spaced repetition improves retention for ADHD

### 4. Routine Building ✅
Establishes daily habit and structure

### 5. Parent Control ✅
Parents can track if child is keeping up with daily practice

---

## Files Changed

### New Files (3)
1. `supabase/migrations/20251013130000_add_learning_path_start_date.sql`
2. `TIME_BASED_LOCKING.md`
3. `TIME_BASED_UPDATE_SUMMARY.md` (this file)

### Modified Files (5)
1. `src/actions/learning-path.ts`
2. `src/app/(protected)/learning-path/page.tsx`
3. `src/app/(protected)/learning-path/LearningPathClient.tsx`
4. `src/app/(protected)/learning-path/[day]/page.tsx`
5. `apply-migrations.md`
6. `IMPLEMENTATION_SUMMARY.md`

---

## Summary

✅ **Implemented:** Time-based day unlocking (one day per calendar day)
✅ **Database:** Added `learning_path_started_at` column to users table
✅ **Logic:** Two-tier lock system (time + completion)
✅ **UI:** Different indicators and messages for each lock type
✅ **Documentation:** Complete guide with examples and testing
✅ **Backward Compatible:** Existing users automatically adapt on next visit

**Status:** ✅ Ready to deploy! Just run the migration and test.

---

## Quick Start

```bash
# 1. Apply migration
supabase db push

# 2. Test with a user
# Visit /learning-path and verify:
# - Day 1 is available
# - Day 2 shows "Coming Soon ⏰"
# - Clicking Day 2 shows "Available tomorrow" message

# 3. Test time advancement (optional)
# Update user's start date in database to see future days unlock
```

---

**Need Help?** See `TIME_BASED_LOCKING.md` for detailed documentation and troubleshooting.


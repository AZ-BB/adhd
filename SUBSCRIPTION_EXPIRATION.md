# Subscription Expiration Handling

## Current Behavior

When a subscription expires (i.e., `end_date` passes the current date/time), the following happens:

### 1. **Access Control**
- Users with expired subscriptions are **automatically redirected to the pricing page** when trying to access protected routes
- The `requireActiveSubscription()` function in `src/app/(protected)/layout.tsx` checks for active subscriptions
- Only subscriptions with `status = 'active'` AND `end_date >= now` are considered valid

### 2. **Database State**
- The subscription record remains in the database with `status = 'active'`
- However, the `end_date` check prevents it from being considered active
- The subscription will not appear in queries that filter by `end_date >= now`

### 3. **User Experience**
- **Dashboard**: Users won't see subscription info if all subscriptions are expired
- **Settings**: Users won't see subscription info if all subscriptions are expired
- **Protected Pages**: Users are redirected to `/pricing` or `/en/pricing`
- **Individual Sessions**: Still accessible (one-time purchases don't require active subscription)

## Automatic Status Update

### Option 1: Database Function (Recommended)
A database function `update_expired_subscriptions()` has been created that can be called periodically:

```sql
SELECT update_expired_subscriptions();
```

This function:
- Updates all subscriptions with `status = 'active'` and `end_date < CURRENT_TIMESTAMP`
- Sets their status to `'expired'`
- Updates the `updated_at` timestamp
- Returns the count of updated subscriptions

### Option 2: API Route
An API route is available at `/api/subscriptions/update-expired` that can be called via:
- Cron job (e.g., Vercel Cron, GitHub Actions, etc.)
- Scheduled task
- Manual trigger

**Example cron job setup (Vercel):**
```json
{
  "crons": [{
    "path": "/api/subscriptions/update-expired",
    "schedule": "0 0 * * *"
  }]
}
```

### Option 3: Supabase pg_cron (If Available)
If your Supabase instance has the `pg_cron` extension enabled, you can schedule automatic updates:

```sql
SELECT cron.schedule(
    'update-expired-subscriptions',
    '0 0 * * *', -- Run daily at midnight
    $$SELECT update_expired_subscriptions()$$
);
```

## Manual Update

You can manually update expired subscriptions by calling:

```typescript
import { updateExpiredSubscriptions } from '@/lib/subscription'
await updateExpiredSubscriptions()
```

Or via API:
```bash
POST /api/subscriptions/update-expired
```

## Recommended Setup

1. **Set up a daily cron job** to call the update function
   - Vercel: Use `vercel.json` cron configuration
   - Other platforms: Use their scheduled task feature
   - Supabase: Use pg_cron if available

2. **Monitor subscription expiration** (optional)
   - Send email notifications before expiration
   - Display warnings in the UI when subscription is about to expire

3. **Grace Period** (optional)
   - Consider adding a grace period (e.g., 7 days) before blocking access
   - This gives users time to renew without losing access immediately

## Files Modified/Created

- `src/lib/subscription.ts` - Added `updateExpiredSubscriptions()` function
- `src/app/api/subscriptions/update-expired/route.ts` - API endpoint for updating expired subscriptions
- `supabase/migrations/20251205000000_add_expired_subscription_update.sql` - Database function for updating expired subscriptions

## Testing

To test subscription expiration:

1. Create a test subscription with an `end_date` in the past
2. Verify that the user is redirected to pricing when accessing protected routes
3. Call the update function to mark the subscription as expired
4. Verify the subscription status is now `'expired'`

# Admin Dashboard Setup Guide

This guide will help you set up and use the admin dashboard for the ADHD Learning Platform.

## Overview

The admin dashboard provides:
- **Dashboard Overview**: Key metrics and statistics
- **User Management**: View and manage all registered users
- **Analytics**: Detailed insights and reports
- **Content Management**: (Coming soon) Manage learning materials
- **Settings**: Admin account and system preferences

## Database Setup

### 1. Apply the Admin Migration

First, apply the admin system migration to your Supabase database:

```bash
# Using Supabase CLI
supabase db push
```

Or manually run the migration file:
- `supabase/migrations/20251016000000_add_user_roles.sql`

This will:
- Add a `role` column to the `users` table (values: 'user', 'admin', 'super_admin')
- Update `user_progress_summary` view to include role
- Create helper functions: `is_admin()`, `is_super_admin()`, `promote_to_admin()`, `demote_to_user()`

### 2. Create Your First Admin User

After applying the migration, you need to promote an existing user to admin:

#### Option A: Using an Existing User Account

If you already have a user account in the system:

1. Find your user's `auth_id` by running:
```sql
SELECT u.id, u.auth_id, u.parent_first_name, u.parent_last_name, au.email
FROM users u
JOIN auth.users au ON u.auth_id = au.id
WHERE au.email = 'your-email@example.com';
```

2. Promote the user to admin:
```sql
-- Using helper function (recommended):
SELECT promote_to_admin('YOUR_AUTH_ID'::uuid, true);

-- Or direct UPDATE:
UPDATE users 
SET role = 'super_admin', updated_at = NOW()
WHERE auth_id = 'YOUR_AUTH_ID'::uuid;
```

#### Option B: Creating a New Admin User

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Create a new user with email and password
3. Then create a record in the `users` table:
```sql
INSERT INTO users (
    auth_id,
    child_first_name,
    child_last_name,
    child_birthday,
    child_gender,
    parent_first_name,
    parent_last_name,
    role
) VALUES (
    'USER_AUTH_ID_FROM_STEP_2'::uuid,
    'Admin',
    'User',
    '1990-01-01',
    'male',
    'Admin',
    'User',
    'super_admin'
);
```

## Accessing the Admin Dashboard

### Login

The system uses a **unified login page** for both users and admins:

1. Navigate to: `http://localhost:3000/auth/login` (or your production URL)
2. Enter your admin email and password
3. The system will detect your admin role and automatically redirect you to `/admin`

**Note:** There is no separate admin login page. Regular users logging in at the same URL will be redirected to `/dashboard` automatically.

### Admin Routes

- `/auth/login` - Unified login (auto-redirects based on role)
- `/admin` - Dashboard overview
- `/admin/users` - User management
- `/admin/users/[id]` - Individual user details
- `/admin/analytics` - Analytics and insights
- `/admin/content` - Content management (coming soon)
- `/admin/settings` - Admin settings

## Features

### Dashboard Overview
- Total users count
- Active users (last 7 days)
- Learning days completed
- Average completion rate
- Quiz analytics with category breakdown
- System status indicators

### User Management
- View all registered users
- User statistics (age, progress, scores)
- Individual user details
- Learning progress tracking
- Parent information

### Analytics
- User engagement metrics
- Gender and age distribution
- Quiz performance analytics
- Top performers leaderboard
- Recent registrations

## Security

### Admin Authorization

The admin system uses several layers of security:

1. **Authentication**: Uses Supabase Auth
2. **Authorization**: Checks `admin_users` table
3. **Route Protection**: `requireAdmin()` function on all admin pages
4. **Separate Login**: Admin login is separate from user login

### Key Security Functions

```typescript
// Check if current user is an admin
await isAdmin()

// Get admin user or redirect to login
await requireAdmin()

// Get admin user without redirect
await getAdminUser()
```

## Adding More Admins

To promote additional users to admin:

**Method 1: Using Helper Function (Recommended)**
```sql
-- Promote to regular admin
SELECT promote_to_admin('USER_AUTH_ID'::uuid, false);

-- Promote to super admin
SELECT promote_to_admin('USER_AUTH_ID'::uuid, true);
```

**Method 2: Direct Update**
```sql
-- Promote to admin
UPDATE users SET role = 'admin', updated_at = NOW()
WHERE auth_id = 'USER_AUTH_ID'::uuid;

-- Promote to super admin
UPDATE users SET role = 'super_admin', updated_at = NOW()
WHERE auth_id = 'USER_AUTH_ID'::uuid;
```

## Permissions

### Regular Admin
- View dashboard
- View users
- View analytics
- View settings

### Super Admin
- All regular admin permissions
- Future: Manage other admins
- Future: System configuration

## Troubleshooting

### "Unauthorized: Admin access only"

This means your user account exists but doesn't have admin role. Check your role:
```sql
SELECT role FROM users WHERE auth_id = 'YOUR_AUTH_ID'::uuid;
```
Then promote to admin if needed.

### Can't Access Admin Dashboard

1. Verify the migration was applied successfully
2. Check that your user exists in both `auth.users` and `admin_users`
3. Ensure the `auth_id` matches in both tables
4. Clear browser cookies and try logging in again

### Database Queries Not Working

1. Verify the migration was applied:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';
```

2. Ensure migrations are applied:
```bash
supabase db push
```

## Development

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Access admin at http://localhost:3000/admin/login
```

### Environment Variables

Ensure you have these environment variables set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_service_role_key
```

## Future Enhancements

Planned features for the admin dashboard:

- [ ] Content management system
- [ ] Quiz question editor
- [ ] Learning path customization
- [ ] Email notifications
- [ ] User messaging
- [ ] Advanced analytics and reports
- [ ] Export data functionality
- [ ] Admin activity logs
- [ ] Role-based permissions
- [ ] Multi-language support for admin

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Supabase logs
3. Check browser console for errors
4. Contact the development team

## Quick Reference

### Important Files

- `src/lib/admin.ts` - Admin utility functions
- `src/actions/admin.ts` - Admin server actions
- `src/app/admin/` - Admin dashboard pages
- `supabase/migrations/20251016000000_add_user_roles.sql` - Database schema

### SQL Queries

Check if user is admin:
```sql
SELECT * FROM users WHERE auth_id = 'USER_UID' AND role IN ('admin', 'super_admin');
```

View all admins:
```sql
SELECT u.*, au.email FROM users u
JOIN auth.users au ON u.auth_id = au.id
WHERE u.role IN ('admin', 'super_admin')
ORDER BY u.created_at DESC;
```

View user progress summary:
```sql
SELECT * FROM user_progress_summary 
WHERE role = 'user'
ORDER BY completed_days DESC;
```

---

**Last Updated**: October 16, 2025


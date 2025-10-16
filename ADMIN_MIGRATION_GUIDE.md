# Admin System Migration Guide

## Overview

The admin system has been refactored to use a **role-based approach** instead of a separate admin table. This is simpler, more maintainable, and better integrated with the existing user system.

## What Changed

### Before (Separate Table Approach)
- Separate `admin_users` table
- Required manual sync between `users` and `admin_users`
- More complex queries with joins
- Duplicate email/name storage

### After (Role-Based Approach)
- Single `users` table with `role` column
- Enum type: `'user'`, `'admin'`, `'super_admin'`
- Simpler queries and maintenance
- No data duplication

## Migration Steps

### 1. Apply the Migration

```bash
supabase db push
```

This will:
- Add `role` enum type
- Add `role` column to `users` table (defaults to 'user')
- Update `user_progress_summary` view
- Create helper functions

### 2. Promote Your First Admin

**Option A: From existing user**
```sql
-- Find your user
SELECT u.id, u.auth_id, au.email, u.role
FROM users u
JOIN auth.users au ON u.auth_id = au.id
WHERE au.email = 'your@email.com';

-- Promote to admin
SELECT promote_to_admin('YOUR_AUTH_ID'::uuid, true);
```

**Option B: Create new admin**
```sql
-- 1. Create auth user in Supabase Dashboard first
-- 2. Then insert into users table:
INSERT INTO users (
    auth_id, child_first_name, child_last_name,
    child_birthday, child_gender,
    parent_first_name, parent_last_name, role
) VALUES (
    'AUTH_ID_FROM_DASHBOARD'::uuid,
    'Admin', 'User', '1990-01-01', 'male',
    'Admin', 'User', 'super_admin'
);
```

### 3. Verify Admin Access

```sql
-- Check your role
SELECT u.role, au.email
FROM users u
JOIN auth.users au ON u.auth_id = au.id
WHERE au.email = 'your@email.com';

-- List all admins
SELECT u.*, au.email
FROM users u
JOIN auth.users au ON u.auth_id = au.id
WHERE u.role IN ('admin', 'super_admin');
```

### 4. Test Login

1. Navigate to `/admin/login`
2. Enter your credentials
3. You should be redirected to `/admin` dashboard

## Key Functions

### SQL Functions

```sql
-- Check if user is admin
SELECT is_admin('AUTH_ID'::uuid);

-- Check if user is super admin
SELECT is_super_admin('AUTH_ID'::uuid);

-- Promote user to admin
SELECT promote_to_admin('AUTH_ID'::uuid, false);

-- Promote user to super admin
SELECT promote_to_admin('AUTH_ID'::uuid, true);

-- Demote admin to user
SELECT demote_to_user('AUTH_ID'::uuid);
```

### TypeScript Functions

```typescript
// Check if current user is admin
const isAdminUser = await isAdmin()

// Require admin (redirects if not)
const admin = await requireAdmin()

// Get admin without redirect
const admin = await getAdminUser()
```

## Role Hierarchy

1. **user** (default)
   - Regular users
   - Access to learning platform only

2. **admin**
   - Access to admin dashboard
   - View users and analytics
   - View content and settings

3. **super_admin**
   - All admin permissions
   - Future: Manage other admins
   - Future: System configuration

## Common Tasks

### Promote User to Admin

```sql
UPDATE users 
SET role = 'admin', updated_at = NOW()
WHERE auth_id = 'USER_AUTH_ID'::uuid;
```

### Demote Admin to User

```sql
UPDATE users 
SET role = 'user', updated_at = NOW()
WHERE auth_id = 'USER_AUTH_ID'::uuid;
```

### List All Admins

```sql
SELECT 
    u.id, u.parent_first_name, u.parent_last_name,
    u.role, au.email, u.created_at
FROM users u
JOIN auth.users au ON u.auth_id = au.id
WHERE u.role IN ('admin', 'super_admin')
ORDER BY u.role DESC, u.created_at DESC;
```

### Find User by Email

```sql
SELECT u.*, au.email
FROM users u
JOIN auth.users au ON u.auth_id = au.id
WHERE au.email = 'email@example.com';
```

## Troubleshooting

### Can't login to admin

**Check role:**
```sql
SELECT role FROM users WHERE auth_id = 'YOUR_AUTH_ID'::uuid;
```

**Verify role column exists:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'role';
```

### "Unauthorized" error

Your user doesn't have admin role. Promote them:
```sql
SELECT promote_to_admin('YOUR_AUTH_ID'::uuid, true);
```

### Migration didn't apply

```bash
# Check migration status
supabase migration list

# Apply migrations
supabase db push

# Or manually run the migration SQL file
```

## Benefits of Role-Based Approach

✅ **Simpler**: One table instead of two  
✅ **Consistent**: No sync issues between tables  
✅ **Flexible**: Easy to add more roles in future  
✅ **Efficient**: No joins needed for role checks  
✅ **Standard**: Common pattern in web applications  

## Security Notes

- Role is checked at the page level using `requireAdmin()`
- All admin routes are protected
- Role can only be changed via direct database access
- Consider RLS policies for additional security (future enhancement)

## Future Enhancements

- Add more granular permissions per role
- Role-based feature access control
- Admin activity logging
- Role assignment UI for super admins

---

**System Version:** 1.0.0  
**Last Updated:** October 16, 2025


-- Admin Management SQL Queries (Role-Based System)
-- Collection of useful SQL queries for managing admin users

-- ============================================
-- PROMOTE USER TO ADMIN
-- ============================================

-- Method 1: Direct UPDATE (promote to regular admin)
UPDATE users
SET role = 'admin', updated_at = NOW()
WHERE auth_id = 'USER_AUTH_ID'::uuid;

-- Promote to super admin
UPDATE users
SET role = 'super_admin', updated_at = NOW()
WHERE auth_id = 'USER_AUTH_ID'::uuid;

-- Method 2: Using helper function (recommended)
-- Promote to regular admin:
SELECT promote_to_admin('USER_AUTH_ID'::uuid, false);

-- Promote to super admin:
SELECT promote_to_admin('USER_AUTH_ID'::uuid, true);

-- ============================================
-- DEMOTE ADMIN TO USER
-- ============================================

-- Method 1: Direct UPDATE
UPDATE users
SET role = 'user', updated_at = NOW()
WHERE auth_id = 'USER_AUTH_ID'::uuid;

-- Method 2: Using helper function
SELECT demote_to_user('USER_AUTH_ID'::uuid);

-- ============================================
-- LIST ALL ADMINS
-- ============================================

-- View all admin users
SELECT 
    u.id,
    u.auth_id,
    u.parent_first_name,
    u.parent_last_name,
    au.email,
    u.role,
    u.created_at
FROM users u
JOIN auth.users au ON u.auth_id = au.id
WHERE u.role IN ('admin', 'super_admin')
ORDER BY u.created_at DESC;

-- Count admins by role
SELECT 
    role,
    COUNT(*) as count
FROM users
WHERE role IN ('admin', 'super_admin')
GROUP BY role;

-- ============================================
-- CHECK IF USER IS ADMIN
-- ============================================

-- Check by auth_id
SELECT * FROM users 
WHERE auth_id = 'USER_AUTH_ID'::uuid 
AND role IN ('admin', 'super_admin');

-- Check by email (join with auth.users)
SELECT u.*, au.email
FROM users u
JOIN auth.users au ON u.auth_id = au.id
WHERE au.email = 'email@example.com'
AND u.role IN ('admin', 'super_admin');

-- Using helper function
SELECT is_admin('USER_AUTH_ID'::uuid);

-- Check if super admin
SELECT is_super_admin('USER_AUTH_ID'::uuid);

-- ============================================
-- FIND USER'S AUTH_ID
-- ============================================

-- Find by email
SELECT u.id, u.auth_id, u.parent_first_name, u.parent_last_name, u.role, au.email
FROM users u
JOIN auth.users au ON u.auth_id = au.id
WHERE au.email = 'email@example.com';

-- Find by name (partial match)
SELECT u.id, u.auth_id, u.parent_first_name, u.parent_last_name, u.role, au.email
FROM users u
JOIN auth.users au ON u.auth_id = au.id
WHERE u.parent_first_name ILIKE '%search%' 
   OR u.parent_last_name ILIKE '%search%';

-- ============================================
-- ADMIN STATISTICS
-- ============================================

-- Count users by role
SELECT 
    role,
    COUNT(*) as count
FROM users
GROUP BY role
ORDER BY role;

-- Total admins vs regular users
SELECT 
    CASE 
        WHEN role IN ('admin', 'super_admin') THEN 'Admins'
        ELSE 'Regular Users'
    END as user_type,
    COUNT(*) as count
FROM users
GROUP BY user_type;

-- List super admins only
SELECT 
    u.id,
    u.parent_first_name,
    u.parent_last_name,
    au.email,
    u.created_at
FROM users u
JOIN auth.users au ON u.auth_id = au.id
WHERE u.role = 'super_admin'
ORDER BY u.created_at DESC;

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- Find all users with their auth status
SELECT 
    u.id,
    u.auth_id,
    u.parent_first_name,
    u.parent_last_name,
    u.role,
    au.email,
    au.email_confirmed_at,
    u.created_at
FROM users u
LEFT JOIN auth.users au ON u.auth_id = au.id
ORDER BY u.created_at DESC;

-- Find users without valid auth
SELECT u.*
FROM users u
LEFT JOIN auth.users au ON u.auth_id = au.id
WHERE au.id IS NULL;

-- List admins created in last 30 days
SELECT 
    u.*,
    au.email
FROM users u
JOIN auth.users au ON u.auth_id = au.id
WHERE u.role IN ('admin', 'super_admin')
AND u.created_at > NOW() - INTERVAL '30 days'
ORDER BY u.created_at DESC;

-- ============================================
-- BULK OPERATIONS
-- ============================================

-- Promote multiple users to admin at once
-- CAUTION: Replace auth_ids with actual values
UPDATE users
SET role = 'admin', updated_at = NOW()
WHERE auth_id IN (
    'AUTH_ID_1'::uuid,
    'AUTH_ID_2'::uuid,
    'AUTH_ID_3'::uuid
);

-- Demote all regular admins back to users (keep super admins)
-- DANGER: Use with extreme caution!
-- UPDATE users
-- SET role = 'user', updated_at = NOW()
-- WHERE role = 'admin';

-- ============================================
-- SECURITY CHECKS
-- ============================================

-- Verify no orphaned auth records
SELECT 
    au.id as auth_id,
    au.email,
    au.created_at as auth_created,
    u.id as user_id,
    u.role
FROM auth.users au
LEFT JOIN users u ON au.id = u.auth_id
ORDER BY au.created_at DESC;

-- Check for duplicate auth_id (should never happen)
SELECT 
    auth_id,
    COUNT(*) as count
FROM users
GROUP BY auth_id
HAVING COUNT(*) > 1;

-- ============================================
-- ROLE VALIDATION
-- ============================================

-- Check for any invalid role values (should be empty)
SELECT *
FROM users
WHERE role NOT IN ('user', 'admin', 'super_admin');

-- Verify role column exists and has correct type
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns
WHERE table_name = 'users' 
AND column_name = 'role';

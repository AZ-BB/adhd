-- Create First Admin User (Using Role-Based System)
-- 
-- INSTRUCTIONS:
-- 1. First, create a user account through the normal signup flow
--    OR create a user in Supabase Authentication dashboard and then insert into users table
-- 2. Find the user's auth_id from Supabase Auth or users table
-- 3. Replace the values below with the actual auth_id
-- 4. Run this SQL in Supabase SQL Editor
--

-- OPTION 1: Promote an existing user to admin
-- Replace 'USER_AUTH_ID_HERE' with the actual auth_id
UPDATE users 
SET role = 'admin', updated_at = NOW()
WHERE auth_id = 'USER_AUTH_ID_HERE'::uuid;

-- To make them a super admin instead:
-- UPDATE users 
-- SET role = 'super_admin', updated_at = NOW()
-- WHERE auth_id = 'USER_AUTH_ID_HERE'::uuid;

-- OPTION 2: Use the helper function (cleaner)
-- To promote to regular admin:
SELECT promote_to_admin('USER_AUTH_ID_HERE'::uuid, false);

-- To promote to super admin:
-- SELECT promote_to_admin('USER_AUTH_ID_HERE'::uuid, true);

-- Verify the admin was created:
SELECT 
    id, 
    auth_id,
    parent_first_name,
    parent_last_name,
    role,
    created_at
FROM users 
WHERE role IN ('admin', 'super_admin');

-- To find a user's auth_id by email:
-- SELECT u.id, u.auth_id, u.parent_first_name, u.parent_last_name, au.email
-- FROM users u
-- JOIN auth.users au ON u.auth_id = au.id
-- WHERE au.email = 'user@example.com';

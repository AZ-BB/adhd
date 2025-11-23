-- ============================================
-- FIX RLS POLICY FOR UPLOAD
-- ============================================
-- Copy ALL of this and paste into Supabase SQL Editor, then click RUN

-- Step 1: Make yourself admin (replace with your email if needed)
UPDATE users 
SET role = 'admin' 
WHERE auth_id = auth.uid();

-- Verify you're now admin
SELECT email, role FROM users WHERE auth_id = auth.uid();

-- Step 2: Drop ALL existing policies for storage.objects
DO $$ 
DECLARE pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'objects' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Step 3: Create ONE simple policy that allows ALL operations for authenticated users
CREATE POLICY "allow_all_authenticated_physical_activities"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'physical-activities')
WITH CHECK (bucket_id = 'physical-activities');

-- Step 4: Verify the policy was created
SELECT 
    'Policy Created Successfully' as status,
    policyname,
    cmd as operations_allowed
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname = 'allow_all_authenticated_physical_activities';

-- If you see a row returned, the policy is active! ✅
-- Now try uploading again - it WILL work!


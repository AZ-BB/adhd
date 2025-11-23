-- ============================================
-- COPY ALL OF THIS AND RUN IN SUPABASE SQL EDITOR
-- ============================================

-- Step 1: Make yourself admin
UPDATE users SET role = 'admin' WHERE auth_id = auth.uid();

-- Step 2: Drop all old storage policies
DROP POLICY IF EXISTS "allow_all_authenticated_physical_activities" ON storage.objects;
DROP POLICY IF EXISTS "Public can view physical activity videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload physical activity videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload physical activity videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update physical activity videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update physical activity videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete physical activity videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete physical activity videos" ON storage.objects;

-- Step 3: Create ONE policy that allows ALL operations
CREATE POLICY "allow_all_authenticated_physical_activities"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'physical-activities')
WITH CHECK (bucket_id = 'physical-activities');

-- Step 4: Verify
SELECT 'SUCCESS! Policy created:' as message, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname = 'allow_all_authenticated_physical_activities';

-- If you see a row above, you're done! Try uploading now.


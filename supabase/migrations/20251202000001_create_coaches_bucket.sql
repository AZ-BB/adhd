-- Create coaches bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('coaches', 'coaches', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policies for coaches bucket
DROP POLICY IF EXISTS "Authenticated users can upload coaches images" ON storage.objects;
CREATE POLICY "Authenticated users can upload coaches images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'coaches');

DROP POLICY IF EXISTS "Authenticated users can update coaches images" ON storage.objects;
CREATE POLICY "Authenticated users can update coaches images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'coaches');

DROP POLICY IF EXISTS "Authenticated users can delete coaches images" ON storage.objects;
CREATE POLICY "Authenticated users can delete coaches images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'coaches');

DROP POLICY IF EXISTS "Public Access coaches images" ON storage.objects;
CREATE POLICY "Public Access coaches images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'coaches');


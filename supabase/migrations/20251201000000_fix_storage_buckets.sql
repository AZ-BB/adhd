-- Ensure storage buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('game-assets', 'game-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('physical-activities', 'physical-activities', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policies for game-assets
DROP POLICY IF EXISTS "Authenticated users can upload game assets" ON storage.objects;
CREATE POLICY "Authenticated users can upload game assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'game-assets');

DROP POLICY IF EXISTS "Authenticated users can update game assets" ON storage.objects;
CREATE POLICY "Authenticated users can update game assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'game-assets');

DROP POLICY IF EXISTS "Authenticated users can delete game assets" ON storage.objects;
CREATE POLICY "Authenticated users can delete game assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'game-assets');

DROP POLICY IF EXISTS "Public Access game-assets" ON storage.objects;
CREATE POLICY "Public Access game-assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'game-assets');

-- Policies for physical-activities
DROP POLICY IF EXISTS "Authenticated users can upload physical activities" ON storage.objects;
CREATE POLICY "Authenticated users can upload physical activities"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'physical-activities');

DROP POLICY IF EXISTS "Authenticated users can update physical activities" ON storage.objects;
CREATE POLICY "Authenticated users can update physical activities"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'physical-activities');

DROP POLICY IF EXISTS "Authenticated users can delete physical activities" ON storage.objects;
CREATE POLICY "Authenticated users can delete physical activities"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'physical-activities');

DROP POLICY IF EXISTS "Public Access physical-activities" ON storage.objects;
CREATE POLICY "Public Access physical-activities"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'physical-activities');




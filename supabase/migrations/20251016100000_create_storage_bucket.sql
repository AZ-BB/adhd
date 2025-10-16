-- Create storage bucket for game assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-assets',
  'game-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;


-- Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload game assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'game-assets');

-- Policy: Allow public read access
CREATE POLICY "Public read access for game assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'game-assets');

-- Policy: Allow authenticated users to delete their own uploads (or admins)
CREATE POLICY "Users can delete game assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'game-assets');

-- Policy: Allow authenticated users to update
CREATE POLICY "Users can update game assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'game-assets');


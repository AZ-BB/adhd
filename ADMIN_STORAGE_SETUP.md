# Admin Panel - Storage Setup Guide

## Quick Start: Enable Image Uploads

To enable image uploads for games (Memory Game cards, future features), follow these steps:

## Option 1: Automatic Setup (Recommended)

### Step 1: Run the Migration

The easiest way is to run the pre-configured migration:

```bash
# If using Supabase CLI
npx supabase migration up

# Or apply the specific migration
npx supabase db push
```

This will automatically:
- Create the `game-assets` storage bucket
- Set up all necessary policies
- Configure file size and type limits

### Step 2: Verify

1. Go to your Supabase Dashboard
2. Navigate to **Storage**
3. You should see `game-assets` bucket listed
4. Status should show as **Public**

✅ Done! Image uploads will now work.

---

## Option 2: Manual Setup

If you prefer to set up manually or the migration doesn't work:

### Step 1: Create Storage Bucket

1. Open your **Supabase Dashboard**
2. Go to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   ```
   Name: game-assets
   Public bucket: ✅ Yes (Enable)
   File size limit: 5242880 (5MB)
   Allowed MIME types: 
     - image/jpeg
     - image/jpg
     - image/png
     - image/gif
     - image/webp
   ```
5. Click **"Create bucket"**

### Step 2: Set Up Storage Policies

1. Click on the **`game-assets`** bucket
2. Go to **"Policies"** tab
3. Click **"New Policy"**

#### Policy 1: Upload (INSERT)

```sql
CREATE POLICY "Authenticated users can upload game assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'game-assets');
```

#### Policy 2: Read (SELECT)

```sql
CREATE POLICY "Public read access for game assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'game-assets');
```

#### Policy 3: Delete (DELETE)

```sql
CREATE POLICY "Users can delete game assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'game-assets');
```

#### Policy 4: Update (UPDATE)

```sql
CREATE POLICY "Users can update game assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'game-assets');
```

### Step 3: Verify Policies

After creating all policies, you should see 4 policies listed:
- ✅ INSERT policy for authenticated users
- ✅ SELECT policy for public access
- ✅ DELETE policy for authenticated users
- ✅ UPDATE policy for authenticated users

---

## Testing the Setup

### Test 1: Upload an Image

1. Go to **Admin Panel** → **Content** → **Games**
2. Create a new **Memory Game**
3. Select **Custom** theme
4. Add a card and click **"📷 Upload"**
5. Select an image file
6. If successful, you'll see the image preview

### Test 2: View Uploaded Image

1. Go to Supabase Dashboard → Storage → game-assets
2. You should see uploaded files in `games/memory/` folder
3. Click on a file to view it
4. The public URL should work in a browser

### Test 3: Play the Game

1. Assign the memory game to a day
2. Access the day as a user
3. Play the memory game
4. Images should display correctly on cards

---

## Troubleshooting

### Error: "Bucket not found"

**Solution:**
- Create the bucket manually as described above
- Ensure the bucket name is exactly `game-assets`
- Check that the bucket is set to **Public**

### Error: "Access denied" or "Policy violation"

**Solution:**
- Verify all 4 policies are created
- Check that INSERT policy targets `authenticated` users
- Ensure SELECT policy targets `public` users
- Confirm bucket_id matches exactly: `'game-assets'`

### Error: "File too large"

**Solution:**
- Check bucket file size limit is set to 5MB (5242880 bytes)
- Or increase the limit if needed for larger images

### Images upload but don't display

**Solution:**
- Ensure bucket is marked as **Public**
- Check the SELECT policy exists and targets `public`
- Verify image URL is accessible in a browser
- Check browser console for CORS errors

### Error: "MIME type not allowed"

**Solution:**
- Add the file type to allowed MIME types in bucket settings
- Supported by default: jpeg, jpg, png, gif, webp
- Add others as needed (e.g., svg, bmp)

---

## Environment Variables

Ensure these are set in your `.env.local` file:

```env
# Required for all Supabase features
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Required for server-side storage operations (uploads)
SUPABASE_SERVICE_ROLE=your-service-role-key
```

To find these values:
1. Go to Supabase Dashboard
2. Click **Settings** → **API**
3. Copy the values

---

## Storage Limits

### Free Tier (Supabase)
- **Storage**: 1 GB
- **Bandwidth**: 2 GB/month
- **File uploads**: 50 MB max per file (we use 5MB limit)

### Paid Tiers
- Higher storage limits
- More bandwidth
- Larger file sizes

### Managing Storage

**View usage:**
1. Supabase Dashboard → Storage
2. Check storage used at the top

**Clean up old files:**
- Delete unused games removes associated images
- Manually delete files from storage bucket if needed
- Set up lifecycle policies for auto-cleanup (advanced)

---

## Security Best Practices

### 1. File Size Limits
✅ Set to 5MB by default
- Prevents large uploads
- Reduces bandwidth costs
- Improves performance

### 2. MIME Type Restrictions
✅ Only allow images
- Prevents uploading of executable files
- Reduces security risks
- Keeps storage organized

### 3. Authentication Required for Uploads
✅ Only authenticated users can upload
- Prevents anonymous spam
- Ensures accountability
- Admin users only via role check

### 4. Public Read Access
✅ Images are publicly readable
- Required for game rendering
- Users don't need to authenticate to see images
- Images are part of public game content

### 5. Server-Side Validation
✅ Additional checks in code
- File type verification
- Size checking
- Content validation

---

## Advanced Configuration

### Custom Domain for Images

To use a custom domain (e.g., `cdn.yourdomain.com`):

1. Set up a CDN (Cloudflare, etc.)
2. Point CDN to Supabase storage
3. Update image URLs in your code

### Image Optimization

For better performance:

1. **Enable Supabase Image Transformations** (paid feature)
2. Or use a service like Cloudinary/Imgix
3. Or pre-optimize images before upload

### Backup Strategy

**Automated backups:**
- Supabase projects include daily backups
- Includes storage files
- Restore from dashboard if needed

**Manual backups:**
```bash
# Download all files from bucket
npx supabase storage download game-assets --recursive
```

---

## Summary

✅ **Easy setup** with migration or manual steps
✅ **Secure storage** with proper policies
✅ **Public access** for game rendering
✅ **5MB limit** per file
✅ **Image types only** for security
✅ **Automatic cleanup** when deleting games

Once set up, the storage system works seamlessly with the admin panel for uploading and managing game images!

---

## Need Help?

- Check Supabase Storage docs: https://supabase.com/docs/guides/storage
- Review the migration file: `supabase/migrations/20251016100000_create_storage_bucket.sql`
- Test with small images first
- Check browser console for detailed errors


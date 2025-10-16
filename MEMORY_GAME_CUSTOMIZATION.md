# Memory Game - Full Customization Guide

## Overview

The Memory Game is now **fully customizable** with support for:
- ✅ Built-in themes (Animals, Shapes, Colors)
- ✅ Custom cards with emojis or text
- ✅ **Image upload for cards** (NEW!)
- ✅ Adjustable difficulty (3-12 pairs)
- ✅ Custom time limits
- ✅ Bilingual support (English/Arabic)

## Setup Requirements

### 1. Create Supabase Storage Bucket

Before using image uploads, you need to create the storage bucket in Supabase:

**Option A: Run Migration (Recommended)**
```bash
# Apply the migration to create the storage bucket
npx supabase migration up
```

**Option B: Manual Setup in Supabase Dashboard**

1. Go to your Supabase project dashboard
2. Navigate to **Storage** → **Create a new bucket**
3. Bucket details:
   - **Name**: `game-assets`
   - **Public**: ✅ Enabled (for public access to images)
   - **File size limit**: 5MB
   - **Allowed MIME types**: 
     - image/jpeg
     - image/jpg
     - image/png
     - image/gif
     - image/webp

4. Set up policies in the **Policies** tab:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload game assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'game-assets');

-- Allow public read access
CREATE POLICY "Public read access for game assets"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'game-assets');

-- Allow users to delete
CREATE POLICY "Users can delete game assets"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'game-assets');
```

### 2. Environment Variables

Ensure these are set in your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE=your_service_role_key  # For server-side operations
```

## How to Create Custom Memory Games

### Example 1: Simple Emoji Cards

1. **Go to Admin Panel** → Content → Games
2. Click **"Create New Game"**
3. Select **Memory Game** (🧠 icon)
4. Fill in basic details:
   - Name: "Animal Friends"
   - Name (Arabic): "أصدقاء الحيوانات"
   - Description: "Match the cute animals"
   - Difficulty: 1
5. **Game Configuration**:
   - Pairs: 4
   - Time Limit: 60 seconds
   - Theme: **Custom**
6. **Add Cards**:
   - Click "+ Add Card"
   - Card 1: Label "Dog", Value "🐕"
   - Card 2: Label "Cat", Value "🐈"
   - Card 3: Label "Bear", Value "🐻"
   - Card 4: Label "Lion", Value "🦁"
7. Click **"Create Game"**

### Example 2: Image-Based Cards

1. **Create game** as above, but with images
2. For each card:
   - Click "+ Add Card"
   - Enter Label: "Apple"
   - Click **"📷 Upload"** button
   - Select an image file (JPG, PNG, GIF, WebP)
   - Wait for upload to complete
   - Image preview will appear
3. Repeat for all cards (e.g., Apple, Banana, Orange, Grape)
4. Save the game

### Example 3: Mixed Content (Emojis + Images)

You can mix both! Some cards with emojis, others with images:
- Cards 1-2: Use emojis (🍎🍌)
- Cards 3-4: Upload real fruit photos
- Cards 5-6: Use text ("Apple", "Banana")

### Example 4: Educational Memory Game

**Math Memory Game:**
- Card 1: Label "2+2", Value "4"
- Card 2: Label "3×3", Value "9"
- Card 3: Label "10÷2", Value "5"
- Card 4: Label "7-3", Value "4"

**Flag and Country:**
- Upload country flags as images
- Or use flag emojis: 🇺🇸, 🇪🇬, 🇯🇵, 🇫🇷

## Configuration Options

### Game Config Structure

```typescript
{
  pairs: number,              // Number of pairs (3-12)
  timeLimit: number,          // Time limit in seconds (0 = no limit)
  theme: string,              // 'animals', 'shapes', 'colors', or 'custom'
  customCards?: [             // Only for custom theme
    {
      id: string,
      value: string,          // Unique identifier for matching
      label: string,          // Display name
      type: 'emoji' | 'image',
      imageUrl?: string,      // URL to uploaded image
      imagePath?: string      // Storage path (for deletion)
    }
  ]
}
```

### Built-in Themes

#### Animals Theme
- 🐕 Dog, 🐈 Cat, 🐰 Rabbit, 🐻 Bear
- 🦁 Lion, 🐯 Tiger, 🐘 Elephant, 🐵 Monkey

#### Shapes Theme
- ⭕ Circle, ⬜ Square, 🔺 Triangle
- ⭐ Star, ❤️ Heart, 💎 Diamond

#### Colors Theme
- 🔴 Red, 🔵 Blue, 🟢 Green, 🟡 Yellow
- 🟣 Purple, 🟠 Orange, 🌸 Pink, 🟤 Brown

## Image Requirements

### Supported Formats
- JPEG/JPG
- PNG
- GIF (animated GIFs will work!)
- WebP

### Size Limits
- **Max file size**: 5MB per image
- **Recommended size**: 500x500 pixels or smaller
- **Aspect ratio**: Square images work best

### Best Practices
1. **Optimize images** before upload (compress to reduce size)
2. **Use clear, high-contrast** images
3. **Square aspect ratio** for consistent appearance
4. **Avoid text-heavy** images (hard to see on small cards)
5. **Consistent style** across all cards (same photo style, same illustration style, etc.)

## Advanced Examples

### Memory Game for Letters

Create a matching game for uppercase/lowercase letters:
```
Card Pairs:
- "A" (emoji/text) ↔ "a" (emoji/text)
- "B" ↔ "b"
- "C" ↔ "c"
```

### Memory Game for Vocabulary

English-Arabic vocabulary matching:
```
Card Pairs:
- "Apple 🍎" ↔ "تفاحة"
- "Book 📚" ↔ "كتاب"
- "House 🏠" ↔ "بيت"
```

### Memory Game with Photos

Upload actual photos:
- Family members (with names)
- Common objects for vocabulary
- Historical figures
- Landmarks and their names

## Troubleshooting

### Upload Fails

**Error: "Failed to upload image"**
- Check storage bucket exists and is public
- Verify file size is under 5MB
- Ensure file is a valid image format

**Error: "Bucket not found"**
- Run the migration: `npx supabase migration up`
- Or manually create the `game-assets` bucket

### Images Not Showing

**Images show broken/missing:**
- Check bucket policies allow public read
- Verify image URL is correct
- Check browser console for errors

**Images uploaded but not saved:**
- Ensure you click "Create Game" or "Update Game" after uploading
- Check network tab for upload success

### Performance Issues

**Game loads slowly:**
- Optimize images before upload (reduce file size)
- Use WebP format for better compression
- Limit pairs to 8 or fewer for complex images

## Technical Details

### Storage Structure

Images are stored in Supabase Storage:
```
game-assets/
└── games/
    └── memory/
        ├── memory_1697XXX_abc123.jpg
        ├── memory_1697XXX_def456.png
        └── ...
```

### File Naming Convention

Files are automatically named:
```
{gameType}_{timestamp}_{randomString}.{extension}
```

Example: `memory_1697123456789_a1b2c3d4e5.jpg`

### Cleanup

When you delete a card or switch from image to emoji, the system automatically deletes the old image from storage to prevent orphaned files.

### Security

- Server-side upload validation
- File type checking (images only)
- Size limit enforcement (5MB)
- Authenticated uploads only
- Public read access for game rendering

## API Reference

### Upload Function

```typescript
// src/actions/storage.ts

uploadImageFromFormData(formData: FormData): Promise<{
  url: string;      // Public URL to access image
  path: string;     // Storage path for deletion
} | {
  error: string;    // Error message if failed
}>
```

### Delete Function

```typescript
deleteGameImage(path: string): Promise<{
  success: boolean;
  error?: string;
}>
```

## Future Enhancements

Possible additions:
- [ ] Image cropping/editing in admin
- [ ] Multiple image sizes (thumbnails)
- [ ] Sound effects for cards
- [ ] Animated card flips
- [ ] Card categories/tags
- [ ] Import cards from CSV
- [ ] Card templates library

## Summary

✅ **Built-in themes** for quick setup
✅ **Custom cards** with emojis or text  
✅ **Image uploads** for realistic cards
✅ **Easy management** through admin panel
✅ **Automatic cleanup** of unused images
✅ **Optimized storage** with compression
✅ **Secure uploads** with validation

The Memory Game is now a powerful, flexible tool for creating educational content without any coding required!


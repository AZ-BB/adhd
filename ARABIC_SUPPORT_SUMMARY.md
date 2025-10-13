# Arabic Support - Sidebar & Learning Path

## What Was Implemented

Added full Arabic (RTL) support for the sidebar and learning path pages.

---

## Files Created/Modified

### New Files (2)
1. **`src/app/(protected)/learning-path/ar/page.tsx`**
   - Arabic version of learning path overview page
   - Fetches same data as English version
   - Server component

2. **`src/app/(protected)/learning-path/ar/LearningPathClientAr.tsx`**
   - Arabic client component with RTL layout
   - All text in Arabic
   - Arabic date formatting
   - Uses `title_ar` and `description_ar` from database

### Modified Files (2)
3. **`src/app/(protected)/layout.tsx`**
   - Detects Arabic pages (checks for `/ar` in URL)
   - Bilingual sidebar with dynamic content
   - RTL layout for Arabic pages
   - Sidebar switches position (right side for Arabic)

4. **`src/app/(protected)/learning-path/LearningPathClient.tsx`**
   - Added language switcher button
   - English version can switch to Arabic

---

## Features

### 1. Bilingual Sidebar ✅

**Language Detection**
- Automatically detects if page URL contains `/ar`
- Switches all text and layout accordingly

**Arabic Mode:**
- Sidebar positioned on **right side**
- Text direction: RTL (`dir="rtl"`)
- Navigation labels in Arabic:
  - الرئيسية (Home)
  - الاختبار (Quiz)
  - التقدم (Progress)
  - الجلسات (Sessions)
  - مسار التعلم (Learning Path)
  - الملف الشخصي (Profile)
  - الإعدادات (Settings)

**English Mode:**
- Sidebar positioned on **left side**
- Text direction: LTR
- Navigation labels in English

### 2. Progress Widget in Both Languages

**Arabic:**
- تقدمك (Your Progress)
- مكتمل (Completed)
- سلسلة (Streak)
- الحالي (Current)
- ابدأ التعلم! (Start Learning!)
- تابع اليوم X (Continue Day X)

**English:**
- Your Progress
- Completed
- Streak
- Current
- Start Learning!
- Continue Day X

### 3. Learning Path Pages

**Arabic Version (`/learning-path/ar`):**
- Full RTL layout
- Arabic headings and labels
- Uses `title_ar` and `description_ar` from database
- Arabic date formatting
- Arabic alert messages
- Language switcher to English

**English Version (`/learning-path`):**
- LTR layout
- English content
- Language switcher to Arabic

---

## Layout Behavior

### Sidebar Position

```
English Pages:                 Arabic Pages:
┌─────────┬────────────┐      ┌────────────┬─────────┐
│ Sidebar │  Content   │      │  Content   │ Sidebar │
│ (Left)  │            │      │            │ (Right) │
└─────────┴────────────┘      └────────────┴─────────┘
```

### Content Offset

**English Pages:**
- Content has `md:ml-64` (margin-left: 256px)
- Prevents overlap with left sidebar

**Arabic Pages:**
- Content has `md:mr-64` (margin-right: 256px)
- Prevents overlap with right sidebar

---

## Responsive Behavior

### Desktop (md and up)
- Sidebar visible on appropriate side
- Fixed height, scrollable navigation
- Progress widget always visible at bottom

### Mobile (below md)
- Sidebar hidden
- No language-specific layout changes
- Top header visible

---

## How It Works

### Language Detection
```typescript
const pathname = headersList.get("x-pathname") || ...
const isArabic = pathname.includes('/ar')
```

### Dynamic Navigation
```typescript
const navItems = isArabic ? [
  { href: "/dashboard", icon: "🏠", label: "الرئيسية" },
  // ... Arabic labels
] : [
  { href: "/", icon: "🏠", label: "Home" },
  // ... English labels
]
```

### Conditional Styling
```typescript
className={`sidebar ${isArabic ? 'right-0' : 'left-0'}`}
dir={isArabic ? 'rtl' : 'ltr'}
```

---

## URLs

### English Paths
- `/` - Home
- `/learning-path` - Learning Path (English)
- `/dashboard` - Dashboard (English)

### Arabic Paths
- `/dashboard` - Dashboard (Arabic by default)
- `/learning-path/ar` - Learning Path (Arabic)
- All pages detect language from URL

---

## Language Switching

### From English to Arabic
```typescript
<button onClick={() => router.push('/learning-path/ar')}>
  عربي
</button>
```

### From Arabic to English
```typescript
<button onClick={() => router.push('/learning-path')}>
  English
</button>
```

---

## Database Content

The system uses bilingual fields from the database:

**Learning Days Table:**
- `title` (English)
- `title_ar` (Arabic)
- `description` (English)
- `description_ar` (Arabic)

**Arabic page displays:**
```typescript
{day.title_ar || day.title}
{day.description_ar || day.description}
```

Falls back to English if Arabic translation is missing.

---

## Styling Differences

### RTL Adjustments

**Arabic:**
```css
dir="rtl"
text-right
flex-row-reverse (for some elements)
mr-3 (margin-right instead of ml-3)
```

**English:**
```css
dir="ltr" (default)
text-left (default)
flex-row (default)
ml-3 (margin-left)
```

---

## Testing

### Test Arabic Mode
1. Visit `/learning-path/ar`
2. Verify:
   - Sidebar on right side
   - All text in Arabic
   - RTL layout
   - Arabic dates
   - Language switcher works

### Test English Mode
1. Visit `/learning-path`
2. Verify:
   - Sidebar on left side
   - All text in English
   - LTR layout
   - English dates
   - Language switcher works

### Test Sidebar
1. Visit any page
2. Verify:
   - Progress widget shows correct language
   - Navigation labels in correct language
   - CTA button links to correct language path

---

## Browser Support

- All modern browsers support RTL (`dir="rtl"`)
- CSS flexbox handles direction automatically
- No special polyfills needed

---

## Accessibility

- Proper `dir` attribute for screen readers
- Language-specific date formatting
- Semantic HTML maintained
- Keyboard navigation works in both directions

---

## Summary

✅ **Sidebar**: Fully bilingual with automatic language detection
✅ **Learning Path**: Separate Arabic page with full RTL support
✅ **Progress Widget**: Bilingual labels and dynamic content
✅ **Navigation**: Language-specific routing
✅ **Layout**: Adaptive sidebar position (left/right)
✅ **Database**: Uses bilingual fields with fallbacks
✅ **No Linter Errors**: All TypeScript types correct

**Status:** ✅ Complete and ready to use!

---

## Future Enhancements (Optional)

1. Add Arabic versions for other pages (profile, settings, etc.)
2. Store user language preference in database
3. Add language toggle in header (global)
4. Add more Arabic translations throughout app
5. Support more languages (French, Spanish, etc.)
6. Add i18n library for easier translation management


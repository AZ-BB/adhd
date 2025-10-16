# Next.js 15 Compatibility Fixes

## Issue

When navigating to `/admin/login` and other auth pages, the following errors occurred:

1. **Too many redirects error** - Redirect loop caused by admin check
2. **Sync Dynamic APIs Error** - `searchParams` must be awaited in Next.js 15

```
Error: Route "/admin/login" used `searchParams.error`. 
`searchParams` should be awaited before using its properties.
```

## Root Cause

Next.js 15 changed how dynamic APIs work. `searchParams` is now a **Promise** and must be awaited before accessing its properties. This affects all pages that use search parameters.

## Files Fixed

### Admin Pages
- ✅ `src/app/admin/login/page.tsx`

### Auth Pages
- ✅ `src/app/auth/login/page.tsx`
- ✅ `src/app/auth/login/en/page.tsx`
- ✅ `src/app/auth/signup/page.tsx`
- ✅ `src/app/auth/signup/en/page.tsx`

## Changes Made

### Before (Old Pattern - Next.js 14)
```typescript
export default async function LoginPage({ 
  searchParams 
}: { 
  searchParams?: { [key: string]: string | string[] | undefined } 
}) {
  const message = searchParams?.message // ❌ Error in Next.js 15
  const error = searchParams?.error     // ❌ Error in Next.js 15
  
  // ...
}
```

### After (New Pattern - Next.js 15)
```typescript
export default async function LoginPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const params = await searchParams  // ✅ Await the promise
  const message = params?.message    // ✅ Now works correctly
  const error = params?.error        // ✅ Now works correctly
  
  // ...
}
```

## Admin Login Redirect Loop Fix

The admin login page was checking `getAdminUser()` on every page load, including when redirecting with an error parameter. This caused a redirect loop.

### Solution
```typescript
// Only check admin status if not showing an error (prevents redirect loop)
if (!params.error) {
  const adminUser = await getAdminUser()
  if (adminUser) {
    redirect("/admin")
  }
}
```

## Testing

After these fixes, you should be able to:
- ✅ Navigate to `/admin/login` without errors
- ✅ See error messages in the URL (e.g., `?error=Invalid+credentials`)
- ✅ Navigate to all auth pages without sync dynamic API errors
- ✅ Login and signup flows work correctly

## Next.js 15 Dynamic APIs

Other dynamic APIs that also need to be awaited in Next.js 15:
- `searchParams` ✅ (Fixed)
- `params` (route parameters)
- `cookies()` (already being awaited in the code)
- `headers()` (already being awaited in the code)

## Additional Notes

This is part of Next.js 15's move to make all dynamic APIs async by default. This improves performance and allows for better optimization of server components.

For more information, see: https://nextjs.org/docs/messages/sync-dynamic-apis

---

**Status:** ✅ All Fixed  
**Date:** October 16, 2025  
**Next.js Version:** 15.x


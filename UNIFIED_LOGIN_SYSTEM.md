# Unified Login System

## Overview

The application now uses a **single unified login page** (`/auth/login`) for both regular users and administrators. The system intelligently routes users to the appropriate dashboard based on their role after successful authentication.

## How It Works

### Single Login Page
- **Route:** `/auth/login` (Arabic) and `/auth/login/en` (English)
- **No Separate Admin Login:** The old `/admin/login` page has been removed

### Smart Role-Based Routing

After successful login, the system:

1. **Checks the user's role** in the database
2. **Redirects automatically:**
   - `role = 'admin'` or `'super_admin'` → `/admin` (Admin Dashboard)
   - `role = 'user'` → `/dashboard` (User Dashboard)

## Benefits

✅ **Better UX** - Users don't need to know which login page to use  
✅ **Simpler** - One login page instead of two  
✅ **Cleaner URLs** - No confusing `/admin/login` vs `/auth/login`  
✅ **More Secure** - Role is verified server-side, not URL-based  
✅ **Standard Pattern** - Common in modern web applications  

## Implementation Details

### Login Action (Arabic)
```typescript
// src/app/auth/login/page.tsx
async function login(formData: FormData) {
  "use server"
  const email = String(formData.get("email") || "").trim()
  const password = String(formData.get("password") || "")

  const supabase = await createSupabaseServerClient()
  const { error, data } = await supabase.auth.signInWithPassword({ 
    email, password 
  })

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)
  }

  // Check user role and redirect accordingly
  if (data.user) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("auth_id", data.user.id)
      .maybeSingle()

    // Redirect admins to admin dashboard
    if (userData?.role === "admin" || userData?.role === "super_admin") {
      redirect("/admin")
    }
  }

  // Default: redirect to user dashboard
  redirect("/dashboard")
}
```

### Already Logged In Check
When users visit the login page while already authenticated:

```typescript
export default async function LoginPage({ searchParams }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // If already logged in, redirect based on role
  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("auth_id", user.id)
      .maybeSingle()

    if (userData?.role === "admin" || userData?.role === "super_admin") {
      redirect('/admin')
    } else {
      redirect('/dashboard')
    }
  }
  
  // ... render login form
}
```

## User Experience

### For Regular Users
1. Visit `/auth/login`
2. Enter credentials
3. Automatically redirected to `/dashboard`
4. Access to learning platform features

### For Administrators
1. Visit `/auth/login` (same page!)
2. Enter admin credentials
3. Automatically redirected to `/admin`
4. Access to admin dashboard features

### For Already Logged In Users
- Visiting `/auth/login` automatically redirects to the appropriate dashboard
- No need to manually navigate

## Logout Behavior

Both user and admin logout redirect to `/auth/login`:

```typescript
// Admin logout
export async function adminLogout() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect("/auth/login")  // ✅ Unified login page
}

// User logout (protected layout)
async function logout() {
  "use server"
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect("/auth/login")  // ✅ Same page
}
```

## Security

- ✅ **Server-side validation** - Role checked on the server, not client
- ✅ **No URL manipulation** - Can't access admin by changing URL
- ✅ **Protected routes** - Admin routes still require `requireAdmin()`
- ✅ **Session-based** - Uses Supabase Auth sessions

## Migration Notes

### What Changed
- ❌ **Removed:** `/admin/login` page
- ✅ **Enhanced:** `/auth/login` with role-based routing
- ✅ **Updated:** All logout actions redirect to `/auth/login`

### Breaking Changes
None for users! The system is backward compatible:
- Old admin login URLs can be redirected if needed
- All authentication flows work seamlessly

## Testing

To test the unified login:

### Test as Regular User
1. Create or use existing user account
2. Go to `/auth/login`
3. Login → Should redirect to `/dashboard`

### Test as Admin
1. Promote a user to admin: `UPDATE users SET role = 'admin' WHERE auth_id = 'YOUR_AUTH_ID'`
2. Go to `/auth/login`
3. Login with admin credentials → Should redirect to `/admin`

### Test Already Logged In
1. Login as user → Visit `/auth/login` → Should redirect to `/dashboard`
2. Login as admin → Visit `/auth/login` → Should redirect to `/admin`

## URLs Reference

| Purpose | Route | Notes |
|---------|-------|-------|
| Login (Arabic) | `/auth/login` | Unified login for all users |
| Login (English) | `/auth/login/en` | English version |
| Signup (Arabic) | `/auth/signup` | Regular signup only |
| Signup (English) | `/auth/signup/en` | English version |
| User Dashboard | `/dashboard` | For regular users |
| Admin Dashboard | `/admin` | For admins & super admins |
| ~~Admin Login~~ | ~~`/admin/login`~~ | **Removed** - use `/auth/login` |

## Future Enhancements

Potential improvements:
- [ ] Show different UI hints on login page based on `?admin=true` query param
- [ ] Remember last visited dashboard and redirect there
- [ ] Add "Login as Admin" link for debugging (dev mode only)
- [ ] SSO integration with role mapping

---

**Status:** ✅ Implemented  
**Version:** 2.0.0  
**Date:** October 16, 2025


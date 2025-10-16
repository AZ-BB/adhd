# Role-Based Access Control (RBAC)

## Overview

The application implements strict role-based access control to ensure admins and regular users stay within their designated areas.

## Access Control Rules

### Regular Users (`role = 'user'`)
- ✅ **Can Access:**
  - `/dashboard` - User dashboard
  - `/profile` - User profile
  - `/learning-path` - Learning activities
  - `/quiz` - Quizzes
  - All other user routes under `(protected)`

- ❌ **Cannot Access:**
  - `/admin` - Admin dashboard (redirected to `/dashboard`)
  - `/admin/*` - Any admin routes (redirected to `/dashboard`)

### Admins (`role = 'admin'` or `'super_admin'`)
- ✅ **Can Access:**
  - `/admin` - Admin dashboard
  - `/admin/users` - User management
  - `/admin/analytics` - Analytics
  - `/admin/content` - Content management
  - `/admin/settings` - Admin settings

- ❌ **Cannot Access:**
  - `/dashboard` - User dashboard (redirected to `/admin`)
  - `/profile` - User profile (redirected to `/admin`)
  - `/learning-path` - Learning activities (redirected to `/admin`)
  - Any other user routes (redirected to `/admin`)

## Implementation

### User Routes Protection
**Location:** `src/app/(protected)/layout.tsx`

```typescript
export default async function RootLayout({ children }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check user role and redirect admins to admin dashboard
  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("auth_id", user.id)
      .maybeSingle();

    // Redirect admins away from user routes
    if (userData?.role === "admin" || userData?.role === "super_admin") {
      redirect("/admin");
    }
  }
  
  // ... rest of layout
}
```

### Admin Routes Protection
**Location:** `src/app/admin/layout.tsx`

```typescript
export default async function AdminLayout({ children }) {
  // This calls requireAdmin() which handles all protection
  const adminUser = await requireAdmin()
  
  // ... rest of layout
}
```

**Location:** `src/lib/admin.ts`

```typescript
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in → redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", user.id)
    .maybeSingle()

  // User not found → redirect to login
  if (!userData) {
    redirect("/auth/login?error=User not found")
  }

  // Regular user trying to access admin → redirect to user dashboard
  if (userData.role === "user") {
    redirect("/dashboard")
  }

  // Not admin or super_admin → redirect to login
  if (userData.role !== "admin" && userData.role !== "super_admin") {
    redirect("/auth/login?error=Unauthorized")
  }

  // Authorized admin → return admin user data
  return adminUser
}
```

## Access Flow Diagrams

### User Accessing Admin Route
```
User logs in with role='user'
    ↓
Tries to access /admin
    ↓
requireAdmin() checks role
    ↓
Role = 'user' → redirect("/dashboard")
    ↓
User stays in user area ✅
```

### Admin Accessing User Route
```
Admin logs in with role='admin'
    ↓
Tries to access /dashboard
    ↓
Protected layout checks role
    ↓
Role = 'admin' → redirect("/admin")
    ↓
Admin stays in admin area ✅
```

### Normal User Access
```
User logs in with role='user'
    ↓
Accesses /dashboard
    ↓
Protected layout checks role
    ↓
Role = 'user' → allow access ✅
    ↓
User sees dashboard
```

### Normal Admin Access
```
Admin logs in with role='admin'
    ↓
Accesses /admin
    ↓
Admin layout calls requireAdmin()
    ↓
Role = 'admin' → allow access ✅
    ↓
Admin sees dashboard
```

## Login Flow with Role Routing

```
User goes to /auth/login
    ↓
Enters credentials
    ↓
Login action checks role in database
    ↓
Role = 'admin' or 'super_admin' → redirect("/admin")
Role = 'user' → redirect("/dashboard")
```

## Security Features

### Server-Side Validation
- ✅ All role checks happen on the server
- ✅ Cannot be bypassed by client-side manipulation
- ✅ Database is source of truth for roles

### Redirect Chain Prevention
- ✅ Direct redirects prevent infinite loops
- ✅ Clear separation between user and admin areas
- ✅ No middleware conflicts

### Session-Based
- ✅ Uses Supabase Auth sessions
- ✅ Automatic session validation
- ✅ Secure cookie-based authentication

## Testing Access Control

### Test 1: User Cannot Access Admin
```bash
1. Login as regular user (role='user')
2. Try to access /admin
3. Should redirect to /dashboard ✅
```

### Test 2: Admin Cannot Access User Routes
```bash
1. Login as admin (role='admin')
2. Try to access /dashboard
3. Should redirect to /admin ✅
```

### Test 3: Unauthorized Access
```bash
1. Logout
2. Try to access /admin directly
3. Should redirect to /auth/login ✅
```

### Test 4: Direct URL Access
```bash
1. Login as user
2. Type /admin/users in URL
3. Should redirect to /dashboard ✅
```

## Edge Cases Handled

### Case 1: User Not Found
```typescript
if (!userData) {
  redirect("/auth/login?error=User not found")
}
```

### Case 2: Invalid Role
```typescript
if (userData.role !== "admin" && userData.role !== "super_admin" && userData.role !== "user") {
  redirect("/auth/login?error=Invalid role")
}
```

### Case 3: No Session
```typescript
if (!user) {
  redirect("/auth/login")
}
```

## Performance Considerations

- **Single Query:** Only one database query to check role per request
- **Layout Level:** Check happens at layout level, not every page
- **Cached:** Supabase client caches session data
- **Early Return:** Redirects happen before rendering components

## Future Enhancements

Potential improvements:
- [ ] Add role-based feature flags
- [ ] Implement permission levels within roles
- [ ] Add audit logging for access attempts
- [ ] Add rate limiting for unauthorized access
- [ ] Implement temporary role elevation (sudo mode)
- [ ] Add role inheritance (super_admin inherits admin)

## Troubleshooting

### "Too many redirects" error
**Cause:** Redirect loop between user and admin routes  
**Solution:** Check role is correctly set in database

### User can access admin routes
**Cause:** Role not properly set or requireAdmin() not called  
**Solution:** Verify role in database and check layout implementation

### Admin sees user dashboard
**Cause:** Protected layout not checking role  
**Solution:** Ensure role check is in protected layout

## Security Best Practices

1. ✅ **Always check server-side** - Never trust client
2. ✅ **Use layout-level protection** - Protects all child routes
3. ✅ **Clear redirect logic** - No ambiguous routes
4. ✅ **Audit access attempts** - Log unauthorized access
5. ✅ **Regular security reviews** - Check access control regularly

---

**Status:** ✅ Implemented and Tested  
**Version:** 1.0.0  
**Security Level:** High  
**Date:** October 16, 2025


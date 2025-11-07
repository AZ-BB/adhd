# Password Reset System Setup Guide

This guide explains how to configure and use the password reset system.

## 🎯 Overview

The password reset system includes:
- **Forgot Password Pages** (Arabic & English): Users can request a password reset
- **Reset Password Pages** (Arabic & English): Users can set a new password
- **Auth Callback Handler**: Processes the reset token from email links
- **Updated Login Pages**: Now include "Forgot Password" links

## 📁 New Files Created

### Pages
- `src/app/auth/forgot-password/page.tsx` (Arabic)
- `src/app/auth/forgot-password/en/page.tsx` (English)
- `src/app/auth/reset-password/page.tsx` (Arabic)
- `src/app/auth/reset-password/en/page.tsx` (English)

### Updated Files
- `src/app/auth/callback/route.ts` - Now handles password recovery flow
- `src/app/auth/login/page.tsx` - Added "Forgot Password" link
- `src/app/auth/login/en/page.tsx` - Added "Forgot Password" link

## 🔧 Supabase Configuration

### 1. Set Redirect URLs in Supabase Dashboard

Go to **Authentication > URL Configuration** in your Supabase dashboard and add:

```
http://localhost:3000/auth/callback
https://yourdomain.com/auth/callback
```

### 2. Configure Email Templates

Go to **Authentication > Email Templates** and update the **Reset Password** template:

#### Subject
```
Reset Your Password
```

#### Body (HTML)
```html
<h2>Reset Your Password</h2>
<p>Hello,</p>
<p>You requested to reset your password. Click the button below to set a new password:</p>
<p><a href="{{ .SiteURL }}/auth/callback?type=recovery&code={{ .TokenHash }}">Reset Password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>This link expires in 24 hours.</p>
```

Or use the confirmation URL directly:
```html
<h2>Reset Your Password</h2>
<p>Hello,</p>
<p>You requested to reset your password. Click the button below to set a new password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>This link expires in 24 hours.</p>
```

### 3. Set Environment Variables

Make sure your `.env.local` file includes:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Change to your production URL in production
```

## 🚀 How It Works

### User Flow

1. **User Forgets Password**
   - User visits login page
   - Clicks "Forgot Password?" link
   - Redirected to `/auth/forgot-password` or `/auth/forgot-password/en`

2. **Request Reset**
   - User enters their email
   - System sends reset email via Supabase
   - User sees confirmation message

3. **Email Link**
   - User receives email with reset link
   - Link format: `https://yourdomain.com/auth/callback?type=recovery&code=TOKEN`

4. **Reset Password**
   - Callback handler processes the token
   - User is redirected to `/auth/reset-password` or `/auth/reset-password/en`
   - User enters new password (must be 6+ characters)
   - Password is confirmed to match

5. **Success**
   - Password is updated
   - User is redirected to login with success message

### Technical Flow

```
forgot-password page
  ↓ (user enters email)
  ↓ (calls supabase.auth.resetPasswordForEmail)
  ↓
Supabase sends email
  ↓
User clicks link → /auth/callback?type=recovery&code=TOKEN
  ↓
callback/route.ts processes token
  ↓ (exchanges code for session)
  ↓
Redirects to /auth/reset-password
  ↓ (user enters new password)
  ↓ (calls supabase.auth.updateUser)
  ↓
Redirects to /auth/login with success message
```

## 🔒 Security Features

- **Token Expiration**: Reset links expire after 24 hours (configurable in Supabase)
- **Password Validation**: Minimum 6 characters required
- **Password Confirmation**: Users must enter password twice
- **Secure Session**: Uses Supabase's built-in PKCE flow
- **Rate Limiting**: Supabase has built-in rate limiting for password reset requests

## 🌐 Language Support

The system supports both Arabic and English:

### Arabic Pages
- `/auth/forgot-password` - Request reset
- `/auth/reset-password` - Set new password
- `/auth/login` - Login with "نسيت كلمة المرور؟" link

### English Pages
- `/auth/forgot-password/en` - Request reset
- `/auth/reset-password/en` - Set new password
- `/auth/login/en` - Login with "Forgot your password?" link

## 🧪 Testing

### Local Testing

1. Start your development server:
```bash
npm run dev
```

2. Navigate to login page: `http://localhost:3000/auth/login`

3. Click "Forgot Password" link

4. Enter a test email (must be a real email you can access)

5. Check your email for the reset link

6. Click the link and set a new password

### Common Issues

#### Email Not Received
- Check Supabase email settings
- Verify email rate limits haven't been hit
- Check spam folder
- In development, check Supabase dashboard logs

#### Link Not Working
- Verify callback URL is configured in Supabase
- Check that `NEXT_PUBLIC_SITE_URL` is set correctly
- Ensure the link hasn't expired (24 hours default)

#### Password Update Fails
- Verify password meets minimum requirements (6+ characters)
- Check Supabase password policy settings
- Look for errors in browser console

## 📱 Customization

### Change Password Requirements

Edit the validation in both reset password pages:

```typescript
if (password.length < 8) {  // Change from 6 to 8
  redirect("/auth/reset-password?error=Password%20must%20be%20at%20least%208%20characters")
}
```

### Change Token Expiration

In Supabase Dashboard:
1. Go to **Authentication > Settings**
2. Look for **Token Expiry** settings
3. Adjust the recovery token lifetime

### Customize Email Template

1. Go to Supabase Dashboard
2. Navigate to **Authentication > Email Templates**
3. Select **Reset Password**
4. Customize the HTML/CSS as needed

### Add Additional Validation

You can add more password rules in the reset password server actions:

```typescript
// Example: Require uppercase, lowercase, and number
const hasUppercase = /[A-Z]/.test(password)
const hasLowercase = /[a-z]/.test(password)
const hasNumber = /[0-9]/.test(password)

if (!hasUppercase || !hasLowercase || !hasNumber) {
  redirect("/auth/reset-password?error=Password%20must%20contain%20uppercase,%20lowercase,%20and%20number")
}
```

## 🎨 UI Customization

All pages use Tailwind CSS and match your existing design system:
- Gradient background: `from-blue-50 to-indigo-100`
- Primary color: Indigo (`indigo-600`, `indigo-700`)
- Language switcher positioned consistently
- RTL support for Arabic pages

To customize, edit the respective page files in `src/app/auth/`.

## ✅ Features

- ✅ Email-based password reset
- ✅ Secure token handling
- ✅ Arabic & English support
- ✅ Password confirmation
- ✅ User-friendly error messages
- ✅ Success notifications
- ✅ Language switcher on all pages
- ✅ Responsive design
- ✅ Consistent styling with existing auth pages

## 📝 Notes

- The system uses Supabase's built-in password reset functionality
- No additional database tables are required
- All security is handled by Supabase
- The callback route handles both normal login and password recovery flows
- Links are sent via Supabase's email service


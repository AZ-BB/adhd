import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next")

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=Missing%20code", requestUrl.origin))
  }

  // Pass through incoming cookies so Supabase can read the PKCE verifier
  const incomingCookies = req.cookies.getAll()
  
  // Create a temporary response to collect cookies
  let cookiesToSet: Array<{ name: string; value: string; options: any }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return incomingCookies
        },
        setAll(cookies) {
          cookiesToSet = cookies
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin))
  }

  // Determine redirect URL based on session type
  let redirectTo = "/dashboard"
  
  // Check if this is a password recovery session
  // In a recovery flow, we want to redirect to reset password
  // We can detect this by checking if the user just came from a recovery email
  const session = data?.session
  if (session) {
    const user = session.user
    
    // Check if this is a recovery token by inspecting the access token metadata
    // or by checking URL patterns. Supabase recovery flows typically need password update
    const isRecovery = requestUrl.searchParams.get("type") === "recovery" || 
                       requestUrl.toString().includes("type=recovery")
    
    if (isRecovery) {
      // Redirect to reset password page
      redirectTo = next?.includes("/en") ? "/auth/reset-password/en" : "/auth/reset-password"
    } else {
      // Check if user has a profile in the users table
      // This is important for Google OAuth users who might not have completed their profile
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", user.id)
        .maybeSingle()

      // If user doesn't have a profile, redirect to complete profile
      // This happens when users sign up with Google OAuth
      if (!userProfile && !profileError) {
        // Check if there's a pending profile from the signup form
        const pendingProfileCookie = incomingCookies.find(c => c.name === "pending_profile")
        
        if (pendingProfileCookie) {
          // Try to create profile from pending data
          try {
            const pendingProfile = JSON.parse(pendingProfileCookie.value)
            const { error: insertError } = await supabase
              .from("users")
              .insert({
                auth_id: user.id,
                child_first_name: pendingProfile.child_first_name || "غير محدد",
                child_last_name: pendingProfile.child_last_name || "غير محدد",
                child_birthday: pendingProfile.child_birthday || new Date().toISOString().split('T')[0],
                child_gender: pendingProfile.child_gender || "Male",
                parent_first_name: pendingProfile.parent_first_name || user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || "",
                parent_last_name: pendingProfile.parent_last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || "",
                parent_phone: pendingProfile.parent_phone || "",
                parent_nationality: pendingProfile.parent_nationality || "",
                initial_quiz_score: pendingProfile.initial_quiz_score || 0,
                inattention_score: pendingProfile.inattention_score || 0,
                hyperactivity_score: pendingProfile.hyperactivity_score || 0,
                impulsivity_score: pendingProfile.impulsivity_score || 0,
              })

            if (insertError) {
              console.error("Error creating user profile:", insertError)
              // Redirect to profile completion page
              redirectTo = "/auth/complete-profile"
            }
          } catch (parseError) {
            console.error("Error parsing pending profile:", parseError)
            redirectTo = "/auth/complete-profile"
          }
        } else {
          // No pending profile, redirect to complete profile page
          // Check if we should redirect to English version
          const isEnglish = next?.includes("/en") || requestUrl.pathname.includes("/en")
          redirectTo = isEnglish ? "/auth/complete-profile/en" : "/auth/complete-profile"
        }
      } else if (next) {
        redirectTo = next
      } else {
        // Check user role and redirect accordingly
        if (userProfile) {
          const { data: userData } = await supabase
            .from("users")
            .select("role")
            .eq("auth_id", user.id)
            .maybeSingle()

          if (userData?.role === "admin" || userData?.role === "super_admin") {
            redirectTo = "/admin"
          }
        }
      }
    }
  }

  const res = NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
  
  // Set all cookies from Supabase
  cookiesToSet.forEach(({ name, value, options }) => {
    res.cookies.set(name, value, options)
  })

  // Optional: clear pending signup profile cookie
  try {
    res.cookies.delete("pending_profile")
  } catch {}

  return res
}



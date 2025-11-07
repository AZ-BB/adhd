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
    // Check if this is a recovery token by inspecting the access token metadata
    // or by checking URL patterns. Supabase recovery flows typically need password update
    const isRecovery = requestUrl.searchParams.get("type") === "recovery" || 
                       requestUrl.toString().includes("type=recovery")
    
    if (isRecovery) {
      // Redirect to reset password page
      redirectTo = next?.includes("/en") ? "/auth/reset-password/en" : "/auth/reset-password"
    } else if (next) {
      redirectTo = next
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



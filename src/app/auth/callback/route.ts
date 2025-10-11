import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url)
  const code = requestUrl.searchParams.get("code")
  const redirectTo = requestUrl.searchParams.get("next") || "/dashboard"

  const res = NextResponse.redirect(new URL(redirectTo, requestUrl.origin))

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=Missing%20code", requestUrl.origin))
  }

  // Pass through incoming cookies so Supabase can read the PKCE verifier
  const incomingCookies = req.cookies.getAll()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return incomingCookies
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin))
  }

  // Optional: clear pending signup profile cookie
  try {
    res.cookies.delete("pending_profile")
  } catch {}

  return res
}



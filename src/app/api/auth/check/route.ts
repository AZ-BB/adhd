import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/server'

export const runtime = 'nodejs'

/**
 * GET /api/auth/check
 * Check if user is authenticated
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    return NextResponse.json({
      authenticated: !!user,
      userId: user?.id || null,
    })
  } catch (error) {
    return NextResponse.json({
      authenticated: false,
      userId: null,
    })
  }
}

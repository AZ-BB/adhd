import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/server'

export const runtime = 'nodejs'

/**
 * GET /api/payments/session-details?session_id=cs_xxx
 * Returns subscription_type for a Stripe checkout session (for result page messaging).
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id')
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .maybeSingle()
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: rows } = await supabase
      .from('payments')
      .select('id, subscription_type, metadata')
      .eq('user_id', userProfile.id)

    const match = (rows || []).find(
      (r: { metadata?: { stripe_checkout_session_id?: string } }) =>
        r.metadata?.stripe_checkout_session_id === sessionId
    )
    if (!match) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    return NextResponse.json({ subscription_type: match.subscription_type })
  } catch (error) {
    console.error('Session details error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get session details' },
      { status: 500 }
    )
  }
}

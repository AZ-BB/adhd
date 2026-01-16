import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/server'
import { getPaymobIframeUrl } from '@/lib/paymob'

export const runtime = 'nodejs'

/**
 * GET /api/payments/[paymentId]/iframe
 * Get the iframe URL for an existing payment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId: paymentIdParam } = await params
    const paymentId = parseInt(paymentIdParam)

    if (!paymentId || isNaN(paymentId)) {
      return NextResponse.json(
        { error: 'Invalid payment ID' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .maybeSingle()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, metadata, paymob_order_id')
      .eq('id', paymentId)
      .eq('user_id', userProfile.id)
      .maybeSingle()

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Get payment token from metadata
    const paymentToken = payment.metadata?.payment_token

    if (!paymentToken) {
      return NextResponse.json(
        { error: 'Payment token not found' },
        { status: 404 }
      )
    }

    // Generate iframe URL
    const iframeUrl = getPaymobIframeUrl(paymentToken)

    return NextResponse.json({
      success: true,
      iframeUrl,
      paymentId: payment.id,
    })
  } catch (error: any) {
    console.error('Error fetching payment iframe:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment iframe' },
      { status: 500 }
    )
  }
}

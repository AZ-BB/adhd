import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/server'

export const runtime = 'nodejs'

/**
 * GET /api/payments/[paymentId]/iframe
 * Get checkout URL (Stripe) or iframe URL (legacy Paymob) for an existing payment
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
      .select('id, metadata')
      .eq('id', paymentId)
      .eq('user_id', userProfile.id)
      .maybeSingle()

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Stripe: return checkout URL from metadata
    const checkoutUrl = payment.metadata?.stripe_checkout_url
    if (checkoutUrl) {
      return NextResponse.json({
        success: true,
        checkoutUrl,
        paymentId: payment.id,
      })
    }

    // Legacy Paymob: return iframe URL from payment token
    const paymentToken = payment.metadata?.payment_token
    if (paymentToken) {
      const { getPaymobIframeUrl } = await import('@/lib/paymob')
      const iframeUrl = getPaymobIframeUrl(paymentToken)
      return NextResponse.json({
        success: true,
        iframeUrl,
        paymentId: payment.id,
      })
    }

    return NextResponse.json(
      { error: 'Payment URL not found' },
      { status: 404 }
    )
  } catch (error: any) {
    console.error('Error fetching payment iframe:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment iframe' },
      { status: 500 }
    )
  }
}

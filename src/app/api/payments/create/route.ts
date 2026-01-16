import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/server'
import { createPaymentIntent } from '@/lib/paymob'
import { createSupabaseAdminServerClient } from '@/lib/server'

export const runtime = 'nodejs'

/**
 * POST /api/payments/create
 * Create a payment intent with Paymob
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { packageId, subscriptionType, amount, currency } = body

    // Validate input
    if (!packageId || !subscriptionType || !amount || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields: packageId, subscriptionType, amount, currency' },
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
      .select('*')
      .eq('auth_id', user.id)
      .maybeSingle()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Create payment record in database
    const adminSupabase = await createSupabaseAdminServerClient()
    const { data: payment, error: paymentError } = await adminSupabase
      .from('payments')
      .insert({
        user_id: userProfile.id,
        amount: parseFloat(amount),
        currency: currency.toUpperCase(),
        status: 'pending',
        subscription_type: subscriptionType,
        package_id: packageId,
        metadata: {
          package_id: packageId,
          subscription_type: subscriptionType,
        },
      })
      .select()
      .single()

    if (paymentError || !payment) {
      console.error('Payment creation error:', paymentError)
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      )
    }

    // Generate merchant order ID
    const merchantOrderId = `ORDER-${payment.id}-${Date.now()}`

    // Prepare billing data
    const billingData = {
      first_name: userProfile.parent_first_name || userProfile.child_first_name || 'User',
      last_name: userProfile.parent_last_name || userProfile.child_last_name || 'Name',
      email: user.email || '',
      phone_number: userProfile.parent_phone || '0000000000',
      country: 'EG', // Default to Egypt, can be made dynamic
      city: 'Cairo',
    }

    // Create payment intent with Paymob
    const baseUrl = request.nextUrl.origin
    const paymentIntent = await createPaymentIntent({
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      integration_id: parseInt(process.env.PAYMOB_INTEGRATION_ID!),
      order_id: merchantOrderId,
      billing_data: billingData,
      metadata: {
        payment_id: payment.id,
        user_id: userProfile.id,
        package_id: packageId,
        subscription_type: subscriptionType,
      },
    }, baseUrl)

    // Update payment record with Paymob order ID
    await adminSupabase
      .from('payments')
      .update({
        paymob_order_id: paymentIntent.orderId.toString(),
        metadata: {
          ...payment.metadata,
          paymob_order_id: paymentIntent.orderId,
          payment_token: paymentIntent.paymentToken,
        },
      })
      .eq('id', payment.id)

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      iframeUrl: paymentIntent.iframeUrl,
      paymentToken: paymentIntent.paymentToken,
      orderId: paymentIntent.orderId,
    })
  } catch (error: any) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminServerClient } from '@/lib/server'
import { verifyPaymobHMAC } from '@/lib/paymob'

export const runtime = 'nodejs'

/**
 * POST /api/payments/webhook
 * Handle Paymob webhook callbacks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const hmac = request.headers.get('x-hmac') || request.headers.get('hmac')

    // Verify HMAC signature
    if (hmac && !verifyPaymobHMAC(body, hmac)) {
      console.error('Invalid HMAC signature')
      return NextResponse.json(
        { error: 'Invalid HMAC signature' },
        { status: 403 }
      )
    }

    // Extract transaction data
    const {
      obj: {
        id: transactionId,
        order: { id: orderId },
        success,
        amount_cents,
        currency,
        pending,
        is_refunded,
        is_voided,
        is_void,
        is_capture,
        is_standalone_refund,
        created_at,
        data: transactionData,
      } = {},
    } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing order ID' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseAdminServerClient()

    // Find payment by Paymob order ID
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('paymob_order_id', orderId.toString())
      .maybeSingle()

    if (paymentError || !payment) {
      console.error('Payment not found:', paymentError)
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Determine payment status
    let status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded' = 'pending'

    if (is_refunded || is_standalone_refund) {
      status = 'refunded'
    } else if (is_voided || is_void) {
      status = 'cancelled'
    } else if (success && !pending) {
      status = 'success'
    } else if (pending) {
      status = 'processing'
    } else {
      status = 'failed'
    }

    // Update payment record
    const updateData: any = {
      status,
      paymob_transaction_id: transactionId?.toString(),
      paymob_response: body,
      updated_at: new Date().toISOString(),
    }

    if (status === 'success') {
      // Safely handle timestamp conversion
      if (created_at && typeof created_at === 'number' && created_at > 0) {
        try {
          updateData.paid_at = new Date(created_at * 1000).toISOString() // Paymob returns Unix timestamp
        } catch (error) {
          console.error('Error converting timestamp:', error, 'created_at:', created_at)
          // Fallback to current time if timestamp is invalid
          updateData.paid_at = new Date().toISOString()
        }
      } else {
        // If no valid timestamp, use current time
        updateData.paid_at = new Date().toISOString()
      }
    }

    if (transactionData?.message) {
      updateData.error_message = transactionData.message
    }

    const { error: updateError } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', payment.id)

    if (updateError) {
      console.error('Payment update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update payment' },
        { status: 500 }
      )
    }

    // If payment is successful, create or update subscription
    if (status === 'success') {
      await handleSuccessfulPayment(supabase, payment)
    }

    return NextResponse.json({ success: true, status })
  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

/**
 * Handle successful payment by creating/updating subscription
 * Note: Individual sessions are one-time purchases and do NOT create subscriptions
 */
async function handleSuccessfulPayment(supabase: any, payment: any) {
  try {
    // Individual sessions are one-time purchases - no subscription needed
    if (payment.subscription_type === 'individual_session') {
      // Just record the payment, no subscription creation
      // The payment record itself serves as proof of purchase
      return
    }

    // Only create subscriptions for monthly plans (games, group_sessions)
    if (payment.subscription_type !== 'games' && payment.subscription_type !== 'group_sessions') {
      return
    }

    const startDate = new Date()
    const endDate = new Date()

    // Monthly subscription - add 1 month
    endDate.setMonth(endDate.getMonth() + 1)

    const now = new Date().toISOString()

    // IMPORTANT: Expire ALL other active subscriptions (all types)
    // This ensures only ONE subscription is active at a time per user
    const { data: otherActiveSubs } = await supabase
      .from('subscriptions')
      .select('id, subscription_type')
      .eq('user_id', payment.user_id)
      .eq('status', 'active')

    if (otherActiveSubs && otherActiveSubs.length > 0) {
      console.log(`Found ${otherActiveSubs.length} other active subscription(s), expiring ALL of them`)
      const { error: expireError } = await supabase
        .from('subscriptions')
        .update({ status: 'expired', updated_at: now })
        .eq('user_id', payment.user_id)
        .eq('status', 'active')
      
      if (expireError) {
        console.error('Error expiring other subscriptions in webhook:', expireError)
      } else {
        console.log(`Successfully expired ${otherActiveSubs.length} other subscription(s)`)
      }
    }

    // Check if active subscription exists
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', payment.user_id)
      .eq('subscription_type', payment.subscription_type)
      .eq('package_id', payment.package_id)
      .eq('status', 'active')
      .maybeSingle()

    if (existingSubscription) {
      // Extend existing subscription
      await supabase
        .from('subscriptions')
        .update({
          end_date: endDate.toISOString(),
          payment_id: payment.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSubscription.id)
    } else {
      // Create new subscription
      await supabase
        .from('subscriptions')
        .insert({
          user_id: payment.user_id,
          payment_id: payment.id,
          subscription_type: payment.subscription_type,
          package_id: payment.package_id,
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          amount: payment.amount,
          currency: payment.currency,
        })
    }
  } catch (error) {
    console.error('Subscription creation error:', error)
    // Don't fail the webhook if subscription creation fails
  }
}

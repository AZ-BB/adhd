import { NextRequest, NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import { createSupabaseAdminServerClient } from '@/lib/server'

export const runtime = 'nodejs'

/**
 * Handle successful payment by creating/updating subscription
 * Note: Individual sessions are one-time purchases and do NOT create subscriptions
 */
async function handleSuccessfulPayment(supabase: any, payment: any) {
  try {
    console.log('Handling successful payment:', {
      payment_id: payment.id,
      user_id: payment.user_id,
      subscription_type: payment.subscription_type,
      package_id: payment.package_id,
    })

    // Individual sessions are one-time purchases - no subscription needed
    if (payment.subscription_type === 'individual_session') {
      console.log('Individual session - skipping subscription creation')
      return { success: true, message: 'Individual session - no subscription needed' }
    }

    // Only create subscriptions for monthly plans (games, group_sessions)
    if (payment.subscription_type !== 'games' && payment.subscription_type !== 'group_sessions') {
      console.log('Invalid subscription type:', payment.subscription_type)
      return { success: false, message: 'Invalid subscription type' }
    }

    const startDate = new Date()
    const endDate = new Date()

    // Monthly subscription - add 1 month
    endDate.setMonth(endDate.getMonth() + 1)

    // Check if active subscription exists
    const { data: existingSubscription, error: checkError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', payment.user_id)
      .eq('subscription_type', payment.subscription_type)
      .eq('package_id', payment.package_id)
      .eq('status', 'active')
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing subscription:', checkError)
      throw checkError
    }

    if (existingSubscription) {
      // Extend existing subscription
      console.log('Extending existing subscription:', existingSubscription.id)
      const { data: updated, error: updateError } = await supabase
        .from('subscriptions')
        .update({
          end_date: endDate.toISOString(),
          payment_id: payment.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSubscription.id)
        .select()

      if (updateError) {
        console.error('Error updating subscription:', updateError)
        throw updateError
      }

      console.log('Subscription extended successfully:', updated)
      return { success: true, message: 'Subscription extended', subscription: updated }
    } else {
      // Create new subscription
      console.log('Creating new subscription')
      const { data: newSubscription, error: insertError } = await supabase
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
        .select()
        .single()

      if (insertError) {
        console.error('Error creating subscription:', insertError)
        throw insertError
      }

      console.log('Subscription created successfully:', newSubscription)
      return { success: true, message: 'Subscription created', subscription: newSubscription }
    }
  } catch (error: any) {
    console.error('Subscription creation error:', error)
    return { success: false, error: error.message || 'Unknown error' }
  }
}

/**
 * GET /api/payments/callback
 * Handle Paymob payment redirect callback
 * Since webhooks aren't available, we process payment and create subscription here
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const success = searchParams.get('success')
    const orderId = searchParams.get('order')
    const transactionId = searchParams.get('id')

    // If payment was successful, update payment status and create subscription
    if (success === 'true' && orderId) {
      try {
        const supabase = await createSupabaseAdminServerClient()
        
        // Find payment by order ID
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .select('*')
          .eq('paymob_order_id', orderId)
          .maybeSingle()

        if (paymentError) {
          console.error('Error finding payment:', paymentError)
        } else if (payment) {
          // Only process if payment is still pending or processing
          if (payment.status === 'pending' || payment.status === 'processing') {
            // Update payment status to success
            const { error: updateError } = await supabase
              .from('payments')
              .update({
                status: 'success',
                paymob_transaction_id: transactionId?.toString() || null,
                paid_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', payment.id)

            if (updateError) {
              console.error('Error updating payment status:', updateError)
            } else {
              console.log('Payment status updated to success:', payment.id)
              
              // Create or update subscription
              const subscriptionResult = await handleSuccessfulPayment(supabase, {
                ...payment,
                status: 'success', // Use updated status
              })
              console.log('Subscription creation result:', subscriptionResult)
            }
          } else if (payment.status === 'success') {
            // Payment already processed, just ensure subscription exists
            const { data: existingSubscription } = await supabase
              .from('subscriptions')
              .select('id')
              .eq('payment_id', payment.id)
              .maybeSingle()

            if (!existingSubscription && payment.subscription_type !== 'individual_session') {
              // Subscription might not exist, create it
              console.log('Payment already successful but no subscription found, creating...')
              await handleSuccessfulPayment(supabase, payment)
            }
          }
        }
      } catch (error) {
        // Don't fail the redirect if this fails, but log it
        console.error('Error processing payment in callback:', error)
      }
    }

    // Build redirect URL
    const baseUrl = request.nextUrl.origin
    let redirectUrl = `${baseUrl}/payment/result`

    // Add query parameters
    const params = new URLSearchParams()
    if (success === 'true') {
      params.set('status', 'success')
    } else {
      params.set('status', 'failed')
    }
    if (orderId) {
      params.set('orderId', orderId)
    }
    if (transactionId) {
      params.set('transactionId', transactionId)
    }

    redirectUrl += `?${params.toString()}`

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Callback processing error:', error)
    return NextResponse.redirect(`${request.nextUrl.origin}/payment/result?status=error`)
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminServerClient } from '@/lib/server'
import { revalidatePath } from 'next/cache'
import { handleSuccessfulPayment, fulfillSoloSessionPayment } from '@/lib/payment-success'

export const runtime = 'nodejs'

// (handleSuccessfulPayment and fulfillSoloSessionPayment are imported from @/lib/payment-success)

/**
 * GET /api/payments/callback
 * Handle Paymob payment redirect callback (legacy). Stripe uses success_url + webhook.
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
              
              // Create or update subscription (or handle individual session payment)
              const subscriptionResult = await handleSuccessfulPayment(supabase, {
                ...payment,
                status: 'success', // Use updated status
              })
              console.log('Subscription creation result:', subscriptionResult)

              await fulfillSoloSessionPayment(supabase, { ...payment, status: 'success' })
              revalidatePath('/solo-sessions')
              revalidatePath('/solo-sessions/en')
              revalidatePath('/sessions')
              revalidatePath('/sessions/en')
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
            
            await fulfillSoloSessionPayment(supabase, payment)
            revalidatePath('/solo-sessions')
            revalidatePath('/solo-sessions/en')
            revalidatePath('/sessions')
            revalidatePath('/sessions/en')
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
      
      // Add subscription type for result page to show appropriate message
      if (orderId) {
        try {
          const supabaseForRedirect = await createSupabaseAdminServerClient()
          const { data: payment } = await supabaseForRedirect
            .from('payments')
            .select('subscription_type')
            .eq('paymob_order_id', orderId)
            .maybeSingle()
          
          if (payment?.subscription_type) {
            params.set('subscriptionType', payment.subscription_type)
          }
        } catch (error) {
          console.error('Error fetching payment type for redirect:', error)
        }
      }
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

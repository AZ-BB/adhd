import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { createSupabaseAdminServerClient } from '@/lib/server'
import { getStripe } from '@/lib/stripe'
import { handleSuccessfulPayment, fulfillSoloSessionPayment } from '@/lib/payment-success'

export const runtime = 'nodejs'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

/**
 * POST /api/payments/stripe-webhook
 * Handle Stripe webhook events (checkout.session.completed, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')
    if (!sig || !webhookSecret) {
      return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
    }

    let event: Stripe.Event
    try {
      event = getStripe().webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid signature'
      console.error('Stripe webhook signature verification failed:', message)
      return NextResponse.json({ error: message }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const paymentId = session.client_reference_id
      if (!paymentId) {
        console.error('Stripe webhook: no client_reference_id')
        return NextResponse.json({ error: 'Missing client_reference_id' }, { status: 400 })
      }

      const supabase = await createSupabaseAdminServerClient()

      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', parseInt(paymentId, 10))
        .maybeSingle()

      if (paymentError || !payment) {
        console.error('Stripe webhook: payment not found', paymentId, paymentError)
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
      }

      if (payment.status !== 'pending' && payment.status !== 'processing') {
        return NextResponse.json({ received: true })
      }

      const paidAt = new Date().toISOString()
      const updatePayload: Record<string, unknown> = {
        status: 'success',
        paid_at: paidAt,
        updated_at: paidAt,
        stripe_checkout_session_id: session.id,
      }

      await supabase.from('payments').update(updatePayload).eq('id', payment.id)

      await handleSuccessfulPayment(supabase, { ...payment, status: 'success' })
      await fulfillSoloSessionPayment(supabase, { ...payment, status: 'success' })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

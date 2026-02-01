/**
 * Stripe API Integration
 * Uses Stripe Checkout for payment collection.
 */

import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(key)
  }
  return _stripe
}

export interface CreateCheckoutSessionParams {
  paymentId: number
  amount: number // in currency units (e.g. 29.99 for USD)
  currency: string // USD, EGP, etc.
  customerEmail: string
  successUrl: string
  cancelUrl: string
  metadata: {
    subscription_type: string
    user_id: number
    [key: string]: unknown
  }
  lineItemLabel: string
  lineItemDescription?: string
}

/**
 * Create a Stripe Checkout Session for one-time payment.
 * Returns the session URL to redirect the customer.
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<{ sessionId: string; url: string }> {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: params.currency.toLowerCase(),
          unit_amount: Math.round(params.amount * 100), // Stripe uses cents/smallest unit
          product_data: {
            name: params.lineItemLabel,
            description: params.lineItemDescription ?? undefined,
          },
        },
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    client_reference_id: String(params.paymentId),
    metadata: {
      payment_id: String(params.paymentId),
      user_id: String(params.metadata.user_id),
      subscription_type: params.metadata.subscription_type,
      ...(params.metadata.solo_session_request_id != null && {
        solo_session_request_id: String(params.metadata.solo_session_request_id),
      }),
      ...(params.metadata.package_id != null && {
        package_id: String(params.metadata.package_id),
      }),
    },
  })

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL')
  }

  return { sessionId: session.id, url: session.url }
}

/**
 * Retrieve a Checkout Session by ID (e.g. for verifying on success page).
 */
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    })
    return session
  } catch {
    return null
  }
}

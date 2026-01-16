/**
 * Paymob API Integration Utilities
 */

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY!
const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET!
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID!
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID!

const PAYMOB_BASE_URL = process.env.PAYMOB_BASE_URL || 'https://accept.paymob.com/api'

export interface PaymentIntent {
  amount: number
  currency: string
  integration_id: number
  order_id: string
  billing_data: {
    apartment?: string
    email: string
    floor?: string
    first_name: string
    street?: string
    building?: string
    phone_number: string
    shipping_method?: string
    postal_code?: string
    city?: string
    country?: string
    last_name: string
    state?: string
  }
  shipping_data?: {
    apartment?: string
    email: string
    floor?: string
    first_name: string
    street?: string
    building?: string
    phone_number: string
    postal_code?: string
    city?: string
    country?: string
    last_name: string
    state?: string
  }
  metadata?: Record<string, any>
}

export interface PaymobAuthResponse {
  token: string
}

export interface PaymobOrderResponse {
  id: number
  delivery_needed: boolean
  amount_cents: number
  currency: string
  merchant_order_id: string
}

export interface PaymobPaymentKeyResponse {
  token: string
}

/**
 * Step 1: Authenticate with Paymob and get auth token
 */
export async function authenticatePaymob(): Promise<string> {
  try {
    const response = await fetch(`${PAYMOB_BASE_URL}/auth/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: PAYMOB_API_KEY,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Paymob authentication failed: ${error}`)
    }

    const data: PaymobAuthResponse = await response.json()
    return data.token
  } catch (error) {
    console.error('Paymob authentication error:', error)
    throw error
  }
}

/**
 * Step 2: Create an order in Paymob
 */
export async function createPaymobOrder(
  authToken: string,
  amount: number,
  currency: string,
  merchantOrderId: string
): Promise<PaymobOrderResponse> {
  try {
    const response = await fetch(`${PAYMOB_BASE_URL}/ecommerce/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        delivery_needed: false,
        amount_cents: Math.round(amount * 100), // Convert to cents
        currency,
        merchant_order_id: merchantOrderId,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Paymob order creation failed: ${error}`)
    }

    const data: PaymobOrderResponse = await response.json()
    return data
  } catch (error) {
    console.error('Paymob order creation error:', error)
    throw error
  }
}

/**
 * Step 3: Create payment key for checkout
 */
export async function createPaymentKey(
  authToken: string,
  orderId: number,
  intent: PaymentIntent,
  callbackUrl?: string
): Promise<string> {
  try {
    const payload: any = {
      amount_cents: Math.round(intent.amount * 100),
      expiration: 3600, // 1 hour
      order_id: orderId,
      billing_data: intent.billing_data,
      currency: intent.currency,
      integration_id: intent.integration_id,
      lock_order_when_paid: false,
      metadata: intent.metadata || {},
    }

    // Add callback URL if provided
    if (callbackUrl) {
      payload.redirect_url = callbackUrl
    }

    const response = await fetch(`${PAYMOB_BASE_URL}/acceptance/payment_keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Payment key creation failed: ${error}`)
    }

    const data: PaymobPaymentKeyResponse = await response.json()
    return data.token
  } catch (error) {
    console.error('Payment key creation error:', error)
    throw error
  }
}

/**
 * Verify HMAC signature from Paymob webhook
 */
export function verifyPaymobHMAC(payload: any, receivedHMAC: string): boolean {
  try {
    const crypto = require('crypto')
    const orderedKeys = Object.keys(payload).sort()
    const concatenatedString = orderedKeys
      .map((key) => `${key}=${payload[key]}`)
      .join('&')
    
    const calculatedHMAC = crypto
      .createHmac('sha512', PAYMOB_HMAC_SECRET)
      .update(concatenatedString)
      .digest('hex')
    
    return calculatedHMAC === receivedHMAC
  } catch (error) {
    console.error('HMAC verification error:', error)
    return false
  }
}

/**
 * Get Paymob iframe URL
 */
export function getPaymobIframeUrl(paymentToken: string): string {
  return `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`
}

/**
 * Complete payment flow: authenticate, create order, create payment key
 */
export async function createPaymentIntent(
  intent: PaymentIntent,
  baseUrl?: string
): Promise<{
  paymentToken: string
  iframeUrl: string
  orderId: number
}> {
  // Step 1: Authenticate
  const authToken = await authenticatePaymob()

  // Step 2: Create order
  const order = await createPaymobOrder(
    authToken,
    intent.amount,
    intent.currency,
    intent.order_id
  )

  // Step 3: Create payment key with callback URL
  const callbackUrl = baseUrl ? `${baseUrl}/api/payments/callback` : undefined
  const paymentToken = await createPaymentKey(authToken, order.id, {
    ...intent,
    integration_id: parseInt(PAYMOB_INTEGRATION_ID),
  }, callbackUrl)

  // Step 4: Generate iframe URL
  const iframeUrl = getPaymobIframeUrl(paymentToken)

  return {
    paymentToken,
    iframeUrl,
    orderId: order.id,
  }
}

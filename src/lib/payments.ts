'use server'

import { createSupabaseServerClient } from '@/lib/server'
import { createSupabaseAdminServerClient } from '@/lib/server'
import { createPaymentIntent } from '@/lib/paymob'

export interface CreatePaymentParams {
  packageId?: number | null
  subscriptionType: string
  amount: number
  currency: string
  soloSessionRequestId?: number
  baseUrl?: string
}

// Paymob only supports EGP, so we convert other currencies to EGP
// Conversion rate: 1 AED = 12.86 EGP
const AED_TO_EGP_RATE = 12.86

export async function createPayment(params: CreatePaymentParams) {
  let { packageId, subscriptionType, amount, currency, soloSessionRequestId, baseUrl } = params
  
  // Paymob only supports EGP, convert if needed
  const originalCurrency = currency.toUpperCase()
  const originalAmount = amount
  
  if (currency.toUpperCase() === 'AED') {
    // Convert AED to EGP (approximate rate: 1 AED = 4 EGP)
    amount = amount * AED_TO_EGP_RATE
    currency = 'EGP'
  } else if (currency.toUpperCase() !== 'EGP') {
    // If currency is not EGP or AED, default to EGP (Paymob requirement)
    currency = 'EGP'
  } else {
    currency = 'EGP'
  }

  // Validate input
  if (subscriptionType === 'individual_session') {
    if (!soloSessionRequestId || !subscriptionType || !amount || !currency) {
      throw new Error('Missing required fields: soloSessionRequestId, subscriptionType, amount, currency')
    }
  } else {
    if (!packageId || !subscriptionType || !amount || !currency) {
      throw new Error('Missing required fields: packageId, subscriptionType, amount, currency')
    }
  }

  // Get authenticated user
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Get user profile
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .maybeSingle()

  if (profileError || !userProfile) {
    throw new Error('User profile not found')
  }

  // Create payment record in database
  const adminSupabase = await createSupabaseAdminServerClient()
  const paymentData: any = {
    user_id: userProfile.id,
    amount: parseFloat(amount.toString()),
    currency: currency.toUpperCase(), // Store EGP (Paymob requirement)
    status: 'pending',
    subscription_type: subscriptionType,
    package_id: subscriptionType === 'individual_session' ? null : packageId,
    metadata: {
      subscription_type: subscriptionType,
      original_currency: originalCurrency, // Store original currency for reference
      original_amount: originalAmount, // Store original amount before conversion
    },
  }

  // Add solo session request ID to metadata if this is for an individual session
  if (subscriptionType === 'individual_session' && soloSessionRequestId) {
    paymentData.metadata.solo_session_request_id = soloSessionRequestId
  } else if (packageId) {
    paymentData.metadata.package_id = packageId
  }

  const { data: payment, error: paymentError } = await adminSupabase
    .from('payments')
    .insert(paymentData)
    .select()
    .single()

  if (paymentError || !payment) {
    console.error('Payment creation error:', paymentError)
    throw new Error('Failed to create payment record')
  }

  // Generate merchant order ID
  const merchantOrderId = `ORDER-${payment.id}-${Date.now()}`

  // Prepare billing data (Paymob requires all fields)
  const billingData = {
    first_name: userProfile.parent_first_name || userProfile.child_first_name || 'User',
    last_name: userProfile.parent_last_name || userProfile.child_last_name || 'Name',
    email: user.email || '',
    phone_number: userProfile.parent_phone || '0000000000',
    country: 'EG', // Default to Egypt, can be made dynamic
    city: 'Cairo',
    street: 'N/A', // Required by Paymob
    building: 'N/A', // Required by Paymob
    floor: 'N/A', // Required by Paymob
    apartment: 'N/A', // Required by Paymob
  }

  // Create payment intent with Paymob
  const paymentIntent = await createPaymentIntent({
    amount: parseFloat(amount.toString()),
    currency: currency.toUpperCase(),
    integration_id: parseInt(process.env.PAYMOB_INTEGRATION_ID!),
    order_id: merchantOrderId,
    billing_data: billingData,
    metadata: {
      payment_id: payment.id,
      user_id: userProfile.id,
      subscription_type: subscriptionType,
      ...(subscriptionType === 'individual_session' && soloSessionRequestId 
        ? { solo_session_request_id: soloSessionRequestId }
        : { package_id: packageId }),
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

  return {
    success: true,
    paymentId: payment.id,
    iframeUrl: paymentIntent.iframeUrl,
    paymentToken: paymentIntent.paymentToken,
    orderId: paymentIntent.orderId,
  }
}

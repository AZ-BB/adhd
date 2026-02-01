'use server'

import { createSupabaseServerClient } from '@/lib/server'
import { createSupabaseAdminServerClient } from '@/lib/server'
import { createCheckoutSession } from '@/lib/stripe'

export interface CreatePaymentParams {
  packageId?: number | null
  subscriptionType: string
  amount: number
  currency: string
  /** Legacy: link payment to existing request (then mark as paid) */
  soloSessionRequestId?: number
  /** New flow: request + pay in one step; request is created after payment from these */
  soloSessionRequestAndPay?: {
    coach_id: number | null
    preferred_time: string
    contact_phone: string
    notes?: string
  }
  baseUrl?: string
}

export async function createPayment(params: CreatePaymentParams) {
  const { packageId, subscriptionType, amount, currency, soloSessionRequestId, soloSessionRequestAndPay, baseUrl } = params

  const currencyUpper = currency.toUpperCase()

  if (subscriptionType === 'individual_session') {
    const hasLegacy = soloSessionRequestId != null
    const hasNew = soloSessionRequestAndPay && soloSessionRequestAndPay.preferred_time && soloSessionRequestAndPay.contact_phone
    if (!hasLegacy && !hasNew) {
      throw new Error('For individual session provide either soloSessionRequestId (legacy) or soloSessionRequestAndPay (preferred_time, contact_phone)')
    }
    if (!amount || !currency) throw new Error('Missing amount or currency')
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
  const paymentData: Record<string, unknown> = {
    user_id: userProfile.id,
    amount: parseFloat(amount.toString()),
    currency: currencyUpper,
    status: 'pending',
    subscription_type: subscriptionType,
    package_id: subscriptionType === 'individual_session' ? null : packageId,
    metadata: {
      subscription_type: subscriptionType,
      original_currency: currencyUpper,
      original_amount: amount,
    },
  }

  if (subscriptionType === 'individual_session') {
    if (soloSessionRequestId != null) {
      (paymentData.metadata as Record<string, unknown>).solo_session_request_id = soloSessionRequestId
    } else if (soloSessionRequestAndPay) {
      const m = paymentData.metadata as Record<string, unknown>
      m.coach_id = soloSessionRequestAndPay.coach_id
      m.preferred_time = soloSessionRequestAndPay.preferred_time
      m.contact_phone = soloSessionRequestAndPay.contact_phone
      if (soloSessionRequestAndPay.notes) m.notes = soloSessionRequestAndPay.notes
    }
  } else if (packageId != null) {
    (paymentData.metadata as Record<string, unknown>).package_id = packageId
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

  const origin = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const successUrl = `${origin}/payment/result?status=success&session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${origin}/payment/result?status=cancelled`

  const lineItemLabel =
    subscriptionType === 'individual_session'
      ? '1:1 Session - MovoKids'
      : subscriptionType === 'games'
        ? 'Games Package - MovoKids'
        : 'Group Sessions Package - MovoKids'

  const { sessionId, url: checkoutUrl } = await createCheckoutSession({
    paymentId: payment.id,
    amount: parseFloat(amount.toString()),
    currency: currencyUpper,
    customerEmail: user.email || '',
    successUrl,
    cancelUrl,
    metadata: {
      subscription_type: subscriptionType,
      user_id: userProfile.id,
      ...(subscriptionType === 'individual_session' && soloSessionRequestId != null
        ? { solo_session_request_id: soloSessionRequestId }
        : subscriptionType === 'individual_session' && soloSessionRequestAndPay
        ? {
            coach_id: soloSessionRequestAndPay.coach_id,
            preferred_time: soloSessionRequestAndPay.preferred_time,
            contact_phone: soloSessionRequestAndPay.contact_phone,
            ...(soloSessionRequestAndPay.notes ? { notes: soloSessionRequestAndPay.notes } : {}),
          }
        : {}),
      ...(packageId != null ? { package_id: packageId } : {}),
    },
    lineItemLabel,
  })

  // Store Stripe session ID and URL in payment metadata (build full metadata so we don't depend on insert return shape)
  const updatedMetadata: Record<string, unknown> = {
    subscription_type: subscriptionType,
    original_currency: currencyUpper,
    original_amount: amount,
    stripe_checkout_session_id: sessionId,
    stripe_checkout_url: checkoutUrl,
  }
  if (subscriptionType === 'individual_session') {
    if (soloSessionRequestId != null) {
      updatedMetadata.solo_session_request_id = soloSessionRequestId
    } else if (soloSessionRequestAndPay) {
      updatedMetadata.coach_id = soloSessionRequestAndPay.coach_id
      updatedMetadata.preferred_time = soloSessionRequestAndPay.preferred_time
      updatedMetadata.contact_phone = soloSessionRequestAndPay.contact_phone
      if (soloSessionRequestAndPay.notes) updatedMetadata.notes = soloSessionRequestAndPay.notes
    }
  } else if (packageId != null) {
    updatedMetadata.package_id = packageId
  }
  await adminSupabase
    .from('payments')
    .update({ metadata: updatedMetadata })
    .eq('id', payment.id)

  return {
    success: true,
    paymentId: payment.id,
    checkoutUrl,
    sessionId,
  }
}

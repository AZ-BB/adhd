/**
 * Shared logic for fulfilling a successful payment: create/update subscription
 * and optionally mark solo session request as paid.
 * Used by Paymob callback and Stripe webhook.
 */

export async function handleSuccessfulPayment(supabase: any, payment: any) {
  try {
    // Individual sessions are one-time purchases - no subscription needed
    if (payment.subscription_type === 'individual_session') {
      return { success: true, message: 'Individual session - no subscription needed' }
    }

    if (payment.subscription_type !== 'games' && payment.subscription_type !== 'group_sessions') {
      return { success: false, message: 'Invalid subscription type' }
    }

    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)
    const now = new Date().toISOString()

    // Expire any subscriptions that have passed their end_date
    await supabase
      .from('subscriptions')
      .update({ status: 'expired', updated_at: now })
      .eq('user_id', payment.user_id)
      .eq('status', 'active')
      .lt('end_date', now)

    // Expire ALL other active subscriptions (only one active per user)
    const { data: allOtherActiveSubs } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', payment.user_id)
      .eq('status', 'active')

    if (allOtherActiveSubs?.length) {
      const idsToExpire = allOtherActiveSubs.map((s: any) => s.id)
      await supabase
        .from('subscriptions')
        .update({ status: 'expired', updated_at: now })
        .in('id', idsToExpire)
    }

    const { data: existingSubscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', payment.user_id)
      .eq('subscription_type', payment.subscription_type)
      .eq('package_id', payment.package_id)
      .order('created_at', { ascending: false })

    const existingSubscription = existingSubscriptions?.find(
      (sub: any) => sub.status === 'active' && new Date(sub.end_date) >= new Date(now)
    )

    if (existingSubscription) {
      const currentEndDate = new Date(existingSubscription.end_date)
      const newEndDate = new Date(currentEndDate)
      newEndDate.setMonth(newEndDate.getMonth() + 1)
      await supabase
        .from('subscriptions')
        .update({
          end_date: newEndDate.toISOString(),
          payment_id: payment.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSubscription.id)
      return { success: true, message: 'Subscription extended' }
    }

    // Final check: no other active subscriptions
    const { data: finalCheck } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', payment.user_id)
      .eq('status', 'active')

    if (finalCheck?.length) {
      await supabase
        .from('subscriptions')
        .update({ status: 'expired', updated_at: now })
        .eq('user_id', payment.user_id)
        .eq('status', 'active')
    }

    await supabase.from('subscriptions').insert({
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

    return { success: true, message: 'Subscription created' }
  } catch (error: any) {
    console.error('Subscription creation error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * For individual_session: either create a new solo_session_request from payment metadata (new flow:
 * request + pay in one step) or mark an existing request as paid (legacy flow).
 */
export async function fulfillSoloSessionPayment(
  supabase: any,
  payment: any
): Promise<void> {
  if (payment.subscription_type !== 'individual_session') return

  // Metadata may come back as object or JSON string from DB
  const rawMeta = payment.metadata
  const meta =
    typeof rawMeta === 'string'
      ? (() => {
          try {
            return JSON.parse(rawMeta) as Record<string, unknown>
          } catch {
            return {}
          }
        })()
      : (rawMeta && typeof rawMeta === 'object' ? rawMeta : {}) as Record<string, unknown>

  // New flow: create request from payment metadata (coach_id, preferred_time, contact_phone)
  if (meta.coach_id != null || meta.preferred_time || meta.contact_phone) {
    const { data: existing } = await supabase
      .from('solo_session_requests')
      .select('id')
      .eq('payment_id', payment.id)
      .maybeSingle()
    if (existing) return // already created (idempotent for webhook retries)

    const preferredTime = meta.preferred_time
      ? new Date(String(meta.preferred_time)).toISOString()
      : new Date().toISOString()
    const duration = 38
    const { error } = await supabase.from('solo_session_requests').insert({
      user_id: payment.user_id,
      coach_id: meta.coach_id != null && meta.coach_id !== '' ? parseInt(String(meta.coach_id), 10) : null,
      preferred_time: preferredTime,
      duration_minutes: duration,
      notes: (meta.notes as string) || null,
      contact_phone: (meta.contact_phone as string) || null,
      payment_id: payment.id,
      status: 'pending',
    })
    if (error) {
      console.error('Create solo session request from payment:', error)
      throw new Error(`Failed to create solo session request: ${error.message}`)
    }
    return
  }

  // Legacy flow: mark existing request as paid
  const soloSessionRequestId = meta.solo_session_request_id
  if (!soloSessionRequestId) return

  await supabase
    .from('solo_session_requests')
    .update({
      status: 'paid',
      responded_at: new Date().toISOString(),
    })
    .eq('id', soloSessionRequestId)
    .eq('user_id', payment.user_id)
}

/** @deprecated Use fulfillSoloSessionPayment */
export async function markSoloSessionPaidIfNeeded(
  supabase: any,
  payment: any
): Promise<void> {
  return fulfillSoloSessionPayment(supabase, payment)
}

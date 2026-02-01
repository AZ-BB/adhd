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

export async function markSoloSessionPaidIfNeeded(
  supabase: any,
  payment: any
): Promise<void> {
  if (payment.subscription_type !== 'individual_session') return
  const soloSessionRequestId = payment.metadata?.solo_session_request_id
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

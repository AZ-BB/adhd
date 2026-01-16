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

    const now = new Date().toISOString()
    
    // STEP 1: Expire any subscriptions that have passed their end_date
    await supabase
      .from('subscriptions')
      .update({ status: 'expired', updated_at: now })
      .eq('user_id', payment.user_id)
      .eq('status', 'active')
      .lt('end_date', now)

    // STEP 2: CRITICAL - Expire ALL other active subscriptions (all types)
    // This ensures only ONE subscription is active at a time per user
    // IMPORTANT: Expire ALL other active subscriptions regardless of type or end_date
    console.log('Expiring ALL other active subscriptions (ensuring only one active subscription per user)')
    const { data: allOtherActiveSubs, error: otherSubsCheckError } = await supabase
      .from('subscriptions')
      .select('id, subscription_type, end_date, status')
      .eq('user_id', payment.user_id)
      .eq('status', 'active')

    if (otherSubsCheckError) {
      console.error('Error checking for other active subscriptions:', otherSubsCheckError)
    }

    if (allOtherActiveSubs && allOtherActiveSubs.length > 0) {
      console.log(`Found ${allOtherActiveSubs.length} other active subscription(s), expiring ALL of them`)
      console.log('Subscriptions to expire:', allOtherActiveSubs.map((s: any) => ({ id: s.id, type: s.subscription_type, end_date: s.end_date })))
      
      // Expire ALL other active subscriptions (all types, regardless of end_date)
      // Use .in() with the IDs to be more explicit
      const idsToExpire = allOtherActiveSubs.map((s: any) => s.id)
      const { data: expiredSubs, error: expireError } = await supabase
        .from('subscriptions')
        .update({ status: 'expired', updated_at: now })
        .in('id', idsToExpire)
        .select('id, subscription_type')

      if (expireError) {
        console.error('Error expiring other subscriptions:', expireError)
        // Try alternative method if .in() fails
        console.log('Trying alternative expiration method...')
        for (const sub of allOtherActiveSubs) {
          const { error: singleExpireError } = await supabase
            .from('subscriptions')
            .update({ status: 'expired', updated_at: now })
            .eq('id', sub.id)
          
          if (singleExpireError) {
            console.error(`Failed to expire subscription ${sub.id}:`, singleExpireError)
            throw singleExpireError
          }
        }
        console.log(`Successfully expired ${allOtherActiveSubs.length} subscription(s) using alternative method`)
      } else {
        console.log(`Successfully expired ${expiredSubs?.length || 0} other subscription(s) - new subscription will be: ${payment.subscription_type}`)
        if (expiredSubs) {
          console.log('Expired subscriptions:', expiredSubs.map((s: any) => ({ id: s.id, type: s.subscription_type })))
        }
      }
    } else {
      console.log('No other active subscriptions found to expire')
    }

    // STEP 3: Check for existing subscription of the SAME type/package (to extend or create)
    const { data: existingSubscriptions, error: checkError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', payment.user_id)
      .eq('subscription_type', payment.subscription_type)
      .eq('package_id', payment.package_id)
      .order('created_at', { ascending: false })

    if (checkError) {
      console.error('Error checking existing subscriptions:', checkError)
      throw checkError
    }

    // Find active subscription with valid end_date
    const existingSubscription = existingSubscriptions?.find(
      (sub: any) => sub.status === 'active' && new Date(sub.end_date) >= new Date(now)
    )

    // Expire any duplicate active subscriptions of the same type (shouldn't happen, but just in case)
    const duplicateActiveSubs = existingSubscriptions?.filter(
      (sub: any) => sub.status === 'active' && sub.id !== existingSubscription?.id
    )

    if (duplicateActiveSubs && duplicateActiveSubs.length > 0) {
      console.log(`Found ${duplicateActiveSubs.length} duplicate active subscriptions of same type, expiring them`)
      for (const dup of duplicateActiveSubs) {
        await supabase
          .from('subscriptions')
          .update({ status: 'expired', updated_at: now })
          .eq('id', dup.id)
      }
    }

    if (existingSubscription) {
      // Extend existing subscription
      console.log('Extending existing subscription:', existingSubscription.id)
      
      // Calculate new end date: extend from current end_date, not from now
      const currentEndDate = new Date(existingSubscription.end_date)
      const newEndDate = new Date(currentEndDate)
      newEndDate.setMonth(newEndDate.getMonth() + 1)
      
      const { data: updated, error: updateError } = await supabase
        .from('subscriptions')
        .update({
          end_date: newEndDate.toISOString(),
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
      
      // FINAL SAFETY CHECK: Double-check that no other active subscriptions exist (all types)
      const { data: finalCheck, error: finalCheckError } = await supabase
        .from('subscriptions')
        .select('id, subscription_type, status')
        .eq('user_id', payment.user_id)
        .eq('status', 'active')

      if (finalCheck && finalCheck.length > 0) {
        console.warn(`WARNING: Found ${finalCheck.length} other active subscription(s) before creating new one. Expiring ALL of them now.`)
        console.warn('Remaining active subscriptions:', finalCheck.map((s: any) => ({ id: s.id, type: s.subscription_type })))
        
        const { error: finalExpireError } = await supabase
          .from('subscriptions')
          .update({ status: 'expired', updated_at: now })
          .eq('user_id', payment.user_id)
          .eq('status', 'active')

        if (finalExpireError) {
          console.error('CRITICAL: Failed to expire other subscriptions in final check:', finalExpireError)
          throw finalExpireError // Don't create new subscription if we can't expire old ones
        } else {
          console.log('Successfully expired ALL remaining subscriptions in final check')
        }
      }
      
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
        // If unique constraint violation, try to find and update existing subscription
        if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
          console.log('Duplicate detected, finding and updating existing subscription')
          
          // Find the existing subscription that caused the conflict
          const { data: existing, error: findError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', payment.user_id)
            .eq('subscription_type', payment.subscription_type)
            .eq('package_id', payment.package_id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (findError || !existing) {
            console.error('Error finding existing subscription after duplicate:', findError)
            throw insertError // Re-throw original error
          }

          // Update the existing subscription
          const { data: updated, error: updateError } = await supabase
            .from('subscriptions')
            .update({
              end_date: endDate.toISOString(),
              payment_id: payment.id,
              status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)
            .select()
            .single()

          if (updateError) {
            console.error('Error updating subscription after duplicate:', updateError)
            throw updateError
          }

          console.log('Subscription updated after duplicate detection:', updated)
          return { success: true, message: 'Subscription updated', subscription: updated }
        }
        
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

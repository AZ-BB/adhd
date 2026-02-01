'use server'

import { createSupabaseServerClient } from "@/lib/server"
import { requireAdmin } from "@/lib/admin"
import { revalidatePath } from "next/cache"
import { SoloSessionRequest, SoloSessionRequestInput, SoloSessionResponseInput } from "@/types/solo-sessions"

async function getCurrentUserProfile() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  const { data: userProfile, error } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (error || !userProfile) throw new Error("User profile not found")
  return { supabase, user, userProfile }
}

// User: create request
export async function createSoloSessionRequest(input: SoloSessionRequestInput) {
  const { supabase, userProfile } = await getCurrentUserProfile()

  // Check if user already has an active request (pending or payment_pending)
  const { data: existingRequests, error: checkError } = await supabase
    .from('solo_session_requests')
    .select('id, status')
    .eq('user_id', userProfile.id)
    .in('status', ['pending', 'payment_pending'])

  if (checkError) throw new Error(checkError.message)

  if (existingRequests && existingRequests.length > 0) {
    const activeStatus = existingRequests[0].status
    throw new Error(
      activeStatus === 'pending'
        ? 'You already have a pending session request. Please wait for it to be processed before creating a new one.'
        : 'You already have a session request awaiting payment. Please complete the payment for your existing request before creating a new one.'
    )
  }

  // Duration is fixed at 30-45 minutes (we'll use 37.5 as default, rounded to 38 minutes)
  // Database requires integer, so we round to nearest integer
  const duration = 38

  // preferred_time is now optional - children can't request a specific time
  // Admin will set scheduled_time when approving

  const payload = {
    user_id: userProfile.id,
    coach_id: input.coach_id ?? null,
    preferred_time: input.preferred_time ?? null,
    duration_minutes: duration,
    notes: input.notes ?? null,
    status: 'pending' as const,
  }

  const { error } = await supabase
    .from('solo_session_requests')
    .insert(payload)

  if (error) throw new Error(error.message)
  // Revalidate all session-related paths
  revalidatePath('/sessions')
  revalidatePath('/sessions/en')
  revalidatePath('/solo-sessions')
  revalidatePath('/solo-sessions/en')
}

// User: list own requests
export async function getMySoloSessionRequests(): Promise<SoloSessionRequest[]> {
  const { supabase, userProfile } = await getCurrentUserProfile()

  const { data, error } = await supabase
    .from('solo_session_requests')
    .select(`
      *,
      coach:coaches(*)
    `)
    .eq('user_id', userProfile.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data as SoloSessionRequest[]
}

// Admin: list all requests with user info
export async function getAdminSoloSessionRequests(status?: 'pending' | 'payment_pending' | 'approved' | 'rejected' | 'paid') {
  const adminUser = await requireAdmin()
  const supabase = await createSupabaseServerClient()
  const isSuperAdmin = adminUser.is_super_admin

  let query = supabase
    .from('solo_session_requests')
    .select(`
      *,
      coach:coaches(*),
      user:users!solo_session_requests_user_id_fkey(
        auth_id,
        child_first_name,
        child_last_name,
        parent_first_name,
        parent_last_name,
        parent_phone
      ),
      responder:users!solo_session_requests_responded_by_user_id_fkey(
        auth_id,
        parent_first_name,
        parent_last_name
      )
    `)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)

  // Only attach emails if super admin
  let emailMap = new Map<string, string>()
  if (isSuperAdmin) {
    const { createSupabaseAdminServerClient } = await import('@/lib/server')
    const adminSupabase = await createSupabaseAdminServerClient()
    const { data: { users: authUsers }, error: authError } = await adminSupabase.auth.admin.listUsers()
    if (authError) {
      console.error("Auth list users error", authError)
    } else {
      emailMap = new Map(authUsers.map(u => [u.id, u.email || '']))
    }
  }

  return (data as SoloSessionRequest[]).map(req => ({
    ...req,
    user: req.user ? { 
      ...req.user, 
      email: isSuperAdmin ? (emailMap.get(req.user.auth_id || '') || undefined) : undefined,
      parent_phone: isSuperAdmin ? req.user.parent_phone : undefined, // Hide phone for regular admins
    } : req.user,
    responder: req.responder ? { 
      ...req.responder, 
      email: isSuperAdmin ? (emailMap.get(req.responder.auth_id || '') || undefined) : undefined 
    } : undefined
  }))
}

// Admin: respond (approve/reject)
export async function respondSoloSessionRequest(
  requestId: number,
  response: SoloSessionResponseInput
) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get current request to validate transitions
  const { data: currentReq, error: currentError } = await supabase
    .from('solo_session_requests')
    .select('status')
    .eq('id', requestId)
    .single()

  if (currentError || !currentReq) throw new Error("Request not found")

  // Only child payment can move to paid (not admin).
  if (response.status === 'paid' && currentReq.status !== 'paid') {
    throw new Error("Only the child payment can mark this as paid")
  }

  // CRITICAL: If request is already paid, preserve the paid status
  // Admin should not be able to change status from 'paid' to anything else
  // Also handle 'edit' status which means preserve current status (for paid sessions)
  let finalStatus = response.status
  if (currentReq.status === 'paid' || response.status === 'edit') {
    // Keep it as 'paid' - admin can only update other fields (scheduled_time, meeting_link, etc.)
    finalStatus = 'paid'
    console.log('Request is already paid or edit mode, preserving paid status')
  }

  // Meeting link required for payment flow or editing approved
  if ((finalStatus === 'approved' || finalStatus === 'payment_pending') && !response.meeting_link) {
    throw new Error("Meeting link is required")
  }

  const updatePayload = {
    status: finalStatus,
    meeting_link: response.meeting_link ?? null,
    admin_reason: response.admin_reason ?? null,
    scheduled_time: response.scheduled_time ?? null,
    responded_at: new Date().toISOString(),
    responded_by_user_id: user ? (await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single()).data?.id ?? null : null
  }

  const { error } = await supabase
    .from('solo_session_requests')
    .update(updatePayload)
    .eq('id', requestId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/solo-sessions')
  revalidatePath('/solo-sessions')
  revalidatePath('/solo-sessions/en')
}

// User: initiate payment for solo session request
export async function initiateSoloSessionPayment(requestId: number, isEgypt?: boolean) {
  const { supabase, userProfile } = await getCurrentUserProfile()

  // Verify request belongs to user and is payment_pending
  const { data: req, error } = await supabase
    .from('solo_session_requests')
    .select('id, status')
    .eq('id', requestId)
    .eq('user_id', userProfile.id)
    .single()

  if (error || !req) throw new Error("Request not found")
  if (req.status !== 'payment_pending') throw new Error("This request is not awaiting payment")

  // Use the location passed from client, or detect on server as fallback
  let userIsEgypt = isEgypt
  if (userIsEgypt === undefined) {
    // Fallback: detect location on server if not provided
    try {
      const locationResponse = await fetch('https://ipapi.co/json/')
      const locationData = await locationResponse.json()
      
      // Check if country is Egypt (EG)
      if (locationData.country_code === 'EG') {
        userIsEgypt = true
      } else {
        userIsEgypt = false
      }
    } catch (error) {
      // Default to international if detection fails
      console.error('Error detecting location:', error)
      userIsEgypt = false
    }
  }
  
  // Stripe supports EGP and USD
  const amount = userIsEgypt ? "200" : "12.99"
  const currency = userIsEgypt ? "EGP" : "USD"

  // Create payment directly (no HTTP request needed)
  const { createPayment } = await import('@/lib/payments')
  
  // Get base URL for callback
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  
  const data = await createPayment({
    subscriptionType: 'individual_session',
    amount: parseFloat(amount),
    currency: currency,
    soloSessionRequestId: requestId, // Link payment to solo session request
    baseUrl,
  })
  
  const displayCurrency = userIsEgypt ? 'EGP' : 'USD'
  const displayAmount = userIsEgypt ? '200' : '12.99'
  const redirectUrl = `/payment/checkout?paymentId=${data.paymentId}&soloSessionRequestId=${requestId}&subscriptionType=individual_session&amount=${displayAmount}&currency=${displayCurrency}`

  return { 
    success: true, 
    paymentId: data.paymentId, 
    checkoutUrl: data.checkoutUrl,
    redirectUrl 
  }
}



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

  // Validate preferred time: must be in the future
  const preferred = new Date(input.preferred_time)
  if (Number.isNaN(preferred.getTime())) {
    throw new Error("Invalid preferred time")
  }
  if (preferred.getTime() < Date.now()) {
    throw new Error("Preferred time must be in the future")
  }

  const duration = input.duration_minutes ?? 60

  // Prevent overlap with already approved / payment_pending / paid solo sessions for this user
  const { data: existingApproved, error: overlapError } = await supabase
    .from('solo_session_requests')
    .select('preferred_time, scheduled_time, duration_minutes')
    .eq('user_id', userProfile.id)
    .in('status', ['approved', 'payment_pending', 'paid'])

  if (overlapError) throw new Error(overlapError.message)

  const newStart = preferred.getTime()
  const newEnd = newStart + duration * 60 * 1000

  const hasOverlap = (existingApproved || []).some((req) => {
    const startStr = (req as any).scheduled_time || (req as any).preferred_time
    const dur = (req as any).duration_minutes ?? 60
    const start = new Date(startStr).getTime()
    const end = start + dur * 60 * 1000
    return newStart < end && start < newEnd
  })

  if (hasOverlap) {
    throw new Error("You already have an approved 1:1 session in that time window")
  }

  const payload = {
    user_id: userProfile.id,
    coach_id: input.coach_id ?? null,
    preferred_time: input.preferred_time,
    duration_minutes: duration,
    notes: input.notes ?? null,
    status: 'pending' as const,
  }

  const { error } = await supabase
    .from('solo_session_requests')
    .insert(payload)

  if (error) throw new Error(error.message)
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
  await requireAdmin()
  const supabase = await createSupabaseServerClient()

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

  // Attach emails via admin listUsers
  const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()
  if (authError) {
    console.error("Auth list users error", authError)
    return data as SoloSessionRequest[]
  }

  const emailMap = new Map(authUsers.map(u => [u.id, u.email]))
  return (data as SoloSessionRequest[]).map(req => ({
    ...req,
    user: req.user ? { ...req.user, email: emailMap.get(req.user.auth_id || '') || undefined } : req.user,
    responder: req.responder ? { ...req.responder, email: emailMap.get(req.responder.auth_id || '') || undefined } : undefined
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

  // Meeting link required for payment flow or editing approved
  if ((response.status === 'approved' || response.status === 'payment_pending') && !response.meeting_link) {
    throw new Error("Meeting link is required")
  }

  const updatePayload = {
    status: response.status,
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

// User: mark as paid (mock payment)
export async function paySoloSessionRequest(requestId: number) {
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

  const { error: updateError } = await supabase
    .from('solo_session_requests')
    .update({
      status: 'paid',
      responded_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (updateError) throw new Error(updateError.message)

  revalidatePath('/solo-sessions')
  revalidatePath('/solo-sessions/en')
  revalidatePath('/admin/solo-sessions')
}



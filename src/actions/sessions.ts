'use server'

import { createSupabaseServerClient } from "@/lib/server"
import { requireAdmin } from "@/lib/admin"
import { revalidatePath } from "next/cache"
import { Coach, Session, SessionWithCoach, SessionFilters } from "@/types/sessions"

// --- Coach Actions ---

export async function getCoaches() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('coaches')
    .select('*')
    .order('name')

  if (error) throw new Error(error.message)
  return data as Coach[]
}

export async function createCoach(data: Partial<Coach>) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()
  
  const { error } = await supabase
    .from('coaches')
    .insert(data)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/sessions')
}

export async function updateCoach(id: number, data: Partial<Coach>) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('coaches')
    .update(data)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/sessions')
}

export async function deleteCoach(id: number) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('coaches')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/sessions')
}

// --- Session Actions ---

export async function getSessions(filters: SessionFilters = {}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let query = supabase
    .from('sessions')
    .select(`
      *,
      coaches(*),
      enrollments:session_enrollments(count)
    `)
    .order('session_date', { ascending: true })

  if (filters.coach_id) {
    query = query.eq('coach_id', filters.coach_id)
  }

  if (!filters.include_past) {
    query = query.gte('session_date', new Date().toISOString())
  }

  if (filters.date_from) {
    query = query.gte('session_date', filters.date_from)
  }

  if (filters.date_to) {
    query = query.lte('session_date', filters.date_to)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)

  // Transform data to match SessionWithCoach interface
  const sessions = (data as any[]).map(({ coaches, enrollments, ...session }) => ({
    ...session,
    coach: coaches,
    enrollment_count: enrollments[0]?.count || 0
  })) as SessionWithCoach[]

  // If user is logged in, check enrollment status
  if (user) {
    // Get user's internal ID
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (userData) {
      const { data: userEnrollments } = await supabase
        .from('session_enrollments')
        .select('session_id')
        .eq('user_id', userData.id)
      
      const enrolledSessionIds = new Set(userEnrollments?.map(e => e.session_id))
      
      return sessions.map(s => ({
        ...s,
        is_enrolled: enrolledSessionIds.has(s.id)
      }))
    }
  }

  return sessions
}

export async function getAdminSessions() {
    await requireAdmin()
    const supabase = await createSupabaseServerClient()
  
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        coaches(*),
        enrollments:session_enrollments(count)
      `)
      .order('session_date', { ascending: false }) // Admin sees newest first (including future)
  
    if (error) throw new Error(error.message)
  
    return (data as any[]).map(({ coaches, enrollments, ...session }) => ({
      ...session,
      coach: coaches,
      enrollment_count: enrollments[0]?.count || 0
    })) as SessionWithCoach[]
  }

export async function createSession(data: Partial<Session>) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('sessions')
    .insert(data)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/sessions')
}

export async function updateSession(id: number, data: Partial<Session>) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('sessions')
    .update(data)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/sessions')
}

export async function deleteSession(id: number) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/sessions')
}

// --- Enrollment Actions ---

export async function enrollInSession(sessionId: number) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  // Get user's internal ID
  const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single()

  if (!userData) throw new Error("User profile not found")

  // Check session details (date, max participants)
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('session_date, max_participants, enrollments:session_enrollments(count)')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) throw new Error("Session not found")

  if (new Date(session.session_date) < new Date()) {
    throw new Error("Cannot enroll in past sessions")
  }

  const currentEnrollment = session.enrollments[0]?.count || 0
  if (currentEnrollment >= session.max_participants) {
    throw new Error("Session is full")
  }

  const { error } = await supabase
    .from('session_enrollments')
    .insert({
      session_id: sessionId,
      user_id: userData.id
    })

  if (error) {
      if (error.code === '23505') { // Unique violation
          throw new Error("Already enrolled")
      }
      throw new Error(error.message)
  }
  
  revalidatePath('/sessions')
}

export async function cancelEnrollment(sessionId: number) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

   // Get user's internal ID
   const { data: userData } = await supabase
   .from('users')
   .select('id')
   .eq('auth_id', user.id)
   .single()

    if (!userData) throw new Error("User profile not found")

  const { error } = await supabase
    .from('session_enrollments')
    .delete()
    .eq('session_id', sessionId)
    .eq('user_id', userData.id)

  if (error) throw new Error(error.message)
  revalidatePath('/sessions')
}

export async function getSessionEnrollments(sessionId: number) {
    const adminUser = await requireAdmin()
    const supabase = await createSupabaseServerClient()
    const isSuperAdmin = adminUser.is_super_admin

    // We need auth_id from the user record to map emails (only for super admins)
    const { data: usersData, error: usersError } = await supabase
        .from('session_enrollments')
        .select(`
            created_at,
            user:users(
                auth_id,
                child_first_name,
                child_last_name,
                child_profile_picture,
                parent_phone,
                parent_first_name,
                parent_last_name
            )
        `)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

    if (usersError) throw new Error(usersError.message)

    // Only fetch emails if super admin
    let emailMap = new Map<string, string>()
    if (isSuperAdmin) {
        const { createSupabaseAdminServerClient } = await import('@/lib/server')
        const adminSupabase = await createSupabaseAdminServerClient()
        const { data: { users: authUsers }, error: authError } = await adminSupabase.auth.admin.listUsers()
        
        if (authError) {
            console.error("Error fetching auth users:", authError)
        } else {
            emailMap = new Map(authUsers.map(u => [u.id, u.email || '']))
        }
    }

    // Combine data, conditionally including email and phone
    return usersData.map((enrollment: any) => ({
        ...enrollment,
        user: {
            ...enrollment.user,
            email: isSuperAdmin ? (emailMap.get(enrollment.user.auth_id) || 'N/A') : undefined,
            parent_phone: isSuperAdmin ? enrollment.user.parent_phone : undefined, // Hide phone for regular admins
        }
    }))
}


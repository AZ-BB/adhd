"use server"
import { createSupabaseServerClient, createSupabaseAdminServerClient } from "./server"
import { redirect } from "next/navigation"
import { isAdmin } from "./admin"

/**
 * Update expired subscriptions status to 'expired'
 * This should be called periodically (e.g., via cron job or scheduled function)
 */
export async function updateExpiredSubscriptions() {
  const supabase = await createSupabaseAdminServerClient()
  const now = new Date().toISOString()

  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "expired", updated_at: now })
    .eq("status", "active")
    .lt("end_date", now)

  if (error) {
    console.error("Error updating expired subscriptions:", error)
    return { success: false, error }
  }

  return { success: true }
}

/**
 * Check if user has an active subscription (games or group_sessions)
 * Returns true if user has at least one active subscription
 */
export async function hasActiveSubscription(): Promise<boolean> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  // Admins bypass subscription check
  if (await isAdmin()) {
    return true
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .maybeSingle()

  if (!userProfile) {
    return false
  }

  const now = new Date().toISOString()

  // Check for active subscription (games or group_sessions)
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userProfile.id)
    .in("subscription_type", ["games", "group_sessions"])
    .eq("status", "active")
    .gte("end_date", now)
    .limit(1)
    .maybeSingle()

  return !!subscription
}

/**
 * Require active subscription or redirect to pricing
 * Admins automatically bypass this check
 */
export async function requireActiveSubscription() {
  const hasSubscription = await hasActiveSubscription()
  
  if (!hasSubscription) {
    // Check if user is authenticated
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/auth/login")
    }

    // Redirect to pricing page
    redirect("/pricing")
  }
}

/**
 * Get user's active subscriptions
 */
export async function getUserActiveSubscriptions() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .maybeSingle()

  if (!userProfile) {
    return []
  }

  const now = new Date().toISOString()

  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userProfile.id)
    .in("subscription_type", ["games", "group_sessions"])
    .eq("status", "active")
    .gte("end_date", now)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching subscriptions:", error)
    return []
  }

  return subscriptions || []
}

/**
 * Check if user has specific subscription type
 */
export async function hasSubscriptionType(
  subscriptionType: 'games' | 'group_sessions'
): Promise<boolean> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  // Admins bypass subscription check
  if (await isAdmin()) {
    return true
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .maybeSingle()

  if (!userProfile) {
    return false
  }

  const now = new Date().toISOString()

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userProfile.id)
    .eq("subscription_type", subscriptionType)
    .eq("status", "active")
    .gte("end_date", now)
    .maybeSingle()

  return !!subscription
}

/**
 * Get user's subscription plan name
 */
export async function getUserSubscriptionPlan(): Promise<{
  plan: 'games' | 'group_sessions' | 'both' | null
  plans: string[]
}> {
  const subscriptions = await getUserActiveSubscriptions()
  
  if (subscriptions.length === 0) {
    return { plan: null, plans: [] }
  }

  const types = subscriptions.map((sub: any) => sub.subscription_type)
  const hasGames = types.includes('games')
  const hasGroupSessions = types.includes('group_sessions')

  if (hasGames && hasGroupSessions) {
    return { plan: 'both', plans: ['games', 'group_sessions'] }
  } else if (hasGames) {
    return { plan: 'games', plans: ['games'] }
  } else if (hasGroupSessions) {
    return { plan: 'group_sessions', plans: ['group_sessions'] }
  }

  return { plan: null, plans: [] }
}

/**
 * Get user's subscription details with expiration dates
 */
export async function getUserSubscriptionDetails(): Promise<{
  plan: 'games' | 'group_sessions' | 'both' | null
  planName: string
  expirationDate: string | null
  subscriptions: Array<{
    type: 'games' | 'group_sessions'
    typeName: string
    expirationDate: string
  }>
}> {
  const subscriptions = await getUserActiveSubscriptions()
  
  if (subscriptions.length === 0) {
    return {
      plan: null,
      planName: 'لا يوجد اشتراك',
      expirationDate: null,
      subscriptions: []
    }
  }

  // Get the latest expiration date
  const expirationDates = subscriptions.map((sub: any) => new Date(sub.end_date))
  const latestExpiration = new Date(Math.max(...expirationDates.map((d: Date) => d.getTime())))

  const types = subscriptions.map((sub: any) => sub.subscription_type)
  const hasGames = types.includes('games')
  const hasGroupSessions = types.includes('group_sessions')

  let plan: 'games' | 'group_sessions' | 'both' | null = null
  let planName = ''

  if (hasGames && hasGroupSessions) {
    plan = 'both'
    planName = 'باقة الجلسات الجماعية (تشمل الألعاب)'
  } else if (hasGames) {
    plan = 'games'
    planName = 'باقة الألعاب'
  } else if (hasGroupSessions) {
    plan = 'group_sessions'
    planName = 'باقة الجلسات الجماعية'
  }

  const subscriptionDetails = subscriptions.map((sub: any) => ({
    type: sub.subscription_type,
    typeName: sub.subscription_type === 'games' ? 'باقة الألعاب' : 'باقة الجلسات الجماعية',
    expirationDate: sub.end_date
  }))

  return {
    plan,
    planName,
    expirationDate: latestExpiration.toISOString(),
    subscriptions: subscriptionDetails
  }
}

/**
 * Get user's subscription details with expiration dates (English)
 */
export async function getUserSubscriptionDetailsEn(): Promise<{
  plan: 'games' | 'group_sessions' | 'both' | null
  planName: string
  expirationDate: string | null
  subscriptions: Array<{
    type: 'games' | 'group_sessions'
    typeName: string
    expirationDate: string
  }>
}> {
  const subscriptions = await getUserActiveSubscriptions()
  
  if (subscriptions.length === 0) {
    return {
      plan: null,
      planName: 'No Subscription',
      expirationDate: null,
      subscriptions: []
    }
  }

  // Get the latest expiration date
  const expirationDates = subscriptions.map((sub: any) => new Date(sub.end_date))
  const latestExpiration = new Date(Math.max(...expirationDates.map((d: Date) => d.getTime())))

  const types = subscriptions.map((sub: any) => sub.subscription_type)
  const hasGames = types.includes('games')
  const hasGroupSessions = types.includes('group_sessions')

  let plan: 'games' | 'group_sessions' | 'both' | null = null
  let planName = ''

  if (hasGames && hasGroupSessions) {
    plan = 'both'
    planName = 'Group Sessions Package (Includes Games)'
  } else if (hasGames) {
    plan = 'games'
    planName = 'Games Package'
  } else if (hasGroupSessions) {
    plan = 'group_sessions'
    planName = 'Group Sessions Package'
  }

  const subscriptionDetails = subscriptions.map((sub: any) => ({
    type: sub.subscription_type,
    typeName: sub.subscription_type === 'games' ? 'Games Package' : 'Group Sessions Package',
    expirationDate: sub.end_date
  }))

  return {
    plan,
    planName,
    expirationDate: latestExpiration.toISOString(),
    subscriptions: subscriptionDetails
  }
}

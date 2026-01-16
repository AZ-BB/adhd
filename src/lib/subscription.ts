"use server"
import { createSupabaseServerClient } from "./server"
import { redirect } from "next/navigation"
import { isAdmin } from "./admin"

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

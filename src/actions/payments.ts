"use server"

import { createSupabaseServerClient } from "@/lib/server"
import { redirect } from "next/navigation"

export interface Payment {
  id: number
  created_at: string
  updated_at: string
  user_id: number
  paymob_order_id: string | null
  paymob_transaction_id: string | null
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded'
  payment_method: string | null
  subscription_type: 'games' | 'group_sessions' | 'individual_session'
  package_id: number | null
  metadata: any
  paid_at: string | null
}

export interface Subscription {
  id: number
  created_at: string
  updated_at: string
  user_id: number
  payment_id: number | null
  subscription_type: 'games' | 'group_sessions' | 'individual_session'
  package_id: number
  status: string
  start_date: string
  end_date: string
  amount: number
  currency: string
}

/**
 * Get current user's payments
 */
export async function getUserPayments() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .maybeSingle()

  if (!userProfile) {
    return []
  }

  const { data: payments, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userProfile.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching payments:", error)
    return []
  }

  return payments as Payment[]
}

/**
 * Get current user's active subscriptions
 */
export async function getUserSubscriptions() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .maybeSingle()

  if (!userProfile) {
    return []
  }

  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userProfile.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching subscriptions:", error)
    return []
  }

  return subscriptions as Subscription[]
}

/**
 * Get payment by ID
 */
export async function getPayment(paymentId: number) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .maybeSingle()

  if (!userProfile) {
    return null
  }

  const { data: payment, error } = await supabase
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .eq("user_id", userProfile.id)
    .maybeSingle()

  if (error || !payment) {
    return null
  }

  return payment as Payment
}

/**
 * Check if user has active subscription for a package
 * Note: For individual_session, use hasPurchasedIndividualSession instead
 */
export async function hasActiveSubscription(
  subscriptionType: 'games' | 'group_sessions',
  packageId: number
): Promise<boolean> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
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
    .eq("package_id", packageId)
    .eq("status", "active")
    .gte("end_date", now)
    .maybeSingle()

  return !!subscription
}

/**
 * Check if user has purchased an individual session (one-time purchase)
 * Individual sessions are tracked via payments, not subscriptions
 */
export async function hasPurchasedIndividualSession(): Promise<boolean> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .maybeSingle()

  if (!userProfile) {
    return false
  }

  // Check for successful payment of individual session
  const { data: payment } = await supabase
    .from("payments")
    .select("id")
    .eq("user_id", userProfile.id)
    .eq("subscription_type", "individual_session")
    .eq("status", "success")
    .maybeSingle()

  return !!payment
}

/**
 * Get count of individual sessions purchased by user
 */
export async function getIndividualSessionPurchaseCount(): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return 0
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .maybeSingle()

  if (!userProfile) {
    return 0
  }

  const { count } = await supabase
    .from("payments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userProfile.id)
    .eq("subscription_type", "individual_session")
    .eq("status", "success")

  return count || 0
}

"use server"
import { createSupabaseServerClient } from "./server"
import { redirect } from "next/navigation"

export interface AdminUser {
  id: number
  email: string
  name: string
  auth_id: string
  role: "admin" | "super_admin"
  is_super_admin: boolean
  created_at: string
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("auth_id", user.id)
    .maybeSingle()

  return data?.role === "admin" || data?.role === "super_admin"
}

/**
 * Get the current admin user or redirect to login
 */
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", user.id)
    .maybeSingle()

  if (!userData) {
    redirect("/auth/login?error=User not found")
  }

  // Redirect regular users to their dashboard (not authorized for admin)
  if (userData.role === "user") {
    redirect("/dashboard")
  }

  // If still not admin/super_admin, redirect to login
  if (userData.role !== "admin" && userData.role !== "super_admin") {
    redirect("/auth/login?error=Unauthorized")
  }

  // Transform to AdminUser format
  const adminUser: AdminUser = {
    id: userData.id,
    email: user.email || "",
    name: `${userData.parent_first_name || ""} ${userData.parent_last_name || ""}`.trim() || "Admin",
    auth_id: userData.auth_id,
    role: userData.role,
    is_super_admin: userData.role === "super_admin",
    created_at: userData.created_at,
  }

  return adminUser
}

/**
 * Get the current admin user without redirecting
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", user.id)
    .maybeSingle()

  if (!userData || (userData.role !== "admin" && userData.role !== "super_admin")) {
    return null
  }

  // Transform to AdminUser format
  const adminUser: AdminUser = {
    id: userData.id,
    email: user.email || "",
    name: `${userData.parent_first_name || ""} ${userData.parent_last_name || ""}`.trim() || "Admin",
    auth_id: userData.auth_id,
    role: userData.role,
    is_super_admin: userData.role === "super_admin",
    created_at: userData.created_at,
  }

  return adminUser
}

/**
 * Admin logout action
 */
export async function adminLogout() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}


"use server"
import { createSupabaseServerClient, createSupabaseAdminServerClient } from "@/lib/server"
import { requireAdmin } from "@/lib/admin"

export interface UserStats {
  id: number
  auth_id: string
  email?: string
  child_first_name: string
  child_last_name: string
  child_birthday: string
  child_gender: string
  parent_first_name: string
  parent_last_name: string
  parent_phone: string
  initial_quiz_score: number
  created_at: string
  role: "user" | "admin" | "super_admin"
  completed_days: number
  total_games_completed: number
  overall_avg_score: number
  total_time_spent: number
}

export interface DashboardStats {
  totalUsers: number
  totalAdmins: number
  activeUsers: number
  totalLearningDaysCompleted: number
  avgCompletionRate: number
}

/**
 * Get all users with their progress (excluding admins)
 */
export async function getAllUsers(): Promise<UserStats[]> {
  const adminUser = await requireAdmin()
  const supabase = await createSupabaseServerClient()
  const isSuperAdmin = adminUser.is_super_admin

  const { data, error } = await supabase
    .from("user_progress_summary")
    .select("*")
    .eq("role", "user")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
    return []
  }

  // Only fetch emails if super admin
  let emailMap = new Map<string, string>()
  if (isSuperAdmin) {
    const adminSupabase = await createSupabaseAdminServerClient()
    const { data: { users: authUsers }, error: authError } = await adminSupabase.auth.admin.listUsers()
    
    if (authError) {
      console.error("Error fetching auth users:", authError)
    } else {
      emailMap = new Map(authUsers?.map(u => [u.id, u.email || ""]) || [])
    }
  }

  // Add email to each user (only for super admins)
  return (data as unknown as UserStats[]).map(user => ({
    ...user,
    email: isSuperAdmin ? (emailMap.get(user.auth_id) || "") : "",
    parent_phone: isSuperAdmin ? user.parent_phone : "", // Hide phone for regular admins
  }))
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()

  // Get total users (excluding admins)
  const { count: totalUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "user")

  // Get total admins
  const { count: totalAdmins } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .in("role", ["admin", "super_admin"])

  // Get active users (users who have activity in the last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const { count: activeUsers } = await supabase
    .from("user_day_progress")
    .select("user_id", { count: "exact", head: true })
    .gte("updated_at", sevenDaysAgo.toISOString())

  // Get total learning days completed
  const { count: totalLearningDaysCompleted } = await supabase
    .from("user_day_progress")
    .select("*", { count: "exact", head: true })
    .eq("is_completed", true)

  // Get average completion rate
  const { data: progressData } = await supabase
    .from("user_progress_summary")
    .select("completed_days")

  let avgCompletionRate = 0
  if (progressData && progressData.length > 0) {
    const totalDaysInPath = 30 // Assuming 30 days in learning path
    const sumCompletionRates = progressData.reduce(
      (sum, user) => sum + (user.completed_days / totalDaysInPath) * 100,
      0
    )
    avgCompletionRate = Math.round(sumCompletionRates / progressData.length)
  }

  return {
    totalUsers: totalUsers || 0,
    totalAdmins: totalAdmins || 0,
    activeUsers: activeUsers || 0,
    totalLearningDaysCompleted: totalLearningDaysCompleted || 0,
    avgCompletionRate,
  }
}

/**
 * Get detailed user information by ID
 */
export async function getUserDetails(userId: number) {
  const adminUser = await requireAdmin()
  const supabase = await createSupabaseServerClient()
  const isSuperAdmin = adminUser.is_super_admin

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single()

  if (!user) {
    return null
  }

  // Get user's learning path progress
  const { data: progress } = await supabase
    .from("user_day_progress")
    .select(`
      *,
      learning_day:learning_days(*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  // Get game attempts to calculate stats
  const { data: gameAttempts } = await supabase
    .from("user_game_attempts")
    .select("*")
    .eq("user_id", userId)

  // Calculate stats per day
  const progressWithStats = (progress || []).map((p) => {
    const dayAttempts = gameAttempts?.filter(a => a.learning_day_id === p.learning_day_id) || []
    const correctAttempts = dayAttempts.filter(a => a.is_correct)
    const totalTime = dayAttempts.reduce((sum, a) => sum + (a.time_taken_seconds || 0), 0)
    const avgScore = dayAttempts.length > 0
      ? dayAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / dayAttempts.length
      : 0

    return {
      ...p,
      games_completed: correctAttempts.length,
      time_spent: totalTime,
      average_score: avgScore
    }
  })

  // Get user email from auth using admin client (only for super admins)
  let email: string | undefined = undefined
  if (isSuperAdmin) {
    const adminSupabase = await createSupabaseAdminServerClient()
    const { data: { user: authUser } } = await adminSupabase.auth.admin.getUserById(user.auth_id)
    email = authUser?.email || undefined
  }
  
  return {
    user: {
      ...user,
      email: email,
      parent_phone: isSuperAdmin ? user.parent_phone : undefined, // Hide phone for regular admins
    },
    progress: progressWithStats,
    isSuperAdmin, // Pass flag to UI
  }
}

/**
 * Get quiz analytics
 */
export async function getQuizAnalytics() {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()

  // Get average initial quiz scores (excluding admins)
  const { data: users } = await supabase
    .from("users")
    .select("initial_quiz_score, category_scores, created_at")
    .eq("role", "user")
    .order("created_at", { ascending: false })

  if (!users) {
    return {
      avgInitialScore: 0,
      totalQuizzesTaken: 0,
      categoryBreakdown: {},
    }
  }

  const avgInitialScore = users.reduce((sum, u) => sum + (u.initial_quiz_score || 0), 0) / users.length

  // Parse category scores
  const categoryScores: Record<string, number[]> = {}
  users.forEach((user) => {
    if (user.category_scores) {
      Object.entries(user.category_scores).forEach(([category, score]) => {
        if (!categoryScores[category]) {
          categoryScores[category] = []
        }
        categoryScores[category].push(Number(score))
      })
    }
  })

  const categoryBreakdown = Object.entries(categoryScores).reduce(
    (acc, [category, scores]) => {
      acc[category] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      return acc
    },
    {} as Record<string, number>
  )

  return {
    avgInitialScore: Math.round(avgInitialScore),
    totalQuizzesTaken: users.length,
    categoryBreakdown,
  }
}

export interface AdminListItem {
  id: number
  auth_id: string
  email: string
  name: string
  role: "admin" | "super_admin"
  is_super_admin: boolean
  created_at: string
}

/**
 * Get all admins and super admins
 */
export async function getAllAdmins(): Promise<AdminListItem[]> {
  const adminUser = await requireAdmin()
  
  // Only super admins can view all admins
  if (!adminUser.is_super_admin) {
    throw new Error("Unauthorized: Only super admins can view admin list")
  }

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("users")
    .select("id, auth_id, parent_first_name, parent_last_name, role, created_at")
    .in("role", ["admin", "super_admin"])
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching admins:", error)
    throw error
  }

  // Fetch emails from auth.users using admin API
  const adminSupabase = await createSupabaseAdminServerClient()
  const { data: { users: authUsers }, error: authError } = await adminSupabase.auth.admin.listUsers()
  
  if (authError) {
    console.error("Error fetching auth users:", authError)
  }

  // Map auth_id to email
  const emailMap = new Map(authUsers?.map(u => [u.id, u.email]) || [])

  // Transform to AdminListItem format
  return (data || []).map(user => ({
    id: user.id,
    auth_id: user.auth_id,
    email: emailMap.get(user.auth_id) || "",
    name: `${user.parent_first_name || ""} ${user.parent_last_name || ""}`.trim() || "Admin",
    role: user.role as "admin" | "super_admin",
    is_super_admin: user.role === "super_admin",
    created_at: user.created_at,
  }))
}

/**
 * Create a new admin user
 */
export async function createAdmin(
  email: string,
  password: string,
  name: string,
  isSuperAdmin: boolean
) {
  const adminUser = await requireAdmin()
  
  // Only super admins can create admins
  if (!adminUser.is_super_admin) {
    throw new Error("Unauthorized: Only super admins can create admins")
  }

  const supabase = await createSupabaseServerClient()
  const adminSupabase = await createSupabaseAdminServerClient()

  // Validate inputs
  if (!email || !password || !name) {
    throw new Error("Email, password, and name are required")
  }

  // Check if user already exists
  const { data: existingUser } = await adminSupabase.auth.admin.listUsers()
  const userExists = existingUser?.users.some(u => u.email === email)
  
  if (userExists) {
    throw new Error("User with this email already exists")
  }

  // Create auth user using admin client
  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email
  })

  if (authError || !authData.user) {
    throw new Error(authError?.message || "Failed to create auth user")
  }

  // Parse name into first and last name
  const nameParts = name.trim().split(" ")
  const firstName = nameParts[0] || ""
  const lastName = nameParts.slice(1).join(" ") || ""

  // Create user record in users table
  // Note: Child fields are required by the schema, so we use placeholder values for admin accounts
  const { data: userData, error: userError } = await supabase
    .from("users")
    .insert({
      auth_id: authData.user.id,
      parent_first_name: firstName,
      parent_last_name: lastName,
      child_first_name: "Admin", // Placeholder - required by schema
      child_last_name: "Account", // Placeholder - required by schema
      child_birthday: "2000-01-01", // Placeholder date - required by schema
      child_gender: "other", // Placeholder - required by schema
      initial_quiz_score: 0, // Default value
      role: isSuperAdmin ? "super_admin" : "admin",
    })
    .select()
    .single()

  if (userError || !userData) {
    // Rollback: delete auth user if user creation fails
    await adminSupabase.auth.admin.deleteUser(authData.user.id)
    throw new Error(userError?.message || "Failed to create user record")
  }

  return {
    id: userData.id,
    auth_id: authData.user.id,
    email: authData.user.email || email,
    name,
    role: isSuperAdmin ? "super_admin" : "admin",
    is_super_admin: isSuperAdmin,
    created_at: userData.created_at,
  }
}

/**
 * Update an admin's role
 */
export async function updateAdminRole(
  userId: number,
  isSuperAdmin: boolean
) {
  const adminUser = await requireAdmin()
  
  // Only super admins can update admin roles
  if (!adminUser.is_super_admin) {
    throw new Error("Unauthorized: Only super admins can update admin roles")
  }

  // Prevent self-demotion
  if (adminUser.id === userId && !isSuperAdmin) {
    throw new Error("You cannot demote yourself from super admin")
  }

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("users")
    .update({
      role: isSuperAdmin ? "super_admin" : "admin",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .eq("role", isSuperAdmin ? "admin" : "super_admin") // Only allow role changes
    .select()
    .single()

  if (error || !data) {
    throw new Error(error?.message || "Failed to update admin role")
  }

  return {
    id: data.id,
    auth_id: data.auth_id,
    role: data.role as "admin" | "super_admin",
    is_super_admin: data.role === "super_admin",
  }
}

/**
 * Delete/demote an admin (convert to regular user)
 */
export async function deleteAdmin(userId: number) {
  const adminUser = await requireAdmin()
  
  // Only super admins can delete admins
  if (!adminUser.is_super_admin) {
    throw new Error("Unauthorized: Only super admins can delete admins")
  }

  // Prevent self-deletion
  if (adminUser.id === userId) {
    throw new Error("You cannot delete your own admin account")
  }

  const supabase = await createSupabaseServerClient()

  // Get the user first to get auth_id
  const { data: userData } = await supabase
    .from("users")
    .select("auth_id, role")
    .eq("id", userId)
    .single()

  if (!userData) {
    throw new Error("Admin not found")
  }

  // Demote to regular user instead of deleting
  const { data, error } = await supabase
    .from("users")
    .update({
      role: "user",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .in("role", ["admin", "super_admin"])
    .select()
    .single()

  if (error || !data) {
    throw new Error(error?.message || "Failed to delete admin")
  }

  return { success: true }
}

/**
 * Reset an admin's password
 */
export async function resetAdminPassword(
  userId: number,
  newPassword: string
) {
  const adminUser = await requireAdmin()
  
  // Only super admins can reset admin passwords
  if (!adminUser.is_super_admin) {
    throw new Error("Unauthorized: Only super admins can reset admin passwords")
  }

  // Validate password
  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters long")
  }

  const supabase = await createSupabaseServerClient()
  const adminSupabase = await createSupabaseAdminServerClient()

  // Get the user first to get auth_id
  const { data: userData } = await supabase
    .from("users")
    .select("auth_id, role")
    .eq("id", userId)
    .in("role", ["admin", "super_admin"])
    .single()

  if (!userData) {
    throw new Error("Admin not found")
  }

  // Update password using admin API
  const { data, error } = await adminSupabase.auth.admin.updateUserById(
    userData.auth_id,
    {
      password: newPassword,
    }
  )

  if (error || !data) {
    throw new Error(error?.message || "Failed to reset password")
  }

  return { success: true }
}


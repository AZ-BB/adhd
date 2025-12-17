"use server"
import { createSupabaseServerClient } from "@/lib/server"
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
  await requireAdmin()
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("user_progress_summary")
    .select("*")
    .eq("role", "user")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
    return []
  }

  // Fetch emails from auth.users using admin API
  const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    console.error("Error fetching auth users:", authError)
  }

  // Map auth_id to email
  const emailMap = new Map(authUsers?.map(u => [u.id, u.email]) || [])

  // Add email to each user
  return (data as UserStats[]).map(user => ({
    ...user,
    email: emailMap.get(user.auth_id) || undefined
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
  await requireAdmin()
  const supabase = await createSupabaseServerClient()

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

  // Get user email from auth
  const { data: { user: authUser } } = await supabase.auth.admin.getUserById(user.auth_id)
  
  return {
    user: {
      ...user,
      email: authUser?.email || undefined
    },
    progress: progressWithStats,
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


'use server'

import { cache } from 'react'
import { createSupabaseServerClient } from "@/lib/server"
import {
  LearningDay,
  LearningDayWithGames,
  UserDayProgress,
  UserGameAttempt,
  DayProgressResponse,
  UserLearningPathStats,
  Game,
  DayGame,
  GameAttemptData
} from "@/types/learning-path"

/**
 * Get all learning days
 */
export async function getLearningDays(): Promise<LearningDay[]> {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('learning_days')
    .select('*')
    .eq('is_active', true)
    .order('day_number', { ascending: true })
  
  if (error) {
    console.error('Error fetching learning days:', error)
    throw new Error('Failed to fetch learning days')
  }
  
  return data || []
}

/**
 * Get a specific learning day with its games
 */
export async function getLearningDayWithGames(dayId: number): Promise<LearningDayWithGames | null> {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('learning_days')
    .select(`
      *,
      day_games (
        *,
        game:games (*)
      )
    `)
    .eq('id', dayId)
    .eq('is_active', true)
    .single()
  
  if (error) {
    console.error('Error fetching learning day:', error)
    return null
  }
  
  return data as LearningDayWithGames
}

/**
 * Get learning day by day number with games
 */
export async function getLearningDayByNumber(dayNumber: number): Promise<LearningDayWithGames | null> {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('learning_days')
    .select(`
      *,
      day_games (
        *,
        game:games (*)
      )
    `)
    .eq('day_number', dayNumber)
    .eq('is_active', true)
    .single()
  
  if (error) {
    console.error('Error fetching learning day by number:', error)
    return null
  }
  
  // Sort day_games by order_in_day
  if (data && data.day_games) {
    data.day_games.sort((a: DayGame, b: DayGame) => a.order_in_day - b.order_in_day)
  }
  
  return data as LearningDayWithGames
}

/**
 * Get user's progress for a specific day
 */
export async function getUserDayProgress(userId: number, learningDayId: number): Promise<UserDayProgress | null> {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('user_day_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('learning_day_id', learningDayId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No progress found, return null
      return null
    }
    console.error('Error fetching user day progress:', error)
    throw new Error('Failed to fetch user day progress')
  }
  
  return data
}

/**
 * Get all user's day progress
 */
export async function getUserAllDayProgress(userId: number): Promise<UserDayProgress[]> {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('user_day_progress')
    .select(`
      *,
      learning_day:learning_days (*)
    `)
    .eq('user_id', userId)
    .order('learning_day_id', { ascending: true })
  
  if (error) {
    console.error('Error fetching user progress:', error)
    throw new Error('Failed to fetch user progress')
  }
  
  return data || []
}

/**
 * Get user's game attempts for a specific day
 */
export async function getUserGameAttemptsForDay(
  userId: number, 
  learningDayId: number
): Promise<UserGameAttempt[]> {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('user_game_attempts')
    .select(`
      *,
      game:games (*)
    `)
    .eq('user_id', userId)
    .eq('learning_day_id', learningDayId)
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching game attempts:', error)
    throw new Error('Failed to fetch game attempts')
  }
  
  return data || []
}

/**
 * Get comprehensive day progress with all details
 */
export async function getDayProgressDetails(
  userId: number,
  dayNumber: number
): Promise<DayProgressResponse | null> {
  const day = await getLearningDayByNumber(dayNumber)
  if (!day) return null
  
  const progress = await getUserDayProgress(userId, day.id)
  const attempts = await getUserGameAttemptsForDay(userId, day.id)
  
  // Map games with their attempts and completion status
  const games = day.day_games.map((dayGame) => {
    const gameAttempts = attempts.filter(a => a.game_id === dayGame.game_id)
    const isCompleted = gameAttempts.some(a => a.is_correct)
    
    return {
      dayGame,
      game: dayGame.game as Game,
      attempts: gameAttempts,
      isCompleted
    }
  })
  
  return {
    day,
    progress,
    games
  }
}

/**
 * Record a game attempt
 */
export async function recordGameAttempt(params: {
  userId: number
  gameId: number
  learningDayId: number
  dayGameId?: number
  isCorrect: boolean
  score: number
  timeTakenSeconds?: number
  mistakesCount?: number
  gameData?: GameAttemptData
}): Promise<UserGameAttempt> {
  const supabase = await createSupabaseServerClient()
  
  // Get the attempt number (count existing attempts + 1)
  const { data: existingAttempts } = await supabase
    .from('user_game_attempts')
    .select('attempt_number')
    .eq('user_id', params.userId)
    .eq('game_id', params.gameId)
    .eq('learning_day_id', params.learningDayId)
    .order('attempt_number', { ascending: false })
    .limit(1)
  
  const attemptNumber = existingAttempts && existingAttempts.length > 0 
    ? existingAttempts[0].attempt_number + 1 
    : 1
  
  const { data, error } = await supabase
    .from('user_game_attempts')
    .insert({
      user_id: params.userId,
      game_id: params.gameId,
      learning_day_id: params.learningDayId,
      day_game_id: params.dayGameId,
      is_correct: params.isCorrect,
      score: params.score,
      time_taken_seconds: params.timeTakenSeconds,
      attempt_number: attemptNumber,
      mistakes_count: params.mistakesCount || 0,
      game_data: params.gameData
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error recording game attempt:', error)
    throw new Error('Failed to record game attempt')
  }
  
  return data
}

/**
 * Get user's learning path statistics
 */
export async function getUserLearningPathStats(userId: number): Promise<UserLearningPathStats> {
  const supabase = await createSupabaseServerClient()
  
  // Get total days
  const { data: totalDaysData } = await supabase
    .from('learning_days')
    .select('id', { count: 'exact' })
    .eq('is_active', true)
  
  const totalDays = totalDaysData?.length || 0
  
  // Get user's progress
  const { data: progressData } = await supabase
    .from('user_day_progress')
    .select('*')
    .eq('user_id', userId)
    .order('learning_day_id', { ascending: true })
  
  const completedDays = progressData?.filter(p => p.is_completed).length || 0
  
  // Find current day (first incomplete day or next day after last completed)
  const lastCompletedDay = progressData?.filter(p => p.is_completed).pop()
  const firstIncompletDay = progressData?.find(p => !p.is_completed)
  
  let currentDay = 1
  if (firstIncompletDay) {
    const { data: dayData } = await supabase
      .from('learning_days')
      .select('day_number')
      .eq('id', firstIncompletDay.learning_day_id)
      .single()
    currentDay = dayData?.day_number || 1
  } else if (lastCompletedDay) {
    const { data: dayData } = await supabase
      .from('learning_days')
      .select('day_number')
      .eq('id', lastCompletedDay.learning_day_id)
      .single()
    currentDay = Math.min((dayData?.day_number || 0) + 1, totalDays)
  }
  
  // Get game attempts
  const { data: attemptsData } = await supabase
    .from('user_game_attempts')
    .select('*')
    .eq('user_id', userId)
  
  const totalGamesPlayed = attemptsData?.length || 0
  const totalGamesCompleted = attemptsData?.filter(a => a.is_correct).length || 0
  const averageScore = totalGamesPlayed > 0
    ? attemptsData!.reduce((sum, a) => sum + a.score, 0) / totalGamesPlayed
    : 0
  const totalTimePlayed = attemptsData?.reduce((sum, a) => sum + (a.time_taken_seconds || 0), 0) || 0
  
  // Calculate streak (consecutive completed days)
  let streak = 0
  if (progressData) {
    const sortedProgress = [...progressData]
      .filter(p => p.is_completed)
      .sort((a, b) => b.learning_day_id - a.learning_day_id)
    
    for (let i = 0; i < sortedProgress.length; i++) {
      const { data: dayData } = await supabase
        .from('learning_days')
        .select('day_number')
        .eq('id', sortedProgress[i].learning_day_id)
        .single()
      
      if (i === 0) {
        streak = 1
      } else {
        const { data: prevDayData } = await supabase
          .from('learning_days')
          .select('day_number')
          .eq('id', sortedProgress[i - 1].learning_day_id)
          .single()
        
        if (prevDayData && dayData && prevDayData.day_number - dayData.day_number === 1) {
          streak++
        } else {
          break
        }
      }
    }
  }
  
  // Get last played date
  const lastPlayedAt = attemptsData && attemptsData.length > 0
    ? attemptsData.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0].created_at
    : undefined
  
  return {
    totalDays,
    completedDays,
    currentDay,
    totalGamesPlayed,
    totalGamesCompleted,
    averageScore: Math.round(averageScore),
    totalTimePlayed,
    streak,
    lastPlayedAt
  }
}

/**
 * Get user's current active day
 */
export async function getUserCurrentDay(userId: number): Promise<LearningDayWithGames | null> {
  const stats = await getUserLearningPathStats(userId)
  return await getLearningDayByNumber(stats.currentDay)
}

/**
 * Initialize learning path start date for a user
 * Cached to avoid redundant database queries within the same request
 */
const initializeLearningPathStartDate = cache(async (userId: number): Promise<void> => {
  const supabase = await createSupabaseServerClient()
  
  // Check if already initialized
  const { data: user } = await supabase
    .from('users')
    .select('learning_path_started_at')
    .eq('id', userId)
    .single()
  
  if (!user?.learning_path_started_at) {
    // Initialize with current date
    await supabase
      .from('users')
      .update({ learning_path_started_at: new Date().toISOString() })
      .eq('id', userId)
  }
})

/**
 * Get which day number user should be on based on time elapsed
 * Cached to avoid redundant database queries within the same request
 */
const getAvailableDayByTime = cache(async (userId: number): Promise<number> => {
  const supabase = await createSupabaseServerClient()
  
  const { data: user } = await supabase
    .from('users')
    .select('learning_path_started_at')
    .eq('id', userId)
    .single()
  
  const { data: learningDaysData } = await supabase
    .from('learning_days')
    .select('id')
    .eq('is_active', true)
    .order('day_number', { ascending: true })
  
  const totalDays = learningDaysData?.length || 0
  console.log('totalDays', totalDays)
  if (!user?.learning_path_started_at) {
    // Not started yet, only Day 1 available
    return 1
  }
  
  const startDate = new Date(user.learning_path_started_at)
  const today = new Date()
  
  // Reset time part to compare dates only
  startDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  
  // Calculate days elapsed
  const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  
  // Day 1 available on day 0, Day 2 on day 1, etc.
  // So available day = daysElapsed + 1
  return Math.min(daysElapsed + 1, totalDays) // Max totalDays days
})

/**
 * Check if user can access a specific day (only time-based restriction)
 */
export async function canAccessDay(userId: number, dayNumber: number): Promise<boolean> {
  // Initialize learning path if this is first access
  await initializeLearningPathStartDate(userId)
  
  // Check time-based availability only
  const availableDayByTime = await getAvailableDayByTime(userId)
  
  // Day is accessible if time allows (no completion requirement)
  return dayNumber <= availableDayByTime
}

/**
 * Get day availability info (for UI display)
 */
export async function getDayAvailability(userId: number, dayNumber: number): Promise<{
  canAccess: boolean
  reason: 'available' | 'time_locked'
  availableDate?: string
}> {
  const supabase = await createSupabaseServerClient()
  
  // Initialize learning path if needed
  await initializeLearningPathStartDate(userId)
  
  // Get time-based availability
  const availableDayByTime = await getAvailableDayByTime(userId)
  
  // Check if time-locked
  if (dayNumber > availableDayByTime) {
    // Calculate when it will be available
    const { data: user } = await supabase
      .from('users')
      .select('learning_path_started_at')
      .eq('id', userId)
      .single()
    
    if (user?.learning_path_started_at) {
      const startDate = new Date(user.learning_path_started_at)
      const availableDate = new Date(startDate)
      availableDate.setDate(availableDate.getDate() + dayNumber - 1)
      
      return {
        canAccess: false,
        reason: 'time_locked',
        availableDate: availableDate.toISOString()
      }
    }
  }
  
  // Day is available if time allows (no completion requirement)
  return { canAccess: true, reason: 'available' }
}

/**
 * Reset a day's progress (for retrying)
 */
export async function resetDayProgress(userId: number, learningDayId: number): Promise<void> {
  const supabase = await createSupabaseServerClient()
  
  // Delete game attempts for this day
  await supabase
    .from('user_game_attempts')
    .delete()
    .eq('user_id', userId)
    .eq('learning_day_id', learningDayId)
  
  // Delete or reset day progress
  await supabase
    .from('user_day_progress')
    .delete()
    .eq('user_id', userId)
    .eq('learning_day_id', learningDayId)
}

/**
 * Get leaderboard for a specific game
 */
export async function getGameLeaderboard(gameId: number, limit: number = 10) {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('user_game_attempts')
    .select(`
      *,
      user:users (
        id,
        child_first_name,
        child_last_name
      )
    `)
    .eq('game_id', gameId)
    .eq('is_correct', true)
    .order('score', { ascending: false })
    .order('time_taken_seconds', { ascending: true })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching leaderboard:', error)
    throw new Error('Failed to fetch leaderboard')
  }
  
  return data || []
}


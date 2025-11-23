'use server'

import { createSupabaseServerClient } from "@/lib/server"
import { 
  PhysicalActivityVideo, 
  UserPhysicalActivityProgress, 
  PhysicalActivityDayInfo,
  PhysicalActivityStats 
} from "@/types/physical-activities"

/**
 * Initialize physical activities start date for a user
 * Called when user first accesses physical activities
 */
async function initializePhysicalActivitiesStartDate(userId: number): Promise<void> {
  const supabase = await createSupabaseServerClient()
  
  const { data: user } = await supabase
    .from('users')
    .select('physical_activities_started_at')
    .eq('id', userId)
    .single()
  
  // Only set if not already set
  if (!user?.physical_activities_started_at) {
    await supabase
      .from('users')
      .update({ physical_activities_started_at: new Date().toISOString() })
      .eq('id', userId)
  }
}

/**
 * Seeded random number generator for deterministic randomization
 * Same seed = same sequence of random numbers
 */
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

/**
 * Get 4 random videos for today (deterministic based on date)
 * Returns the same 4 videos for the entire day
 */
function getTodaysRandomVideos(
  allVideos: PhysicalActivityVideo[], 
  date: Date
): PhysicalActivityVideo[] {
  if (allVideos.length === 0) return []
  
  // Create seed from date (YYYYMMDD format as number)
  const dateString = date.toISOString().split('T')[0].replace(/-/g, '')
  const seed = parseInt(dateString)
  
  // Create seeded random function
  const random = seededRandom(seed)
  
  // Shuffle array with seeded random
  const shuffled = [...allVideos].sort(() => random() - 0.5)
  
  // Return first 4 (or all if less than 4)
  return shuffled.slice(0, Math.min(4, shuffled.length))
}

/**
 * Check if a video file exists in storage
 */
async function checkVideoExists(storagePath: string): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase.storage
      .from('physical-activities')
      .list('', {
        search: storagePath
      })
    
    if (error) {
      console.error('Error checking video existence:', error)
      return false
    }
    
    return data && data.length > 0
  } catch (error) {
    console.error('Error in checkVideoExists:', error)
    return false
  }
}

/**
 * Get today's 4 random physical activity videos (only ones that exist in storage)
 */
export async function getTodaysPhysicalActivity(
  userId: number
): Promise<PhysicalActivityDayInfo | { error: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Initialize start date if needed
    await initializePhysicalActivitiesStartDate(userId)
    
    // Get all active videos
    const { data: allVideos, error: videosError } = await supabase
      .from('physical_activity_videos')
      .select('*')
      .eq('is_active', true)
      .order('video_number', { ascending: true })
    
    if (videosError) {
      console.error('Error fetching videos:', videosError)
      return { error: 'Failed to fetch videos' }
    }
    
    const totalVideosAvailable = allVideos?.length || 0
    
    if (totalVideosAvailable === 0) {
      return {
        availableVideos: [],
        watchedVideoNumbers: [],
        totalVideosWatched: 0,
        totalVideosAvailable: 0,
        todayProgress: []
      }
    }
    
    // Get 4 random videos for today (deterministic based on date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedVideos = getTodaysRandomVideos(allVideos as PhysicalActivityVideo[], today)
    
    // Filter videos to only include ones that exist in storage
    const existingVideos: PhysicalActivityVideo[] = []
    for (const video of selectedVideos) {
      const exists = await checkVideoExists(video.storage_path)
      if (exists) {
        existingVideos.push(video)
      } else {
        console.warn(`Video not found in storage: ${video.storage_path}`)
      }
    }
    
    // Get today's watch history
    const { data: todayProgress } = await supabase
      .from('user_physical_activity_progress')
      .select('*')
      .eq('user_id', userId)
      .gte('watched_at', today.toISOString())
      .order('watched_at', { ascending: false })
    
    const watchedVideoNumbers = todayProgress?.map(p => p.video_number) || []
    
    // Get total unique videos watched (all time)
    const { data: allProgress } = await supabase
      .from('user_physical_activity_progress')
      .select('video_number')
      .eq('user_id', userId)
      .eq('is_completed', true)
    
    const uniqueVideosWatched = new Set(allProgress?.map(p => p.video_number) || [])
    
    return {
      availableVideos: existingVideos,
      watchedVideoNumbers,
      totalVideosWatched: uniqueVideosWatched.size,
      totalVideosAvailable,
      todayProgress: (todayProgress as UserPhysicalActivityProgress[]) || []
    }
  } catch (error) {
    console.error('Error in getTodaysPhysicalActivity:', error)
    return { error: 'An unexpected error occurred' }
  }
}

/**
 * Record that user watched a physical activity video
 */
export async function recordPhysicalActivityWatch(
  userId: number,
  videoNumber: number,
  watchDurationSeconds?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Check if video exists and is active
    const { data: video, error: videoError } = await supabase
      .from('physical_activity_videos')
      .select('id')
      .eq('video_number', videoNumber)
      .eq('is_active', true)
      .maybeSingle()
    
    if (videoError || !video) {
      return { success: false, error: 'Video not found or inactive' }
    }
    
    // Record the watch (users can watch multiple videos per day)
    const { error: insertError } = await supabase
      .from('user_physical_activity_progress')
      .insert({
        user_id: userId,
        video_number: videoNumber,
        is_completed: true,
        watch_duration_seconds: watchDurationSeconds,
        watched_at: new Date().toISOString()
      })
    
    if (insertError) {
      console.error('Error recording watch:', insertError)
      return { success: false, error: 'Failed to record watch progress' }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error in recordPhysicalActivityWatch:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get user's physical activity statistics
 */
export async function getUserPhysicalActivityStats(
  userId: number
): Promise<PhysicalActivityStats | { error: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get user's start date
    const { data: user } = await supabase
      .from('users')
      .select('physical_activities_started_at')
      .eq('id', userId)
      .single()
    
    // Get all user's progress
    const { data: allProgress, error: progressError } = await supabase
      .from('user_physical_activity_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', true)
      .order('watched_at', { ascending: true })
    
    if (progressError) {
      console.error('Error fetching progress:', progressError)
      return { error: 'Failed to fetch statistics' }
    }
    
    const uniqueVideosWatched = new Set(allProgress?.map(p => p.video_number) || [])
    const totalVideosWatched = uniqueVideosWatched.size
    
    // Calculate total watch time
    const totalWatchTime = allProgress?.reduce(
      (sum, p) => sum + (p.watch_duration_seconds || 0), 
      0
    ) || 0
    
    // Calculate streak (consecutive days watched)
    let streak = 0
    if (allProgress && allProgress.length > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      let checkDate = new Date(today)
      let foundGap = false
      
      while (!foundGap && streak < 365) { // Max 365 days to prevent infinite loop
        const dayStart = new Date(checkDate)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(checkDate)
        dayEnd.setHours(23, 59, 59, 999)
        
        const watchedOnDay = allProgress.some(p => {
          const watchedDate = new Date(p.watched_at)
          return watchedDate >= dayStart && watchedDate <= dayEnd
        })
        
        if (watchedOnDay) {
          streak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          foundGap = true
        }
      }
    }
    
    // Get today's available videos count
    const { data: videos } = await supabase
      .from('physical_activity_videos')
      .select('video_number')
      .eq('is_active', true)
    
    const totalVideos = videos?.length || 0
    // For stats, we show the count of today's videos (always 4 or less)
    const currentVideoNumber = Math.min(4, totalVideos)
    
    const lastWatched = allProgress && allProgress.length > 0
      ? allProgress[allProgress.length - 1].watched_at
      : undefined
    
    return {
      totalVideosWatched,
      currentVideoNumber,
      streak,
      lastWatchedAt: lastWatched,
      totalWatchTime,
      startedAt: user?.physical_activities_started_at
    }
  } catch (error) {
    console.error('Error in getUserPhysicalActivityStats:', error)
    return { error: 'An unexpected error occurred' }
  }
}

/**
 * Get all physical activity videos (for admin)
 */
export async function getAllPhysicalActivityVideos(): Promise<
  PhysicalActivityVideo[] | { error: string }
> {
  try {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('physical_activity_videos')
      .select('*')
      .order('video_number', { ascending: true })
    
    if (error) {
      console.error('Error fetching videos:', error)
      return { error: 'Failed to fetch videos' }
    }
    
    return (data as PhysicalActivityVideo[]) || []
  } catch (error) {
    console.error('Error in getAllPhysicalActivityVideos:', error)
    return { error: 'An unexpected error occurred' }
  }
}

/**
 * Update physical activity video (for admin)
 */
export async function updatePhysicalActivityVideo(
  videoId: number,
  updates: Partial<Omit<PhysicalActivityVideo, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    
    const { error } = await supabase
      .from('physical_activity_videos')
      .update(updates)
      .eq('id', videoId)
    
    if (error) {
      console.error('Error updating video:', error)
      return { success: false, error: 'Failed to update video' }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error in updatePhysicalActivityVideo:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Create a new physical activity video (for admin)
 */
export async function createPhysicalActivityVideo(
  video: Omit<PhysicalActivityVideo, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; video?: PhysicalActivityVideo; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('physical_activity_videos')
      .insert(video)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating video:', error)
      return { success: false, error: 'Failed to create video' }
    }
    
    return { success: true, video: data as PhysicalActivityVideo }
  } catch (error) {
    console.error('Error in createPhysicalActivityVideo:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Delete a physical activity video (for admin)
 */
export async function deletePhysicalActivityVideo(
  videoId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    
    const { error } = await supabase
      .from('physical_activity_videos')
      .delete()
      .eq('id', videoId)
    
    if (error) {
      console.error('Error deleting video:', error)
      return { success: false, error: 'Failed to delete video' }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error in deletePhysicalActivityVideo:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}


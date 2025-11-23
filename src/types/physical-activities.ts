// Physical Activities Types

export interface PhysicalActivityVideo {
  id: number
  created_at: string
  updated_at: string
  video_number: number
  title: string
  title_ar: string
  description?: string
  description_ar?: string
  duration_seconds?: number
  thumbnail_url?: string
  is_active: boolean
  storage_path: string
}

export interface UserPhysicalActivityProgress {
  id: number
  created_at: string
  updated_at: string
  user_id: number
  video_number: number
  watched_at: string
  is_completed: boolean
  watch_duration_seconds?: number
}

export interface PhysicalActivityDayInfo {
  availableVideos: PhysicalActivityVideo[] // 4 random videos available today
  watchedVideoNumbers: number[] // Video numbers watched today
  totalVideosWatched: number // Total unique videos the user has watched
  totalVideosAvailable: number // Total videos in the system
  todayProgress: UserPhysicalActivityProgress[] // Today's watch history
}

export interface PhysicalActivityStats {
  totalVideosWatched: number
  currentVideoNumber: number
  streak: number // Consecutive days watched
  lastWatchedAt?: string
  totalWatchTime: number // Total watch time in seconds
  startedAt?: string
}


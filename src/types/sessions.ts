export interface Coach {
  id: number
  created_at: string
  updated_at: string
  name: string
  name_ar?: string
  title?: string
  title_ar?: string
  bio?: string
  bio_ar?: string
  image_url?: string
}

export interface Session {
  id: number
  created_at: string
  updated_at: string
  coach_id: number | null
  title: string
  title_ar?: string
  description?: string
  description_ar?: string
  platform: string
  meeting_link: string
  session_date: string
  max_participants: number
  duration_minutes: number
  is_free?: boolean
}

export interface SessionEnrollment {
  id: number
  created_at: string
  session_id: number
  user_id: number
}

export interface SessionWithCoach extends Session {
  coach?: Coach | null
  enrollment_count?: number
  is_enrolled?: boolean // For user view
}

export interface SessionFilters {
  coach_id?: number
  date_from?: string
  date_to?: string
  include_past?: boolean
}


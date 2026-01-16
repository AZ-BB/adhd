export type SoloSessionStatus = 'pending' | 'payment_pending' | 'approved' | 'paid' | 'rejected'

export interface SoloSessionRequest {
  id: number
  created_at: string
  updated_at: string
  user_id: number
  coach_id: number | null
  preferred_time: string | null
  scheduled_time?: string | null
  duration_minutes: number
  notes?: string
  status: SoloSessionStatus
  meeting_link?: string | null
  admin_reason?: string | null
  responded_at?: string | null
  responded_by_user_id?: number | null
  coach?: {
    id: number
    name: string
    name_ar?: string
    title?: string
    title_ar?: string
    image_url?: string
  } | null
  user?: {
    child_first_name: string
    child_last_name: string
    parent_first_name?: string
    parent_last_name?: string
    parent_phone?: string
    auth_id: string
    email?: string
  }
  responder?: {
    auth_id: string
    parent_first_name?: string
    parent_last_name?: string
    email?: string
  }
}

export interface SoloSessionRequestInput {
  coach_id?: number | null
  preferred_time?: string | null
  duration_minutes?: number
  notes?: string
}

export interface SoloSessionResponseInput {
  status: SoloSessionStatus | 'edit' // 'edit' is a special case for paid sessions to preserve status
  meeting_link?: string | null
  admin_reason?: string | null
  scheduled_time?: string | null
}



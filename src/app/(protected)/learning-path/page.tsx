import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/server'
import { getUserByAuthId } from '@/actions/users'
import { 
  getLearningDays, 
  getUserAllDayProgress, 
  getUserLearningPathStats,
  getDayAvailability 
} from '@/actions/learning-path'
import { hasActiveSubscription } from '@/lib/subscription'
import LearningPathClientAr from './LearningPathClientAr'
import PremiumLock from '@/components/PremiumLock'

export default async function LearningPathPageAr() {
  const supabase = await createSupabaseServerClient()
  
  // Get authenticated user
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) {
    redirect('/auth/login')
  }
  
  // Get user from database
  const user = await getUserByAuthId(authUser.id)
  
  if (!user) {
    redirect('/auth/signup')
  }

  // Check if user has active subscription
  const hasSubscription = await hasActiveSubscription()
  
  // Get all learning days
  const learningDays = await getLearningDays()
  
  // Get user's progress for all days
  const userProgress = await getUserAllDayProgress(user.id)
  
  // Get user statistics
  const stats = await getUserLearningPathStats(user.id)
  
  // Calculate which month the user is currently in (30 days per month)
  const getDayMonth = (dayNumber: number): number => {
    return Math.ceil(dayNumber / 30)
  }
  
  const getCurrentUserMonth = (): number => {
    if (!user.learning_path_started_at) {
      return 1 // First month if not started
    }
    const startDate = new Date(user.learning_path_started_at)
    const today = new Date()
    startDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    
    const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const currentDay = daysElapsed + 1 // Day 1 is available on day 0
    return getDayMonth(currentDay)
  }
  
  const currentMonth = getCurrentUserMonth()
  
  // Filter days to only show current month and past months (hide future months)
  let visibleDays = learningDays.filter((day) => {
    const dayMonth = getDayMonth(day.day_number)
    return dayMonth <= currentMonth
  })
  
  // If user doesn't have subscription, only show first 3 days
  if (!hasSubscription) {
    visibleDays = visibleDays.filter((day) => day.day_number <= 3)
  }
  
  // Create a map of day_id -> progress
  const progressMap = new Map(
    userProgress.map(p => [p.learning_day_id, p])
  )
  
  // Determine which days are accessible and why
  const daysWithAccess = await Promise.all(
    visibleDays.map(async (day) => {
      const availability = await getDayAvailability(user.id, day.day_number)
      return {
        ...day,
        progress: progressMap.get(day.id) || null,
        canAccess: availability.canAccess,
        lockReason: availability.reason,
        availableDate: availability.availableDate
      }
    })
  )
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <LearningPathClientAr 
          days={daysWithAccess}
          stats={stats}
          userId={user.id}
        />
      </div>
    </div>
  )
}


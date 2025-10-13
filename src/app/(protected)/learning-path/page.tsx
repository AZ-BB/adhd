import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/server'
import { getUserByAuthId } from '@/actions/users'
import { 
  getLearningDays, 
  getUserAllDayProgress, 
  getUserLearningPathStats,
  getDayAvailability 
} from '@/actions/learning-path'
import LearningPathClientAr from './LearningPathClientAr'

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
  
  // Get all learning days
  const learningDays = await getLearningDays()
  
  // Get user's progress for all days
  const userProgress = await getUserAllDayProgress(user.id)
  
  // Get user statistics
  const stats = await getUserLearningPathStats(user.id)
  
  // Create a map of day_id -> progress
  const progressMap = new Map(
    userProgress.map(p => [p.learning_day_id, p])
  )
  
  // Determine which days are accessible and why
  const daysWithAccess = await Promise.all(
    learningDays.map(async (day) => {
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


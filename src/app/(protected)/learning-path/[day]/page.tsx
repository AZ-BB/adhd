import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/server'
import { getUserByAuthId } from '@/actions/users'
import { getDayProgressDetails, getDayAvailability } from '@/actions/learning-path'
import LearningDayClientAr from './LearningDayClientAr'

interface PageProps {
  params: {
    day: string
  }
}

export default async function LearningDayPage({ params }: PageProps) {
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
  
  const dayNumber = parseInt(params.day)
  
  if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 30) {
    redirect('/learning-path')
  }
  
  // Check if user can access this day
  const availability = await getDayAvailability(user.id, dayNumber)
  
  if (!availability.canAccess) {
    // Redirect back with info about why they can't access
    redirect('/learning-path')
  }
  
  // Get day details with progress
  const dayDetails = await getDayProgressDetails(user.id, dayNumber)
  
  if (!dayDetails) {
    redirect('/learning-path')
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <LearningDayClientAr 
          dayDetails={dayDetails}
          userId={user.id}
        />
      </div>
    </div>
  )
}


import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/server"
import Link from "next/link"
import { getUserLearningPathStats, getUserAllDayProgress } from "@/actions/learning-path"

export default async function DashboardPageEn() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login/en")
  }

  const { data: profile } = await supabase
    .from("users")
    .select(
      "id, created_at, child_first_name, child_last_name, child_birthday, child_gender, parent_first_name, parent_last_name, parent_phone, parent_nationality, initial_quiz_score"
    )
    .eq("auth_id", user.id)
    .maybeSingle()

  // Get learning path stats
  let learningStats = null
  let dayProgress: any[] = []
  if (profile) {
    try {
      learningStats = await getUserLearningPathStats(profile.id)
      dayProgress = await getUserAllDayProgress(profile.id)
    } catch (error) {
      console.error("Error fetching learning path stats:", error)
    }
  }

  function calculateAge(value?: string | null) {
    if (!value) return null
    const birth = new Date(value)
    if (Number.isNaN(birth.getTime())) return null
    const now = new Date()
    let age = now.getFullYear() - birth.getFullYear()
    const hasNotHadBirthdayThisYear =
      now.getMonth() < birth.getMonth() ||
      (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
    if (hasNotHadBirthdayThisYear) age -= 1
    return age
  }

  const age = calculateAge(profile?.child_birthday)

  return (
    <div className="max-w-7xl mx-auto">
      {/* Language Switcher */}
      {/* <div className="flex justify-end mb-4">
        <a
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-md border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-white shadow-sm transition-all"
        >
          عربي
        </a>
      </div> */}
      
      {!profile ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="rounded-3xl border-4 border-dashed border-purple-300 bg-white/90 p-8 max-w-md text-center shadow-2xl">
            <div className="text-6xl mb-4">🎈</div>
            <p className="text-xl font-bold text-gray-900 mb-2">Almost There!</p>
            <p className="text-gray-600">
              Complete your signup to unlock your personalized dashboard!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 text-9xl opacity-20">🎉</div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-black mb-2">
                Hey, {profile.child_first_name}! 👋
              </h1>
              <p className="text-xl md:text-2xl font-semibold opacity-90">
                Welcome to Your Super Dashboard!
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Training Journey Card */}
            <div className="bg-gradient-to-br from-emerald-400 to-green-600 rounded-3xl p-6 shadow-xl text-white transform hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">🚀</div>
                <div className="bg-white/30 backdrop-blur rounded-full px-3 py-1 text-sm font-bold">
                  Training Journey
                </div>
              </div>
              <div className="text-6xl font-black mb-2">
                {learningStats?.completedDays || 0}
              </div>
              <div className="text-xl font-bold">
                {learningStats?.completedDays === 1 ? 'Day Completed!' : 'Days Completed!'}
              </div>
              <div className="mt-4 text-sm opacity-90">
                {learningStats?.completedDays === 0 
                  ? 'Start your training today!' 
                  : `${learningStats?.totalDays! - learningStats?.completedDays!} days remaining`}
              </div>
            </div>

            {/* Streak Card */}
            <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-6 shadow-xl text-white transform hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">🔥</div>
                <div className="bg-white/30 backdrop-blur rounded-full px-3 py-1 text-sm font-bold">
                  Streak
                </div>
              </div>
              <div className="text-6xl font-black mb-2">
                {learningStats?.streak || 0}
              </div>
              <div className="text-xl font-bold">
                {learningStats?.streak === 1 ? 'Day in a Row!' : 'Days in a Row!'}
              </div>
              <div className="mt-4 text-sm opacity-90">
                {learningStats?.streak === 0 
                  ? 'Start your streak today!' 
                  : 'Keep the momentum going!'}
              </div>
            </div>

            {/* Age Card */}
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl p-6 shadow-xl text-white transform hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">🎂</div>
                <div className="bg-white/30 backdrop-blur rounded-full px-3 py-1 text-sm font-bold">
                  Birthday
                </div>
              </div>
              <div className="text-6xl font-black mb-2">{age}</div>
              <div className="text-xl font-bold">Years Young!</div>
              <div className="mt-4 text-sm opacity-90">
                {new Date(profile.child_birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Learning Path Progress */}
          {learningStats && learningStats.totalDays > 0 && (
            <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-xl border-4 border-purple-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-4xl">📚</div>
                <h2 className="text-2xl font-black text-gray-800">Learning Path</h2>
              </div>
              
              {/* Overall Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-700">
                    Overall Progress
                  </span>
                  <span className="text-sm font-semibold text-purple-600">
                    {Math.round((learningStats.completedDays / learningStats.totalDays) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${(learningStats.completedDays / learningStats.totalDays) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>{learningStats.completedDays} completed</span>
                  <span>{learningStats.totalDays} total</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-4 text-center border-2 border-purple-300">
                  <div className="text-3xl font-black text-purple-600 mb-1">
                    {learningStats.currentDay}
                  </div>
                  <div className="text-xs font-bold text-gray-700">Current Day</div>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4 text-center border-2 border-blue-300">
                  <div className="text-3xl font-black text-blue-600 mb-1">
                    {learningStats.totalGamesCompleted}
                  </div>
                  <div className="text-xs font-bold text-gray-700">Games Completed</div>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-4 text-center border-2 border-green-300">
                  <div className="text-3xl font-black text-green-600 mb-1">
                    {learningStats.averageScore}
                  </div>
                  <div className="text-xs font-bold text-gray-700">Average Score</div>
                </div>
                
              </div>

              {/* Recent Days */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Recent Days</h3>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {Array.from({ length: Math.min(10, learningStats.currentDay) }, (_, i) => {
                    const dayNum = learningStats.currentDay - i
                    const dayProg = dayProgress.find(p => {
                      const day = p.learning_day as any
                      return day?.day_number === dayNum
                    })
                    const isCompleted = dayProg?.is_completed || false
                    
                    return (
                      <div
                        key={dayNum}
                        className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold border-2 ${
                          isCompleted
                            ? 'bg-green-500 border-green-600 text-white'
                            : dayNum === learningStats.currentDay
                            ? 'bg-blue-500 border-blue-600 text-white animate-pulse'
                            : 'bg-gray-200 border-gray-300 text-gray-500'
                        }`}
                      >
                        {dayNum}
                      </div>
                    )
                  }).reverse()}
                </div>
              </div>
            </div>
          )}

          {/* Achievements Section */}
          <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-xl border-4 border-purple-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">🏆</div>
              <h2 className="text-2xl font-black text-gray-800">Your Achievements</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-4 text-center border-2 border-yellow-300">
                <div className="text-4xl mb-2">🎯</div>
                <div className="text-sm font-bold text-gray-700">Quiz Master</div>
              </div>
              <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-4 text-center border-2 border-pink-300">
                <div className="text-4xl mb-2">🌈</div>
                <div className="text-sm font-bold text-gray-700">First Steps</div>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4 text-center border-2 border-blue-300 opacity-50">
                <div className="text-4xl mb-2">🎨</div>
                <div className="text-sm font-bold text-gray-700">Creative Thinker</div>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-4 text-center border-2 border-purple-300 opacity-50">
                <div className="text-4xl mb-2">⚡</div>
                <div className="text-sm font-bold text-gray-700">Speed Racer</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/quiz/en" className="group bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 shadow-xl text-white hover:shadow-2xl transform hover:scale-105 transition-all">
              <div className="flex items-center gap-4">
                <div className="text-6xl group-hover:animate-bounce">📝</div>
                <div>
                  <h3 className="text-2xl font-black mb-1">Take a Quiz</h3>
                  <p className="text-indigo-100">Test your knowledge and have fun!</p>
                </div>
              </div>
            </Link>

            <Link href="/learning-path/en" className="group bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-8 shadow-xl text-white hover:shadow-2xl transform hover:scale-105 transition-all">
              <div className="flex items-center gap-4">
                <div className="text-6xl group-hover:animate-bounce">🎮</div>
                <div>
                  <h3 className="text-2xl font-black mb-1">Play Games</h3>
                  <p className="text-teal-100">
                    {learningStats?.completedDays === 0 
                      ? 'Start your learning journey!' 
                      : `Day ${learningStats?.currentDay} awaits!`}
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Parent Info (Collapsed) */}
          <details className="bg-white/70 backdrop-blur rounded-3xl shadow-lg border-2 border-gray-200 overflow-hidden">
            <summary className="cursor-pointer p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="text-3xl">👨‍👩‍👧‍👦</div>
                <h2 className="text-xl font-bold text-gray-800">Parent Information</h2>
              </div>
            </summary>
            <div className="px-6 pb-6 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500 font-medium">Parent Name</div>
                <div className="text-gray-800 font-semibold">
                  {profile.parent_first_name} {profile.parent_last_name}
                </div>
              </div>
              <div>
                <div className="text-gray-500 font-medium">Phone</div>
                <div className="text-gray-800 font-semibold">{profile.parent_phone || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500 font-medium">Email</div>
                <div className="text-gray-800 font-semibold">{user?.email}</div>
              </div>
              <div>
                <div className="text-gray-500 font-medium">Nationality</div>
                <div className="text-gray-800 font-semibold">{profile.parent_nationality || "—"}</div>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  )
}



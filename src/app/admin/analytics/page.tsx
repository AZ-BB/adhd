import { getAllUsers, getQuizAnalytics } from "@/actions/admin"

export default async function AdminAnalyticsPage() {
  const users = await getAllUsers()
  const quizAnalytics = await getQuizAnalytics()

  // Normalize user data to ensure all numeric fields are numbers (not null/undefined)
  const normalizedUsers = users.map((user) => ({
    ...user,
    completed_days: Number(user.completed_days) || 0,
    total_games_completed: Number(user.total_games_completed) || 0,
    overall_avg_score: Number(user.overall_avg_score) || 0,
    total_time_spent: Number(user.total_time_spent) || 0,
    initial_quiz_score: Number(user.initial_quiz_score) || 0,
  }))

  // Calculate various analytics
  const totalUsers = normalizedUsers.length
  const usersWithProgress = normalizedUsers.filter((u) => u.completed_days > 0).length
  const totalDaysCompleted = normalizedUsers.reduce((sum, u) => sum + u.completed_days, 0)
  const totalGamesPlayed = normalizedUsers.reduce((sum, u) => sum + u.total_games_completed, 0)
  const totalTimeSpent = normalizedUsers.reduce((sum, u) => sum + u.total_time_spent, 0)

  // Calculate engagement rate
  const engagementRate = totalUsers > 0 ? Math.round((usersWithProgress / totalUsers) * 100) : 0

  // Average metrics
  const avgDaysCompleted = totalUsers > 0 ? Math.round(totalDaysCompleted / totalUsers) : 0
  const avgGamesPlayed = totalUsers > 0 ? Math.round(totalGamesPlayed / totalUsers) : 0
  const avgTimeSpent = totalUsers > 0 ? Math.round(totalTimeSpent / totalUsers / 60) : 0 // in minutes

  // Gender distribution
  const genderDistribution = normalizedUsers.reduce(
    (acc, user) => {
      if (user.child_gender === "male") acc.male++
      else if (user.child_gender === "female") acc.female++
      return acc
    },
    { male: 0, female: 0 }
  )

  // Age distribution
  const ageDistribution = normalizedUsers.reduce(
    (acc, user) => {
      const birth = new Date(user.child_birthday)
      const now = new Date()
      let age = now.getFullYear() - birth.getFullYear()
      const hasNotHadBirthdayThisYear =
        now.getMonth() < birth.getMonth() ||
        (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
      if (hasNotHadBirthdayThisYear) age -= 1

      if (age <= 5) acc["0-5"]++
      else if (age <= 8) acc["6-8"]++
      else if (age <= 12) acc["9-12"]++
      else acc["13+"]++
      return acc
    },
    { "0-5": 0, "6-8": 0, "9-12": 0, "13+": 0 }
  )

  // Top performers
  const topPerformers = [...normalizedUsers]
    .sort((a, b) => b.completed_days - a.completed_days)
    .slice(0, 5)

  // Recent registrations
  const recentRegistrations = [...normalizedUsers]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white">Analytics & Insights</h1>
        <p className="text-gray-400 mt-1">Comprehensive platform statistics and metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">👥</span>
            <div>
              <div className="text-3xl font-black text-white">{totalUsers}</div>
              <div className="text-sm text-blue-300">Total Users</div>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {usersWithProgress} active ({engagementRate}% engagement)
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">📚</span>
            <div>
              <div className="text-3xl font-black text-white">{totalDaysCompleted}</div>
              <div className="text-sm text-purple-300">Total Days</div>
            </div>
          </div>
          <div className="text-xs text-gray-400">Avg {avgDaysCompleted} days per user</div>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🎮</span>
            <div>
              <div className="text-3xl font-black text-white">{totalGamesPlayed}</div>
              <div className="text-sm text-green-300">Total Games</div>
            </div>
          </div>
          <div className="text-xs text-gray-400">Avg {avgGamesPlayed} games per user</div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>👫</span> Gender Distribution
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Male</span>
                <span className="text-sm font-bold text-white">{genderDistribution.male}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                  style={{
                    width: `${totalUsers > 0 ? (genderDistribution.male / totalUsers) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Female</span>
                <span className="text-sm font-bold text-white">{genderDistribution.female}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-pink-500 to-pink-600 h-3 rounded-full"
                  style={{
                    width: `${totalUsers > 0 ? (genderDistribution.female / totalUsers) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Age Distribution */}
        <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🎂</span> Age Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(ageDistribution).map(([range, count]) => (
              <div key={range}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">{range} years</span>
                  <span className="text-sm font-bold text-white">{count}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full"
                    style={{
                      width: `${totalUsers > 0 ? (count / totalUsers) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz Analytics */}
      <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📝</span> Quiz Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-4xl font-black text-white mb-2">
              {quizAnalytics.avgInitialScore}
            </div>
            <div className="text-sm text-gray-400">Average Initial Score</div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-300 mb-3">Category Scores</h4>
            <div className="space-y-2">
              {Object.entries(quizAnalytics.categoryBreakdown).map(([category, score]) => (
                <div key={category} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 capitalize">{category.replace(/_/g, " ")}</span>
                  <span className="font-bold text-white">{score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🏆</span> Top Performers
        </h3>
        <div className="space-y-3">
          {topPerformers.map((user, index) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl font-black text-yellow-400">#{index + 1}</div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {user.child_first_name} {user.child_last_name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {user.total_games_completed} games • Avg {Math.round(user.overall_avg_score)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">{user.completed_days}</div>
                <div className="text-xs text-gray-400">days</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🆕</span> Recent Registrations
        </h3>
        <div className="space-y-3">
          {recentRegistrations.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
            >
              <div>
                <div className="text-sm font-semibold text-white">
                  {user.child_first_name} {user.child_last_name}
                </div>
                <div className="text-xs text-gray-400">
                  Parent: {user.parent_first_name} {user.parent_last_name}
                </div>
              </div>
              <div className="text-sm text-gray-400">{formatDate(user.created_at)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


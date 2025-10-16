import { getDashboardStats, getQuizAnalytics } from "@/actions/admin"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()
  const quizAnalytics = await getQuizAnalytics()

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white">Dashboard Overview</h1>
          <p className="text-gray-400 mt-1">Welcome to the admin control center</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 shadow-xl text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="text-5xl">👥</div>
            <div className="bg-white/20 backdrop-blur rounded-full px-3 py-1 text-xs font-bold">
              USERS
            </div>
          </div>
          <div className="text-5xl font-black mb-2">{stats.totalUsers}</div>
          <div className="text-lg font-semibold text-blue-100">Total Users</div>
        </div>

        {/* Active Users */}
        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 shadow-xl text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="text-5xl">✅</div>
            <div className="bg-white/20 backdrop-blur rounded-full px-3 py-1 text-xs font-bold">
              ACTIVE
            </div>
          </div>
          <div className="text-5xl font-black mb-2">{stats.activeUsers}</div>
          <div className="text-lg font-semibold text-green-100">Active (7 days)</div>
        </div>

        {/* Learning Days */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 shadow-xl text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="text-5xl">📚</div>
            <div className="bg-white/20 backdrop-blur rounded-full px-3 py-1 text-xs font-bold">
              PROGRESS
            </div>
          </div>
          <div className="text-5xl font-black mb-2">{stats.totalLearningDaysCompleted}</div>
          <div className="text-lg font-semibold text-purple-100">Days Completed</div>
        </div>

        {/* Completion Rate */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-6 shadow-xl text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="text-5xl">🎯</div>
            <div className="bg-white/20 backdrop-blur rounded-full px-3 py-1 text-xs font-bold">
              RATE
            </div>
          </div>
          <div className="text-5xl font-black mb-2">{stats.avgCompletionRate}%</div>
          <div className="text-lg font-semibold text-orange-100">Avg Completion</div>
        </div>
      </div>

      {/* Quiz Analytics */}
      <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-4xl">📝</div>
          <h2 className="text-2xl font-black text-white">Quiz Analytics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-500/20 rounded-xl p-3">
                <span className="text-3xl">📊</span>
              </div>
              <div>
                <div className="text-3xl font-black text-white">
                  {quizAnalytics.avgInitialScore}
                </div>
                <div className="text-sm text-gray-400">Average Initial Score</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-green-500/20 rounded-xl p-3">
                <span className="text-3xl">✍️</span>
              </div>
              <div>
                <div className="text-3xl font-black text-white">
                  {quizAnalytics.totalQuizzesTaken}
                </div>
                <div className="text-sm text-gray-400">Total Quizzes Taken</div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-300 mb-3">Category Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(quizAnalytics.categoryBreakdown).map(([category, score]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 capitalize">
                    {category.replace(/_/g, " ")}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-white w-12 text-right">
                      {score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/users"
          className="group bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:border-purple-400/80"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl group-hover:scale-110 transition-transform">👥</div>
            <div>
              <h3 className="text-xl font-bold text-white">Manage Users</h3>
              <p className="text-sm text-gray-400">View and manage user accounts</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/analytics"
          className="group bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:border-blue-400/80"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl group-hover:scale-110 transition-transform">📈</div>
            <div>
              <h3 className="text-xl font-bold text-white">Analytics</h3>
              <p className="text-sm text-gray-400">Detailed reports and insights</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/content"
          className="group bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:border-green-400/80"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl group-hover:scale-110 transition-transform">📚</div>
            <div>
              <h3 className="text-xl font-bold text-white">Content</h3>
              <p className="text-sm text-gray-400">Manage learning materials</p>
            </div>
          </div>
        </Link>
      </div>

      {/* System Status */}
      <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">🔧</div>
          <h2 className="text-2xl font-black text-white">System Status</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <span className="text-sm text-gray-300">Database</span>
            <span className="text-xs font-bold text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Online
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <span className="text-sm text-gray-300">API</span>
            <span className="text-xs font-bold text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Online
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <span className="text-sm text-gray-300">Auth</span>
            <span className="text-xs font-bold text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Online
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}


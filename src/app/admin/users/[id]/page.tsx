import { getUserDetails } from "@/actions/admin"
import { requireAdmin } from "@/lib/admin"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function AdminUserDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const adminUser = await requireAdmin()
  const isSuperAdmin = adminUser.is_super_admin
  const userId = parseInt(params.id)
  if (isNaN(userId)) {
    notFound()
  }

  const userDetails = await getUserDetails(userId)
  if (!userDetails) {
    notFound()
  }

  const { user, progress } = userDetails

  function calculateAge(dateString: string) {
    const birth = new Date(dateString)
    const now = new Date()
    let age = now.getFullYear() - birth.getFullYear()
    const hasNotHadBirthdayThisYear =
      now.getMonth() < birth.getMonth() ||
      (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
    if (hasNotHadBirthdayThisYear) age -= 1
    return age
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  function formatTime(seconds: number) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const completedProgress = progress?.filter((p) => p.is_completed) || []
  const totalTimeSpent = completedProgress.reduce((sum, p) => sum + (p.time_spent || 0), 0)
  const avgScore =
    completedProgress.length > 0
      ? Math.round(
          completedProgress.reduce((sum, p) => sum + (p.average_score || 0), 0) /
            completedProgress.length
        )
      : 0

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
      >
        ← Back to Users
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/50 rounded-2xl p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">
              {user.child_first_name} {user.child_last_name}
            </h1>
            <div className="flex items-center gap-4 text-gray-300">
              <span>
                {user.child_gender === "male" ? "👦" : "👧"} {calculateAge(user.child_birthday)}{" "}
                years old
              </span>
              <span>•</span>
              <span>Joined {formatDate(user.created_at)}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-white">{user.initial_quiz_score}</div>
            <div className="text-sm text-gray-400">Initial Quiz Score</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <div className="text-4xl mb-2">📚</div>
          <div className="text-3xl font-black text-white">{completedProgress.length}</div>
          <div className="text-sm text-gray-400">Days Completed</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
          <div className="text-4xl mb-2">🎮</div>
          <div className="text-3xl font-black text-white">
            {completedProgress.reduce((sum, p) => sum + (p.games_completed || 0), 0)}
          </div>
          <div className="text-sm text-gray-400">Games Played</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
          <div className="text-4xl mb-2">⏱️</div>
          <div className="text-3xl font-black text-white">{formatTime(totalTimeSpent)}</div>
          <div className="text-sm text-gray-400">Time Spent</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
          <div className="text-4xl mb-2">🎯</div>
          <div className="text-3xl font-black text-white">{avgScore}</div>
          <div className="text-sm text-gray-400">Average Score</div>
        </div>
      </div>

      {/* Parent Information */}
      <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>👨‍👩‍👧‍👦</span> Parent Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
            <div className="text-white">
              {user.parent_first_name} {user.parent_last_name}
            </div>
          </div>
          {isSuperAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
              <div className="text-white">{user.parent_phone || "—"}</div>
            </div>
          )}
          {isSuperAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <div className="text-white">{user.email || "—"}</div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nationality</label>
            <div className="text-white">{user.parent_nationality || "—"}</div>
          </div>
        </div>
      </div>

      {/* Learning Progress */}
      <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📈</span> Learning Progress
        </h3>
        {completedProgress.length > 0 ? (
          <div className="space-y-3">
            {completedProgress
              .sort((a, b) => {
                const aDay = (a.learning_day as any)?.day_number || 0
                const bDay = (b.learning_day as any)?.day_number || 0
                return bDay - aDay
              })
              .map((p) => {
                const learningDay = p.learning_day as any
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-600/30 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold">
                        {learningDay?.day_number || "?"}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {learningDay?.title || learningDay?.title_ar || "Learning Day"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {p.games_completed || 0} games • {formatTime(p.time_spent || 0)} •
                          Score: {Math.round(p.average_score || 0)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">
                        {formatDate(p.updated_at || p.created_at)}
                      </div>
                      {p.is_completed && (
                        <div className="text-xs text-green-400 font-bold">✓ Completed</div>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-xl text-gray-400">No learning progress yet</p>
          </div>
        )}
      </div>
    </div>
  )
}


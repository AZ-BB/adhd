import { getAllUsers } from "@/actions/admin"
import Link from "next/link"

export default async function AdminUsersPage() {
  const users = await getAllUsers()

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

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

  function formatTime(seconds: number) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white">User Management</h1>
          <p className="text-gray-400 mt-1">View and manage all registered users</p>
        </div>
        <div className="text-sm text-gray-400">
          Total: <span className="text-white font-bold">{users.length}</span> users
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="text-3xl font-black text-blue-400">{users.length}</div>
          <div className="text-sm text-gray-400">Total Users</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="text-3xl font-black text-green-400">
            {users.filter((u) => u.completed_days > 0).length}
          </div>
          <div className="text-sm text-gray-400">Active Learners</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="text-3xl font-black text-purple-400">
            {Math.round(
              users.reduce((sum, u) => sum + u.completed_days, 0) / (users.length || 1)
            )}
          </div>
          <div className="text-sm text-gray-400">Avg Days Completed</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <div className="text-3xl font-black text-orange-400">
            {Math.round(
              users.reduce((sum, u) => sum + u.overall_avg_score, 0) / (users.length || 1)
            )}
          </div>
          <div className="text-sm text-gray-400">Avg Score</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-900/30 border-b border-purple-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Child Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Parent
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Initial Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Time Spent
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-800/30">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-purple-900/10 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-white">
                      {user.child_first_name} {user.child_last_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.child_gender === "male" ? "👦" : "👧"}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {calculateAge(user.child_birthday)} years
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {user.parent_first_name} {user.parent_last_name}
                    </div>
                    <div className="text-xs text-gray-500">{user.parent_phone || "—"}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold text-white">
                        {user.initial_quiz_score}
                      </div>
                      <div className="w-16 bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                          style={{ width: `${user.initial_quiz_score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-white">
                      {user.completed_days} days
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.total_games_completed} games • Avg {Math.round(user.overall_avg_score)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {formatTime(user.total_time_spent)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400">{formatDate(user.created_at)}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      View Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-xl text-gray-400">No users registered yet</p>
        </div>
      )}
    </div>
  )
}


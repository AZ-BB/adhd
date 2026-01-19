import { getAllUsers } from "@/actions/admin"
import { requireAdmin } from "@/lib/admin"
import UsersTableClient from "./UsersTableClient"

export default async function AdminUsersPage() {
  const adminUser = await requireAdmin()
  const isSuperAdmin = adminUser.is_super_admin
  const users = await getAllUsers()

  // Normalize user data to ensure all numeric fields are numbers (not null/undefined)
  const normalizedUsers = users.map((user) => ({
    ...user,
    completed_days: Number(user.completed_days) || 0,
    total_games_completed: Number(user.total_games_completed) || 0,
    overall_avg_score: Number(user.overall_avg_score) || 0,
    total_time_spent: Number(user.total_time_spent) || 0,
    initial_quiz_score: Number(user.initial_quiz_score) || 0,
  }))

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
          <div className="text-3xl font-black text-blue-400">{normalizedUsers.length}</div>
          <div className="text-sm text-gray-400">Total Users</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="text-3xl font-black text-green-400">
            {normalizedUsers.filter((u) => u.completed_days > 0).length}
          </div>
          <div className="text-sm text-gray-400">Active Learners</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="text-3xl font-black text-purple-400">
            {normalizedUsers.length > 0
              ? Math.round(
                  normalizedUsers.reduce((sum, u) => sum + u.completed_days, 0) /
                    normalizedUsers.length
                )
              : 0}
          </div>
          <div className="text-sm text-gray-400">Avg Days Completed</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <div className="text-3xl font-black text-orange-400">
            {normalizedUsers.length > 0
              ? Math.round(
                  normalizedUsers.reduce((sum, u) => sum + u.overall_avg_score, 0) /
                    normalizedUsers.length
                )
              : 0}
          </div>
          <div className="text-sm text-gray-400">Avg Score</div>
        </div>
      </div>

      {/* Users Table */}
      <UsersTableClient users={normalizedUsers} isSuperAdmin={isSuperAdmin} />

      {users.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-xl text-gray-400">No users registered yet</p>
        </div>
      )}
    </div>
  )
}


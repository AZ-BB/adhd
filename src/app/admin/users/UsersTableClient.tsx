"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { deleteUser } from "@/actions/admin"
import type { UserStats } from "@/actions/admin"

interface UsersTableClientProps {
  users: UserStats[]
  isSuperAdmin: boolean
}

export default function UsersTableClient({ users, isSuperAdmin }: UsersTableClientProps) {
  const router = useRouter()
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const handleDelete = async (userId: number, userName: string) => {
    if (!isSuperAdmin) {
      setError("Only super admins can delete users")
      return
    }

    setDeletingUserId(userId)
    setError(null)

    try {
      await deleteUser(userId)
      // Refresh the page to show updated user list
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to delete user")
      setDeletingUserId(null)
    }
  }

  // Normalize user data
  const normalizedUsers = users.map((user) => ({
    ...user,
    completed_days: Number(user.completed_days) || 0,
    total_games_completed: Number(user.total_games_completed) || 0,
    overall_avg_score: Number(user.overall_avg_score) || 0,
    total_time_spent: Number(user.total_time_spent) || 0,
    initial_quiz_score: Number(user.initial_quiz_score) || 0,
  }))

  return (
    <>
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          {error}
        </div>
      )}

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
                {isSuperAdmin && (
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                )}
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
              {normalizedUsers.map((user) => (
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
                    {isSuperAdmin && (
                      <div className="text-xs text-gray-500">{user.parent_phone || "—"}</div>
                    )}
                  </td>
                  {isSuperAdmin && (
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {user.email || "—"}
                      </div>
                    </td>
                  )}
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
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 rounded transition-colors"
                        title="View Details"
                      >
                        <span className="text-lg">👁️</span>
                      </Link>
                      {isSuperAdmin && (
                        <button
                          onClick={() => setShowConfirmDialog(user.id)}
                          disabled={deletingUserId === user.id}
                          className="inline-flex items-center justify-center w-8 h-8 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete User"
                        >
                          {deletingUserId === user.id ? (
                            <span className="text-lg animate-spin">⏳</span>
                          ) : (
                            <span className="text-lg">🗑️</span>
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/90 border border-purple-500/50 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                {normalizedUsers.find((u) => u.id === showConfirmDialog)?.child_first_name}{" "}
                {normalizedUsers.find((u) => u.id === showConfirmDialog)?.child_last_name}
              </span>
              ? This action cannot be undone and will delete all associated data including progress, subscriptions, and sessions.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirmDialog(null)
                  setError(null)
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const user = normalizedUsers.find((u) => u.id === showConfirmDialog)
                  if (user) {
                    handleDelete(
                      user.id,
                      `${user.child_first_name} ${user.child_last_name}`
                    )
                    setShowConfirmDialog(null)
                  }
                }}
                disabled={deletingUserId === showConfirmDialog}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingUserId === showConfirmDialog ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminListItem, createAdmin, updateAdminRole, deleteAdmin, resetAdminPassword } from '@/actions/admin'

interface AdminsClientProps {
  initialAdmins: AdminListItem[]
  currentAdminId: number
}

export default function AdminsClient({ initialAdmins, currentAdminId }: AdminsClientProps) {
  const router = useRouter()
  const [admins, setAdmins] = useState(initialAdmins)
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [resettingPasswordFor, setResettingPasswordFor] = useState<AdminListItem | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    isSuperAdmin: false,
  })

  const handleCreate = () => {
    setIsCreating(true)
    setError(null)
    setSuccess(null)
    setFormData({
      email: '',
      password: '',
      name: '',
      isSuperAdmin: false,
    })
  }

  const handleCancel = () => {
    setIsCreating(false)
    setError(null)
    setSuccess(null)
    setFormData({
      email: '',
      password: '',
      name: '',
      isSuperAdmin: false,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      const newAdmin = await createAdmin(
        formData.email,
        formData.password,
        formData.name,
        formData.isSuperAdmin
      )
      
      setAdmins([newAdmin as AdminListItem, ...admins])
      setSuccess('Admin created successfully!')
      setIsCreating(false)
      setFormData({
        email: '',
        password: '',
        name: '',
        isSuperAdmin: false,
      })
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to create admin')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleRole = async (admin: AdminListItem) => {
    if (admin.id === currentAdminId) {
      setError('You cannot change your own role')
      return
    }

    if (!confirm(`Are you sure you want to ${admin.is_super_admin ? 'demote' : 'promote'} this admin?`)) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      await updateAdminRole(admin.id, !admin.is_super_admin)
      setAdmins(admins.map(a => 
        a.id === admin.id 
          ? { ...a, is_super_admin: !a.is_super_admin, role: !a.is_super_admin ? 'super_admin' : 'admin' }
          : a
      ))
      setSuccess(`Admin ${admin.is_super_admin ? 'demoted' : 'promoted'} successfully!`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to update admin role')
    }
  }

  const handleDelete = async (admin: AdminListItem) => {
    if (admin.id === currentAdminId) {
      setError('You cannot delete your own admin account')
      return
    }

    if (!confirm(`Are you sure you want to remove admin access from ${admin.name}? They will become a regular user.`)) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      await deleteAdmin(admin.id)
      setAdmins(admins.filter(a => a.id !== admin.id))
      setSuccess('Admin removed successfully!')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to delete admin')
    }
  }

  const handleResetPassword = (admin: AdminListItem) => {
    setResettingPasswordFor(admin)
    setNewPassword('')
    setConfirmPassword('')
    setError(null)
    setSuccess(null)
  }

  const handleCancelPasswordReset = () => {
    setResettingPasswordFor(null)
    setNewPassword('')
    setConfirmPassword('')
    setError(null)
    setSuccess(null)
  }

  const handleSubmitPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!resettingPasswordFor) return

    if (!newPassword || !confirmPassword) {
      setError('Please enter both password fields')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setError(null)
    setSuccess(null)
    setIsResettingPassword(true)

    try {
      await resetAdminPassword(resettingPasswordFor.id, newPassword)
      setSuccess(`Password reset successfully for ${resettingPasswordFor.name}!`)
      setResettingPasswordFor(null)
      setNewPassword('')
      setConfirmPassword('')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setIsResettingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
          <p className="text-green-300 text-sm">{success}</p>
        </div>
      )}

      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Admin Management</h2>
          <p className="text-gray-400 text-sm mt-1">Manage admin and super admin accounts</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          + Create Admin
        </button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Create New Admin</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                placeholder="John Doe"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isSuperAdmin"
                checked={formData.isSuperAdmin}
                onChange={(e) => setFormData({ ...formData, isSuperAdmin: e.target.checked })}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="isSuperAdmin" className="text-sm text-gray-300">
                Grant Super Admin privileges
              </label>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Admin'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Reset Modal */}
      {resettingPasswordFor && (
        <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Reset Password for {resettingPasswordFor.name}</h3>
          <form onSubmit={handleSubmitPasswordReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">New Password *</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                placeholder="Minimum 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Password *</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isResettingPassword}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResettingPassword ? 'Resetting...' : 'Reset Password'}
              </button>
              <button
                type="button"
                onClick={handleCancelPasswordReset}
                disabled={isResettingPassword}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admins List */}
      <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-purple-800/50">
          <h3 className="text-xl font-bold text-white">All Admins</h3>
          <p className="text-gray-400 text-sm mt-1">{admins.length} admin{admins.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-900/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-800/50">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No admins found
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-purple-900/10">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{admin.name}</div>
                      {admin.id === currentAdminId && (
                        <div className="text-xs text-purple-400 mt-1">(You)</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{admin.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {admin.is_super_admin ? (
                          <span className="px-2 py-1 bg-yellow-600/20 border border-yellow-500/50 rounded text-yellow-300 text-xs font-medium">
                            Super Admin
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-purple-600/20 border border-purple-500/50 rounded text-purple-300 text-xs font-medium">
                            Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">
                        {new Date(admin.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {admin.id !== currentAdminId && (
                          <>
                            <button
                              onClick={() => handleResetPassword(admin)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="Reset Password"
                            >
                              🔑
                            </button>
                            <button
                              onClick={() => handleToggleRole(admin)}
                              className="text-purple-400 hover:text-purple-300 transition-colors"
                              title={admin.is_super_admin ? 'Demote to Admin' : 'Promote to Super Admin'}
                            >
                              {admin.is_super_admin ? '⬇️' : '⬆️'}
                            </button>
                            <button
                              onClick={() => handleDelete(admin)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Remove Admin Access"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                        {admin.id === currentAdminId && (
                          <span className="text-gray-500 text-xs">Current user</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


import { requireAdmin } from "@/lib/admin"

export default async function AdminSettingsPage() {
  const adminUser = await requireAdmin()

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your admin account and system preferences</p>
      </div>

      {/* Admin Profile */}
      <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>👤</span> Admin Profile
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={adminUser.name}
              disabled
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={adminUser.email}
              disabled
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/50 rounded text-purple-300 text-sm font-medium">
                Admin
              </span>
              {adminUser.is_super_admin && (
                <span className="px-3 py-1 bg-yellow-600/20 border border-yellow-500/50 rounded text-yellow-300 text-sm font-medium">
                  Super Admin
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>⚙️</span> System Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
            <div>
              <div className="text-sm font-medium text-white">Email Notifications</div>
              <div className="text-xs text-gray-400">Receive email updates about system activity</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer opacity-50">
              <input type="checkbox" className="sr-only peer" disabled />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
            <div>
              <div className="text-sm font-medium text-white">Maintenance Mode</div>
              <div className="text-xs text-gray-400">Temporarily disable user access</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer opacity-50">
              <input type="checkbox" className="sr-only peer" disabled />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
            <div>
              <div className="text-sm font-medium text-white">Debug Mode</div>
              <div className="text-xs text-gray-400">Enable detailed logging</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer opacity-50">
              <input type="checkbox" className="sr-only peer" disabled />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300">
            💡 Settings management features are coming soon
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-900/20 backdrop-blur border border-red-800/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
          <span>⚠️</span> Danger Zone
        </h3>
        <div className="space-y-3">
          <p className="text-sm text-gray-400">
            Dangerous actions that can affect the entire system. Use with caution.
          </p>
          <button
            disabled
            className="px-4 py-2 bg-red-600/20 border border-red-500/50 rounded-lg text-red-300 text-sm font-medium hover:bg-red-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear All User Data (Disabled)
          </button>
        </div>
      </div>
    </div>
  )
}


import { requireAdmin } from "@/lib/admin"
import { AdminListItem, getAllAdmins } from "@/actions/admin"
import AdminsClient from "./AdminsClient"

export default async function AdminSettingsPage() {
  const adminUser = await requireAdmin()

  // Only super admins can access this page
  if (!adminUser.is_super_admin) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-900/20 border border-red-800/50 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h2>
          <p className="text-gray-300">
            Only super admins can manage admin accounts.
          </p>
        </div>
      </div>
    )
  }

  // Fetch all admins
  let admins: AdminListItem[] = []
  try {
    admins = await getAllAdmins()
  } catch (error: any) {
    console.error("Error fetching admins:", error)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <AdminsClient initialAdmins={admins} currentAdminId={adminUser.id} />
    </div>
  )
}


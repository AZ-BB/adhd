import { getAdminSoloSessionRequests } from "@/actions/solo-sessions"
import { getCoaches } from "@/actions/sessions"
import { requireAdmin } from "@/lib/admin"
import SoloSessionsAdminClient from "./SoloSessionsAdminClient"

export default async function AdminSoloSessionsPage() {
  const adminUser = await requireAdmin()
  const isSuperAdmin = adminUser.is_super_admin
  const [requests, coaches] = await Promise.all([
    getAdminSoloSessionRequests(),
    getCoaches()
  ])

  return <SoloSessionsAdminClient initialRequests={requests} coaches={coaches} isSuperAdmin={isSuperAdmin} />
}





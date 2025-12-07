import { getAdminSoloSessionRequests } from "@/actions/solo-sessions"
import { getCoaches } from "@/actions/sessions"
import { requireAdmin } from "@/lib/admin"
import SoloSessionsAdminClient from "./SoloSessionsAdminClient"

export default async function AdminSoloSessionsPage() {
  await requireAdmin()
  const [requests, coaches] = await Promise.all([
    getAdminSoloSessionRequests(),
    getCoaches()
  ])

  return <SoloSessionsAdminClient initialRequests={requests} coaches={coaches} />
}





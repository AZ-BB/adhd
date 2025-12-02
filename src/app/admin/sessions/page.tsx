import { getCoaches, getAdminSessions } from '@/actions/sessions'
import SessionsAdminClient from './SessionsAdminClient'
import { requireAdmin } from '@/lib/admin'

export default async function AdminSessionsPage() {
  await requireAdmin()
  const coaches = await getCoaches()
  const sessions = await getAdminSessions()

  return <SessionsAdminClient initialCoaches={coaches} initialSessions={sessions} />
}


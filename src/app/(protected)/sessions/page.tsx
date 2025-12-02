import { getCoaches, getSessions } from '@/actions/sessions'
import SessionsClient from './SessionsClient'

export default async function SessionsPage() {
  const coaches = await getCoaches()
  const sessions = await getSessions({ include_past: false }) // Only future sessions

  return <SessionsClient initialSessions={sessions} coaches={coaches} isRtl={true} />
}


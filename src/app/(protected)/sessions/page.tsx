import { getCoaches, getSessions } from '@/actions/sessions'
import { getMySoloSessionRequests } from '@/actions/solo-sessions'
import SessionsHub from './SessionsHub'

export default async function SessionsPage() {
  const coaches = await getCoaches()
  const [sessions, soloRequests] = await Promise.all([
    getSessions({ include_past: false }), // Only future sessions
    getMySoloSessionRequests(),
  ])

  return <SessionsHub initialSessions={sessions} coaches={coaches} initialSoloRequests={soloRequests} isRtl={true} />
}


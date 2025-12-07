import { getCoaches, getSessions } from '@/actions/sessions'
import { getMySoloSessionRequests } from '@/actions/solo-sessions'
import SessionsHub from '../SessionsHub'

export default async function SessionsPageEn() {
  const coaches = await getCoaches()
  const [sessions, soloRequests] = await Promise.all([
    getSessions({ include_past: false }),
    getMySoloSessionRequests(),
  ])

  return <SessionsHub initialSessions={sessions} coaches={coaches} initialSoloRequests={soloRequests} isRtl={false} />
}


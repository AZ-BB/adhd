import { getCoaches, getSessions } from '@/actions/sessions'
import SessionsClient from '../SessionsClient'

export default async function SessionsPageEn() {
  const coaches = await getCoaches()
  const sessions = await getSessions({ include_past: false })

  return <SessionsClient initialSessions={sessions} coaches={coaches} isRtl={false} />
}


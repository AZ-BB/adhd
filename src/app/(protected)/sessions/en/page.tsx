import { getCoaches, getSessions } from '@/actions/sessions'
import { getMySoloSessionRequests } from '@/actions/solo-sessions'
import { hasSubscriptionType, hasActiveSubscription } from '@/lib/subscription'
import SessionsHub from '../SessionsHub'

export default async function SessionsPageEn() {
  // Check if user has active subscription
  const hasSubscription = await hasActiveSubscription()
  
  // Get all sessions
  const coaches = await getCoaches()
  const [allSessions, soloRequests] = await Promise.all([
    getSessions({ include_past: false }),
    getMySoloSessionRequests(),
  ])

  // Check if user has group_sessions subscription (individual sessions are always available)
  const hasGroupSessions = await hasSubscriptionType('group_sessions')

  // Always allow access - SessionsClient will filter out paid sessions for non-subscribers
  return <SessionsHub initialSessions={allSessions} coaches={coaches} initialSoloRequests={soloRequests} isRtl={false} hasGroupSessions={hasGroupSessions} hasSubscription={hasSubscription} />
}


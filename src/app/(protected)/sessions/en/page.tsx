import { getCoaches, getSessions } from '@/actions/sessions'
import { getMySoloSessionRequests } from '@/actions/solo-sessions'
import { hasSubscriptionType, hasActiveSubscription } from '@/lib/subscription'
import SessionsHub from '../SessionsHub'
import PremiumLock from '@/components/PremiumLock'

export default async function SessionsPageEn() {
  // Check if user has active subscription
  const hasSubscription = await hasActiveSubscription()
  
  // Get all sessions to check for free ones
  const coaches = await getCoaches()
  const [allSessions, soloRequests] = await Promise.all([
    getSessions({ include_past: false }),
    getMySoloSessionRequests(),
  ])

  // Check if there are any free sessions
  const hasFreeSessions = allSessions.some(s => s.is_free === true)
  
  // If user has no subscription but there are free sessions, allow access
  // Otherwise, require subscription
  if (!hasSubscription && !hasFreeSessions) {
    return <PremiumLock isRtl={false} feature="Sessions" />
  }

  // Check if user has group_sessions subscription (individual sessions are always available)
  const hasGroupSessions = await hasSubscriptionType('group_sessions')

  return <SessionsHub initialSessions={allSessions} coaches={coaches} initialSoloRequests={soloRequests} isRtl={false} hasGroupSessions={hasGroupSessions} hasSubscription={hasSubscription} />
}


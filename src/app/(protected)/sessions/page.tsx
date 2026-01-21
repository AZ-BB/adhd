import { getCoaches, getSessions } from '@/actions/sessions'
import { getMySoloSessionRequests } from '@/actions/solo-sessions'
import { hasSubscriptionType, hasActiveSubscription } from '@/lib/subscription'
import SessionsHub from './SessionsHub'
import PremiumLock from '@/components/PremiumLock'

export default async function SessionsPage() {
  // Check if user has active subscription
  const hasSubscription = await hasActiveSubscription()
  
  if (!hasSubscription) {
    return <PremiumLock isRtl={true} feature="الجلسات" />
  }

  // Check if user has group_sessions subscription (individual sessions are always available)
  const hasGroupSessions = await hasSubscriptionType('group_sessions')

  const coaches = await getCoaches()
  const [sessions, soloRequests] = await Promise.all([
    getSessions({ include_past: false }), // Only future sessions
    getMySoloSessionRequests(),
  ])

  return <SessionsHub initialSessions={sessions} coaches={coaches} initialSoloRequests={soloRequests} isRtl={true} hasGroupSessions={hasGroupSessions} />
}


import { getCoaches, getSessions } from '@/actions/sessions'
import { getMySoloSessionRequests } from '@/actions/solo-sessions'
import { hasSubscriptionType, hasActiveSubscription } from '@/lib/subscription'
import SessionsHub from '../SessionsHub'
import PremiumLock from '@/components/PremiumLock'

export default async function SessionsPageEn() {
  // Check if user has active subscription
  const hasSubscription = await hasActiveSubscription()
  
  if (!hasSubscription) {
    return <PremiumLock isRtl={false} feature="Sessions" />
  }

  // Check if user has group_sessions subscription (individual sessions are always available)
  const hasGroupSessions = await hasSubscriptionType('group_sessions')

  const coaches = await getCoaches()
  const [sessions, soloRequests] = await Promise.all([
    getSessions({ include_past: false }),
    getMySoloSessionRequests(),
  ])

  return <SessionsHub initialSessions={sessions} coaches={coaches} initialSoloRequests={soloRequests} isRtl={false} hasGroupSessions={hasGroupSessions} />
}


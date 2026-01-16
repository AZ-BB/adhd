import { NextResponse } from 'next/server'
import { hasSubscriptionType } from '@/lib/subscription'
import { createSupabaseServerClient } from '@/lib/server'

export async function GET() {
  try {
    // Check subscription status for each package
    const [hasGames, hasGroupSessions] = await Promise.all([
      hasSubscriptionType('games'),
      hasSubscriptionType('group_sessions'),
    ])

    // Check for expired subscriptions
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let hasExpiredSubscription = false
    let expiredSubscriptionDetails = null

    if (user) {
      const { data: userProfile } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", user.id)
        .maybeSingle()

      if (userProfile) {
        const now = new Date().toISOString()
        
        // Get the most recent expired subscription
        const { data: expiredSub } = await supabase
          .from("subscriptions")
          .select("subscription_type, end_date, status")
          .eq("user_id", userProfile.id)
          .in("subscription_type", ["games", "group_sessions"])
          .lt("end_date", now)
          .order("end_date", { ascending: false })
          .limit(1)
          .maybeSingle()

        if (expiredSub) {
          hasExpiredSubscription = true
          expiredSubscriptionDetails = {
            type: expiredSub.subscription_type,
            endDate: expiredSub.end_date,
            status: expiredSub.status
          }
        }
      }
    }

    return NextResponse.json({
      games: hasGames,
      group_sessions: hasGroupSessions,
      hasExpiredSubscription,
      expiredSubscription: expiredSubscriptionDetails,
    })
  } catch (error) {
    console.error('Error checking subscriptions:', error)
    return NextResponse.json(
      { games: false, group_sessions: false, hasExpiredSubscription: false, expiredSubscription: null },
      { status: 500 }
    )
  }
}

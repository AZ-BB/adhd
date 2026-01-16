import { NextResponse } from 'next/server'
import { updateExpiredSubscriptions } from '@/lib/subscription'

/**
 * POST /api/subscriptions/update-expired
 * Updates all expired subscriptions to 'expired' status
 * This should be called periodically (e.g., via cron job)
 */
export async function POST() {
  try {
    const result = await updateExpiredSubscriptions()
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Expired subscriptions updated successfully' 
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error updating expired subscriptions:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

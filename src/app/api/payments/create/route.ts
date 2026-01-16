import { NextRequest, NextResponse } from 'next/server'
import { createPayment } from '@/lib/payments'

export const runtime = 'nodejs'

/**
 * POST /api/payments/create
 * Create a payment intent with Paymob
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { packageId, subscriptionType, amount, currency, soloSessionRequestId } = body

    const baseUrl = request.nextUrl.origin
    const result = await createPayment({
      packageId,
      subscriptionType,
      amount,
      currency,
      soloSessionRequestId,
      baseUrl,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Payment creation error:', error)
    const statusCode = error.message === 'Unauthorized' ? 401 : 
                      error.message === 'User profile not found' ? 404 : 500
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: statusCode }
    )
  }
}

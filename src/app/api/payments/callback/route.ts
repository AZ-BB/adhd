import { NextRequest, NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export const runtime = 'nodejs'

/**
 * GET /api/payments/callback
 * Handle Paymob payment redirect callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const success = searchParams.get('success')
    const orderId = searchParams.get('order')
    const transactionId = searchParams.get('id')

    // Build redirect URL
    const baseUrl = request.nextUrl.origin
    let redirectUrl = `${baseUrl}/payment/result`

    // Add query parameters
    const params = new URLSearchParams()
    if (success === 'true') {
      params.set('status', 'success')
    } else {
      params.set('status', 'failed')
    }
    if (orderId) {
      params.set('orderId', orderId)
    }
    if (transactionId) {
      params.set('transactionId', transactionId)
    }

    redirectUrl += `?${params.toString()}`

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Callback processing error:', error)
    return NextResponse.redirect(`${request.nextUrl.origin}/payment/result?status=error`)
  }
}

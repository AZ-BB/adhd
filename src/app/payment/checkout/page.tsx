"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function PaymentCheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<number | null>(null)

  const packageId = searchParams.get("packageId")
  const subscriptionType = searchParams.get("subscriptionType")
  const amount = searchParams.get("amount")
  const currency = searchParams.get("currency")

  useEffect(() => {
    const createPayment = async () => {
      if (!packageId || !subscriptionType || !amount || !currency) {
        setError("Missing required payment parameters")
        setLoading(false)
        return
      }

      try {
        const response = await fetch("/api/payments/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            packageId: parseInt(packageId),
            subscriptionType,
            amount: parseFloat(amount),
            currency,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to create payment")
        }

        setIframeUrl(data.iframeUrl)
        setPaymentId(data.paymentId)
        setLoading(false)
      } catch (err: any) {
        console.error("Payment creation error:", err)
        setError(err.message || "Failed to initialize payment")
        setLoading(false)
      }
    }

    createPayment()
  }, [packageId, subscriptionType, amount, currency])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-sky-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent mb-4"></div>
          <p className="text-sky-700 text-lg">Initializing payment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-sky-100 flex items-center justify-center px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-red-200 shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-900 mb-4">Payment Error</h1>
          <p className="text-red-700 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/en/pricing"
              className="px-6 py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors"
            >
              Back to Pricing
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-sky-100 text-sky-700 font-semibold hover:bg-sky-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-sky-100">
      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 flex items-center justify-between">
          <Link href="/en" className="text-2xl font-extrabold flex-shrink-0">
            <Image
              src="/logo/1.png"
              alt="Movokids"
              width={200}
              height={60}
              className="object-contain w-32 sm:w-40 md:w-48 h-auto"
            />
          </Link>
          <Link
            href="/en/pricing"
            className="px-4 py-2 rounded-xl bg-white/70 text-sky-700 border border-sky-200 hover:bg-white shadow-sm text-sm font-medium transition-all"
          >
            Cancel
          </Link>
        </div>
      </header>

      {/* Payment Iframe */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-sky-200 shadow-xl p-6 md:p-8">
          <h1 className="text-2xl font-bold text-sky-900 mb-4 text-center">
            Complete Your Payment
          </h1>
          <p className="text-sky-700 mb-6 text-center">
            Please complete your payment using the secure form below
          </p>
          
          {iframeUrl && (
            <div className="w-full" style={{ minHeight: "600px" }}>
              <iframe
                src={iframeUrl}
                className="w-full border-0 rounded-xl"
                style={{ minHeight: "600px" }}
                title="Payment Form"
                allow="payment"
              />
            </div>
          )}

          <div className="mt-6 text-center text-sm text-sky-600">
            <p>Your payment is secured and encrypted</p>
            {paymentId && (
              <p className="mt-2">Payment ID: {paymentId}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function PaymentResultPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const status = searchParams.get("status")
  const orderId = searchParams.get("orderId")
  const transactionId = searchParams.get("transactionId")

  useEffect(() => {
    // Check payment status after a short delay to allow webhook to process
    if (status === "success") {
      const timer = setTimeout(() => {
        setLoading(false)
      }, 2000)
      return () => clearTimeout(timer)
    } else {
      setLoading(false)
    }
  }, [status])

  if (loading && status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-sky-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent mb-4"></div>
          <p className="text-sky-700 text-lg">Processing your payment...</p>
        </div>
      </div>
    )
  }

  const isSuccess = status === "success"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-sky-100 flex items-center justify-center px-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl border-2 shadow-xl p-8 max-w-md w-full text-center"
        style={{
          borderColor: isSuccess ? "rgb(14 165 233)" : "rgb(239 68 68)",
        }}
      >
        {isSuccess ? (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-sky-900 mb-4">
              Payment Successful!
            </h1>
            <p className="text-sky-700 mb-6">
              Your payment has been processed successfully. Your subscription is now active.
            </p>
            {orderId && (
              <p className="text-sm text-sky-600 mb-4">
                Order ID: {orderId}
              </p>
            )}
            {transactionId && (
              <p className="text-sm text-sky-600 mb-6">
                Transaction ID: {transactionId}
              </p>
            )}
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold hover:from-sky-600 hover:to-sky-700 shadow-lg transition-all"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/en/pricing"
                className="px-6 py-3 rounded-xl bg-sky-100 text-sky-700 font-semibold hover:bg-sky-200 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-3xl font-bold text-red-900 mb-4">
              Payment Failed
            </h1>
            <p className="text-red-700 mb-6">
              {status === "error"
                ? "An error occurred while processing your payment. Please try again."
                : "Your payment could not be processed. Please check your payment details and try again."}
            </p>
            {orderId && (
              <p className="text-sm text-red-600 mb-6">
                Order ID: {orderId}
              </p>
            )}
            <div className="flex flex-col gap-3">
              <Link
                href="/en/pricing"
                className="px-6 py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors"
              >
                Try Again
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-xl bg-sky-100 text-sky-700 font-semibold hover:bg-sky-200 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

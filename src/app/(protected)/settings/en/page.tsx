import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/server"
import { getUserSubscriptionDetailsEn } from "@/lib/subscription"
import Link from "next/link"

export default async function SettingsPageEn() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login/en")
  }

  // Get subscription details
  const subscriptionDetails = await getUserSubscriptionDetailsEn()

  // Format expiration date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not available'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Settings</h1>

        {/* Subscription Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription Information</h2>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Current Plan</h3>
                  <p className="text-2xl font-semibold text-indigo-600 mb-2">
                    {subscriptionDetails.planName}
                  </p>
                  {subscriptionDetails.expirationDate && (
                    <p className="text-gray-600">
                      <span className="font-semibold">Expires on:</span> {formatDate(subscriptionDetails.expirationDate)}
                    </p>
                  )}
                </div>
                <div className="text-6xl">📦</div>
              </div>
            </div>

            {subscriptionDetails.subscriptions.length > 0 && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Subscription Details:</h4>
                <div className="space-y-3">
                  {subscriptionDetails.subscriptions.map((sub, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{sub.typeName}</p>
                          <p className="text-sm text-gray-600">
                            Expires on: {formatDate(sub.expirationDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                href="/en/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg transition-all"
              >
                <span>Change Plan</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

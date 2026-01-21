"use client"

import { useState } from "react"
import { PaymentWithUser, SubscriptionWithUser } from "@/actions/admin"

interface Props {
  initialPayments: PaymentWithUser[]
  initialSubscriptions: SubscriptionWithUser[]
}

export default function PaymentsSubscriptionsClient({ initialPayments, initialSubscriptions }: Props) {
  const [activeTab, setActiveTab] = useState<'payments' | 'subscriptions'>('payments')
  const [payments] = useState(initialPayments)
  const [subscriptions] = useState(initialSubscriptions)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'pending':
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'failed':
      case 'cancelled':
      case 'expired':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'refunded':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const getSubscriptionTypeLabel = (type: string) => {
    switch (type) {
      case 'games':
        return '🎮 Games'
      case 'group_sessions':
        return '👥 Group Sessions'
      case 'individual_session':
        return '👤 Individual Session'
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-purple-800/50">
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 px-4 font-semibold transition-colors ${
            activeTab === 'payments'
              ? 'border-b-2 border-purple-400 text-purple-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Payments ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`pb-3 px-4 font-semibold transition-colors ${
            activeTab === 'subscriptions'
              ? 'border-b-2 border-purple-400 text-purple-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Subscriptions ({subscriptions.length})
        </button>
      </div>

      {/* Payments Table */}
      {activeTab === 'payments' && (
        <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-900/30">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Paymob Order ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Created</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Paid At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-800/30">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-purple-900/10 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-300">#{payment.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {payment.user ? (
                          <div>
                            <div className="font-medium text-white">
                              {payment.user.child_first_name} {payment.user.child_last_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Parent: {payment.user.parent_first_name} {payment.user.parent_last_name}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">User #{payment.user_id}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {getSubscriptionTypeLabel(payment.subscription_type)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-white">
                        {formatCurrency(Number(payment.amount), payment.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 font-mono">
                        {payment.paymob_order_id || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {formatDate(payment.paid_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subscriptions Table */}
      {activeTab === 'subscriptions' && (
        <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-900/30">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Start Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">End Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Payment ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-800/30">
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                      No subscriptions found
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((subscription) => (
                    <tr key={subscription.id} className="hover:bg-purple-900/10 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-300">#{subscription.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {subscription.user ? (
                          <div>
                            <div className="font-medium text-white">
                              {subscription.user.child_first_name} {subscription.user.child_last_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Parent: {subscription.user.parent_first_name} {subscription.user.parent_last_name}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">User #{subscription.user_id}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {getSubscriptionTypeLabel(subscription.subscription_type)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-white">
                        {formatCurrency(Number(subscription.amount), subscription.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(subscription.status)}`}>
                          {subscription.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {formatDate(subscription.start_date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {formatDate(subscription.end_date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {subscription.payment ? (
                          <div>
                            <div className="font-mono">#{subscription.payment.id}</div>
                            {subscription.payment.paymob_order_id && (
                              <div className="text-xs text-gray-500">
                                Order: {subscription.payment.paymob_order_id}
                              </div>
                            )}
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

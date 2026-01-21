import { getAllPayments, getAllSubscriptions } from "@/actions/admin"
import { requireAdmin } from "@/lib/admin"
import PaymentsSubscriptionsClient from "./PaymentsSubscriptionsClient"

export default async function AdminPaymentsPage() {
  await requireAdmin()
  
  const payments = await getAllPayments()
  const subscriptions = await getAllSubscriptions()

  // Calculate stats
  const totalRevenue = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + Number(p.amount), 0)
  
  const successfulPayments = payments.filter(p => p.status === 'success').length
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length
  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'processing').length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white">Payments & Subscriptions</h1>
          <p className="text-gray-400 mt-1">Track all payments and subscription management</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="text-3xl font-black text-green-400">
            {totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-gray-400">Total Revenue</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="text-3xl font-black text-blue-400">{successfulPayments}</div>
          <div className="text-sm text-gray-400">Successful Payments</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="text-3xl font-black text-purple-400">{activeSubscriptions}</div>
          <div className="text-sm text-gray-400">Active Subscriptions</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <div className="text-3xl font-black text-orange-400">{pendingPayments}</div>
          <div className="text-sm text-gray-400">Pending Payments</div>
        </div>
      </div>

      {/* Payments and Subscriptions Tables */}
      <PaymentsSubscriptionsClient 
        initialPayments={payments} 
        initialSubscriptions={subscriptions} 
      />
    </div>
  )
}

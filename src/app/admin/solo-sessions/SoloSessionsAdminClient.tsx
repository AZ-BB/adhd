'use client'

import { useMemo, useState } from "react"
import { Coach } from "@/types/sessions"
import { SoloSessionRequest } from "@/types/solo-sessions"
import { respondSoloSessionRequest, getAdminSoloSessionRequests } from "@/actions/solo-sessions"
import { useRouter } from "next/navigation"

type StatusFilter = 'all' | 'pending' | 'payment_pending' | 'approved' | 'rejected'

interface Props {
  initialRequests: SoloSessionRequest[]
  coaches: Coach[]
}

export default function SoloSessionsAdminClient({ initialRequests, coaches }: Props) {
  const router = useRouter()
  const [requests, setRequests] = useState(initialRequests)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [responseData, setResponseData] = useState<{ id: number | null; status: 'approved' | 'rejected'; meeting_link: string; admin_reason: string; scheduled_time: string }>({
    id: null,
    status: 'approved',
    meeting_link: '',
    admin_reason: '',
    scheduled_time: ''
  })

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return requests
    return requests.filter(r => r.status === statusFilter)
  }, [requests, statusFilter])

  const refresh = async () => {
    try {
      const data = await getAdminSoloSessionRequests(statusFilter === 'all' ? undefined : statusFilter)
      setRequests(data)
    } catch (e) {
      console.error(e)
      router.refresh()
    }
  }

  const handleOpenAction = (req: SoloSessionRequest, status: 'approved' | 'rejected') => {
    setResponseData({
      id: req.id,
      status,
      meeting_link: req.meeting_link || '',
      admin_reason: req.admin_reason || '',
      scheduled_time: req.scheduled_time ? req.scheduled_time.slice(0, 16) : ''
    })
  }

  const handleSubmit = async () => {
    if (!responseData.id) return
    if (responseData.status === 'approved' && !responseData.meeting_link) {
      alert("Meeting link is required to approve")
      return
    }
    setActionLoadingId(responseData.id)
    try {
      await respondSoloSessionRequest(responseData.id, {
        status: responseData.status,
        meeting_link: responseData.meeting_link,
        admin_reason: responseData.admin_reason || undefined,
        scheduled_time: responseData.scheduled_time ? new Date(responseData.scheduled_time).toISOString() : undefined
      })
      setResponseData({ id: null, status: 'approved', meeting_link: '', admin_reason: '', scheduled_time: '' })
      await refresh()
      router.refresh()
    } catch (e: any) {
      alert(e.message || "Error")
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Solo 1:1 Session Requests</h1>
            <p className="text-gray-600">Review, approve, or reject individual session requests</p>
            <div className="mt-3 p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm space-y-1">
              <p className="font-semibold">Reminders:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Set status to "payment_pending" with a meeting link; child must click "Pay now" to move to "paid".</li>
                <li>Unpaid requests can be rejected if payment is not completed in time.</li>
                <li>You can edit the link/time even after approved/paid; payment status stays.</li>
              </ul>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="pending">Pending</option>
              <option value="payment_pending">Payment pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
            </select>
            <button onClick={refresh} className="px-3 py-2 rounded-lg bg-indigo-600 text-white font-semibold">Refresh</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Child</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preferred</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coach</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map(req => (
                <tr key={req.id}>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{req.user?.child_first_name} {req.user?.child_last_name}</div>
                    <div className="text-sm text-gray-500">{req.user?.parent_first_name} {req.user?.parent_last_name}</div>
                    <div className="text-sm text-gray-500">{req.user?.parent_phone}</div>
                    {req.user && (req.user as any).email && (
                      <div className="text-sm text-gray-500">{(req.user as any).email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(req.preferred_time).toLocaleString()}
                    {req.notes && <div className="text-xs text-gray-500 mt-1">{req.notes}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {req.coach ? req.coach.name : 'Any coach'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      req.status === 'approved' ? 'bg-green-100 text-green-700' :
                      req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      req.status === 'payment_pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {req.status}
                    </span>
                    {(req.status === 'approved' || req.status === 'payment_pending') && req.meeting_link && (
                      <div className="text-xs text-indigo-600 truncate max-w-[220px] mt-1">{req.meeting_link}</div>
                    )}
                    {req.status === 'rejected' && req.admin_reason && (
                      <div className="text-xs text-red-600 mt-1">{req.admin_reason}</div>
                    )}
                    {req.scheduled_time && (
                      <div className="text-xs text-gray-500 mt-1">Scheduled: {new Date(req.scheduled_time).toLocaleString()}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 flex flex-wrap gap-3">
                    {req.status !== 'rejected' && (
                      <button
                        onClick={() => handleOpenAction(req, req.status === 'approved' ? 'approved' : 'payment_pending')}
                        className="text-green-600 font-semibold"
                      >
                        {req.status === 'approved' ? 'Edit link' : 'Approve (payment)'}
                      </button>
                    )}
                    {(req.status === 'pending' || req.status === 'approved' || req.status === 'payment_pending') && (
                      <button
                        onClick={() => handleOpenAction(req, 'rejected')}
                        className="text-red-600 font-semibold"
                      >
                        Reject
                      </button>
                    )}
                    {req.status === 'rejected' && (
                      <button
                        onClick={() => handleOpenAction(req, 'payment_pending')}
                        className="text-indigo-600 font-semibold"
                      >
                        Approve (payment)
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {responseData.id && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">
                {responseData.status === 'rejected' ? 'Reject Request' : 'Approve / Edit'}
              </h3>
              <button onClick={() => setResponseData({ id: null, status: 'approved', meeting_link: '', admin_reason: '', scheduled_time: '' })} className="text-gray-500 text-2xl">✕</button>
            </div>

            {(responseData.status === 'approved' || responseData.status === 'payment_pending') && (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link *</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-3 mb-3"
                  value={responseData.meeting_link}
                  onChange={(e) => setResponseData({ ...responseData, meeting_link: e.target.value })}
                />
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Time (optional)</label>
                <input
                  type="datetime-local"
                  className="w-full border rounded-lg p-3 mb-3"
                  value={responseData.scheduled_time}
                  onChange={(e) => setResponseData({ ...responseData, scheduled_time: e.target.value })}
                />
              </>
            )}

            {responseData.status === 'rejected' && (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <textarea
                  className="w-full border rounded-lg p-3 mb-3"
                  rows={3}
                  value={responseData.admin_reason}
                  onChange={(e) => setResponseData({ ...responseData, admin_reason: e.target.value })}
                />
              </>
            )}

            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setResponseData({ id: null, status: 'approved', meeting_link: '', admin_reason: '', scheduled_time: '' })}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={actionLoadingId === responseData.id}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold disabled:opacity-60"
              >
                {actionLoadingId === responseData.id ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



'use client'

import { useMemo, useState } from "react"
import { Coach } from "@/types/sessions"
import { SoloSessionRequest } from "@/types/solo-sessions"
import { respondSoloSessionRequest, getAdminSoloSessionRequests } from "@/actions/solo-sessions"
import { useRouter } from "next/navigation"

type StatusFilter = 'all' | 'pending' | 'payment_pending' | 'approved' | 'rejected' | 'paid'

type ActionMode = 'approve' | 'reject' | 'edit'

interface Props {
  initialRequests: SoloSessionRequest[]
  coaches: Coach[]
  isSuperAdmin: boolean
}

export default function SoloSessionsAdminClient({ initialRequests, coaches, isSuperAdmin }: Props) {
  const router = useRouter()
  const [requests, setRequests] = useState(initialRequests)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [notesModalRequest, setNotesModalRequest] = useState<SoloSessionRequest | null>(null)
  const [actionMode, setActionMode] = useState<ActionMode>('approve')
  const [responseData, setResponseData] = useState<{ id: number | null; status: 'rejected' | 'payment_pending' | 'approved'; meeting_link: string; admin_reason: string; scheduled_time: string }>({
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

  const handleOpenAction = (req: SoloSessionRequest, mode: 'approve' | 'reject' | 'edit') => {
    setActionMode(mode)
    const uiStatus: 'rejected' | 'payment_pending' | 'approved' =
      mode === 'reject' ? 'rejected' : mode === 'edit' ? (req.status === 'paid' ? 'payment_pending' : req.status === 'approved' ? 'approved' : 'payment_pending') : 'approved'
    setResponseData({
      id: req.id,
      status: uiStatus,
      meeting_link: req.meeting_link || '',
      admin_reason: req.admin_reason || '',
      scheduled_time: req.scheduled_time ? req.scheduled_time.slice(0, 16) : ''
    })
  }

  const handleSubmit = async () => {
    if (!responseData.id) return

    const currentRequest = requests.find(r => r.id === responseData.id)
    const isPaidSession = currentRequest?.status === 'paid'

    if (actionMode === 'approve' && !responseData.meeting_link?.trim()) {
      alert("Meeting link is required to approve")
      return
    }
    if (actionMode === 'edit' && responseData.status !== 'rejected' && !responseData.meeting_link?.trim()) {
      alert("Meeting link is required")
      return
    }
    if (responseData.status === 'rejected' && !responseData.admin_reason?.trim()) {
      alert("A rejection reason is required. This will be displayed to the child.")
      return
    }

    setActionLoadingId(responseData.id)
    try {
      const statusToSend = isPaidSession ? 'edit' : responseData.status
      await respondSoloSessionRequest(responseData.id, {
        status: statusToSend,
        meeting_link: responseData.meeting_link || undefined,
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
                <li><strong>Pending</strong> = paid, awaiting your decision. Approve (set meeting link + time) or Reject (with reason).</li>
                <li>Legacy <strong>payment_pending</strong> = old flow; child has not paid yet. You can Edit or Reject.</li>
                <li>You can Edit meeting link/time for approved or paid sessions.</li>
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
              <option value="paid">Paid</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
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
                    {isSuperAdmin && req.user?.parent_phone && (
                      <div className="text-sm text-gray-500">{req.user.parent_phone}</div>
                    )}
                    {isSuperAdmin && req.user && (req.user as any).email && (
                      <div className="text-sm text-gray-500">{(req.user as any).email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {req.contact_phone || (isSuperAdmin && req.user?.parent_phone) || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {req.scheduled_time ? (
                      <div>
                        <div className="font-semibold">Scheduled: {new Date(req.scheduled_time).toLocaleString()}</div>
                        {req.preferred_time && (
                          <div className="text-xs text-gray-500">Requested: {new Date(req.preferred_time).toLocaleString()}</div>
                        )}
                      </div>
                    ) : req.preferred_time ? (
                      <div>Requested: {new Date(req.preferred_time).toLocaleString()}</div>
                    ) : (
                      <div className="text-gray-400 italic">No time specified</div>
                    )}
                    {req.notes && (
                      <button
                        onClick={() => setNotesModalRequest(req)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 mt-1 underline"
                      >
                        View notes
                      </button>
                    )}
                    <div className="text-xs text-gray-500 mt-1">Duration: 30-45 minutes</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {req.coach ? req.coach.name : 'Any coach'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      req.status === 'approved' ? 'bg-green-100 text-green-700' :
                      req.status === 'paid' ? 'bg-blue-100 text-blue-700' :
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
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleOpenAction(req, 'approve')}
                          className="text-green-600 font-semibold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleOpenAction(req, 'reject')}
                          className="text-red-600 font-semibold"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {(req.status === 'payment_pending' || req.status === 'paid') && (
                      <button
                        onClick={() => handleOpenAction(req, 'edit')}
                        className="text-blue-600 font-semibold"
                      >
                        Edit
                      </button>
                    )}
                    {req.status === 'payment_pending' && (
                      <button
                        onClick={() => handleOpenAction(req, 'reject')}
                        className="text-red-600 font-semibold"
                      >
                        Reject
                      </button>
                    )}
                    {req.status === 'approved' && (
                      <button
                        onClick={() => handleOpenAction(req, 'edit')}
                        className="text-blue-600 font-semibold"
                      >
                        Edit
                      </button>
                    )}
                    {req.status === 'rejected' && (
                      <span className="text-gray-400 text-sm italic">No actions available</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes Modal */}
      {notesModalRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Session Notes</h3>
              <button onClick={() => setNotesModalRequest(null)} className="text-gray-500 text-2xl">✕</button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Child:</strong> {notesModalRequest.user?.child_first_name} {notesModalRequest.user?.child_last_name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Request ID:</strong> #{notesModalRequest.id}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Notes:</p>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{notesModalRequest.notes || 'No notes provided.'}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setNotesModalRequest(null)}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {responseData.id && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">
                {actionMode === 'reject' ? 'Reject Request' : actionMode === 'approve' ? 'Approve Request' : 'Edit Session'}
              </h3>
              <button onClick={() => setResponseData({ id: null, status: 'payment_pending', meeting_link: '', admin_reason: '', scheduled_time: '' })} className="text-gray-500 text-2xl">✕</button>
            </div>

            {(actionMode === 'approve' || actionMode === 'edit') && (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-3 mb-3"
                  value={responseData.meeting_link}
                  onChange={(e) => setResponseData({ ...responseData, meeting_link: e.target.value })}
                />
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Time</label>
                <input
                  type="datetime-local"
                  className="w-full border rounded-lg p-3 mb-3"
                  value={responseData.scheduled_time}
                  onChange={(e) => setResponseData({ ...responseData, scheduled_time: e.target.value })}
                />
                {actionMode === 'edit' && requests.find(r => r.id === responseData.id)?.status === 'paid' && (
                  <p className="text-sm text-gray-600 mb-3">
                    Note: Status will remain &quot;paid&quot;. Only link and time are updated.
                  </p>
                )}
              </>
            )}

            {responseData.status === 'rejected' && (
              <>
                <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 font-semibold">
                    ⚠️ This reason will be displayed to the child when they view their rejected request.
                  </p>
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border rounded-lg p-3 mb-3"
                  rows={4}
                  placeholder="Please provide a clear reason for rejection that will help the child understand why their request was not approved..."
                  value={responseData.admin_reason}
                  onChange={(e) => setResponseData({ ...responseData, admin_reason: e.target.value })}
                  required
                />
                {!responseData.admin_reason && (
                  <p className="text-xs text-red-600 mb-3">
                    A rejection reason is required to help the child understand the decision.
                  </p>
                )}
              </>
            )}

            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setResponseData({ id: null, status: 'payment_pending', meeting_link: '', admin_reason: '', scheduled_time: '' })}
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



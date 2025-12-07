'use client'

import { useState } from 'react'
import { Coach } from '@/types/sessions'
import { SoloSessionRequest } from '@/types/solo-sessions'
import { createSoloSessionRequest } from '@/actions/solo-sessions'
import { useRouter } from 'next/navigation'

interface Props {
  coaches: Coach[]
  initialRequests: SoloSessionRequest[]
  isRtl: boolean
}

export default function SoloSessionsClient({ coaches, initialRequests, isRtl }: Props) {
  const router = useRouter()
  const [requests, setRequests] = useState(initialRequests)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    coach_id: '' as number | '' ,
    preferred_time: '',
    duration_minutes: 60,
    notes: ''
  })
  const [payLoadingId, setPayLoadingId] = useState<number | null>(null)

  const minDateTime = (() => {
    const d = new Date()
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 16)
  })()

  const t = {
    title: isRtl ? 'جلسات فردية (1 إلى 1)' : '1:1 Solo Sessions',
    subtitle: isRtl ? 'اطلب جلسة خاصة مع مدرب وانتظر الموافقة' : 'Request a private session with a coach and wait for approval',
    coach: isRtl ? 'المدرب' : 'Coach',
    optional: isRtl ? '(اختياري)' : '(Optional)',
    preferredTime: isRtl ? 'الوقت المفضل' : 'Preferred Time',
    duration: isRtl ? 'المدة (دقيقة)' : 'Duration (minutes)',
    notes: isRtl ? 'ملاحظات' : 'Notes',
    submit: isRtl ? 'إرسال الطلب' : 'Submit Request',
    status: isRtl ? 'الحالة' : 'Status',
    meetingLink: isRtl ? 'رابط الجلسة' : 'Meeting Link',
    adminReason: isRtl ? 'سبب الرفض' : 'Rejection Reason',
    pending: isRtl ? 'قيد المراجعة' : 'Pending',
    approved: isRtl ? 'مقبولة' : 'Approved',
    paid: isRtl ? 'مدفوعة' : 'Paid',
    paymentPending: isRtl ? 'بانتظار الدفع' : 'Payment pending',
    rejected: isRtl ? 'مرفوضة' : 'Rejected',
    payNow: isRtl ? 'ادفع الآن (تجريبي)' : 'Pay now (mock)',
  }

  const statusColor = (status: string) => {
    if (status === 'approved' || status === 'paid') return 'bg-green-100 text-green-700'
    if (status === 'rejected') return 'bg-red-100 text-red-700'
    if (status === 'payment_pending') return 'bg-amber-100 text-amber-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  const handleSubmit = async () => {
    if (!form.preferred_time) {
      alert(isRtl ? 'يرجى اختيار وقت مفضل' : 'Please choose a preferred time')
      return
    }
    setLoading(true)
    try {
      await createSoloSessionRequest({
        coach_id: form.coach_id === '' ? null : Number(form.coach_id),
        preferred_time: new Date(form.preferred_time).toISOString(),
        duration_minutes: form.duration_minutes,
        notes: form.notes || undefined,
      })
      alert(isRtl ? 'تم إرسال الطلب، بانتظار الموافقة' : 'Request submitted, awaiting approval')
      setForm({ coach_id: '', preferred_time: '', duration_minutes: 60, notes: '' })
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async (id: number) => {
    setPayLoadingId(id)
    try {
      const { paySoloSessionRequest } = await import('@/actions/solo-sessions')
      await paySoloSessionRequest(id)
      alert(isRtl ? 'تم تأكيد الدفع.' : 'Payment confirmed.')
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Error')
    } finally {
      setPayLoadingId(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600">{t.subtitle}</p>
        <div className="mt-3 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm space-y-1">
          <p>{isRtl ? 'مهم:' : 'Important:'}</p>
          <ul className="list-disc list-inside space-y-1">
            <li>{isRtl ? 'عند الموافقة ستصبح الحالة "بانتظار الدفع". عليك الضغط على "ادفع الآن" لإتمام الحجز.' : 'Once approved, status becomes "Payment pending". You must click "Pay now" to confirm the booking.'}</li>
            <li>{isRtl ? 'إذا لم يتم الدفع خلال الوقت المناسب قد يتم إلغاء الطلب.' : 'If payment is not completed in time, the request may be cancelled.'}</li>
            <li>{isRtl ? 'سيظهر رابط الجلسة بعد اكتمال الدفع (حالة "مدفوعة").' : 'The meeting link stays available after payment is completed (status "Paid").'}</li>
          </ul>
        </div>
      </div>

      {/* Request Form */}
      <div className="bg-white rounded-2xl shadow p-6 mb-10 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.coach} {t.optional}
            </label>
            <select
              className="w-full border rounded-lg p-3"
              value={form.coach_id}
              onChange={(e) => setForm({ ...form, coach_id: e.target.value === '' ? '' : Number(e.target.value) })}
            >
              <option value="">{isRtl ? 'أي مدرب' : 'Any coach'}</option>
              {coaches.map(c => (
                <option key={c.id} value={c.id}>
                  {isRtl ? (c.name_ar || c.name) : c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.preferredTime} *
            </label>
            <input
              type="datetime-local"
              className="w-full border rounded-lg p-3"
              value={form.preferred_time}
              min={minDateTime}
              onChange={(e) => setForm({ ...form, preferred_time: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.duration}
            </label>
            <input
              type="number"
              className="w-full border rounded-lg p-3"
              value={form.duration_minutes}
              onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
              min={15}
              max={180}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.notes}
            </label>
            <textarea
              className="w-full border rounded-lg p-3"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={isRtl ? 'أذكر ما تحتاجه في الجلسة' : 'Describe what you need in the session'}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? '...' : t.submit}
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <h2 className="text-xl font-bold mb-4">{isRtl ? 'طلباتي' : 'My Requests'}</h2>
        {requests.length === 0 ? (
          <p className="text-gray-500">{isRtl ? 'لا توجد طلبات بعد.' : 'No requests yet.'}</p>
        ) : (
          <div className="space-y-3">
            {requests.map(req => {
              const statusLabel =
                req.status === 'approved'
                  ? t.approved
                  : req.status === 'paid'
                  ? t.paid
                  : req.status === 'rejected'
                  ? t.rejected
                  : req.status === 'payment_pending'
                  ? t.paymentPending
                  : t.pending
              return (
                <div key={req.id} className="p-4 border rounded-xl flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {isRtl ? 'الوقت المفضل:' : 'Preferred:'} {new Date(req.preferred_time).toLocaleString(isRtl ? 'ar-EG' : 'en-US')}
                    </p>
                    {req.scheduled_time && (
                      <p className="text-sm text-gray-600">
                        {isRtl ? 'الوقت المعتمد:' : 'Scheduled:'} {new Date(req.scheduled_time).toLocaleString(isRtl ? 'ar-EG' : 'en-US')}
                      </p>
                    )}
                    {req.coach && (
                      <p className="text-sm text-gray-600">
                        {t.coach}: {isRtl ? (req.coach.name_ar || req.coach.name) : req.coach.name}
                      </p>
                    )}
                    {req.notes && <p className="text-sm text-gray-500 mt-1">{req.notes}</p>}
                    {(req.status === 'approved' || req.status === 'paid') && req.meeting_link && (
                      <a
                        href={req.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 font-semibold mt-2 inline-block"
                      >
                        {t.meetingLink}
                      </a>
                    )}
                    {req.status === 'payment_pending' && (
                      <button
                        onClick={() => handlePay(req.id)}
                        disabled={payLoadingId === req.id}
                        className="mt-2 inline-flex items-center px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-60"
                      >
                        {payLoadingId === req.id ? '...' : t.payNow}
                      </button>
                    )}
                    {req.status === 'rejected' && req.admin_reason && (
                      <p className="text-sm text-red-600 mt-1">
                        {t.adminReason}: {req.admin_reason}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(req.status)}`}>
                    {statusLabel}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}



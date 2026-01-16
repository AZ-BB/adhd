'use client'

import { useState, useEffect } from 'react'
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
    notes: ''
  })
  const [payLoadingId, setPayLoadingId] = useState<number | null>(null)
  const [isEgypt, setIsEgypt] = useState<boolean | null>(null)
  const [priceLoading, setPriceLoading] = useState(true)
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null)
  const [showAllCoaches, setShowAllCoaches] = useState(false)

  // Detect user location based on IP (same as pricing page)
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()
        
        // Check if country is Egypt (EG)
        if (data.country_code === 'EG') {
          setIsEgypt(true)
        } else {
          setIsEgypt(false)
        }
      } catch (error) {
        // Default to international if detection fails
        setIsEgypt(false)
      } finally {
        setPriceLoading(false)
      }
    }

    detectLocation()
  }, [])

  // Calculate price based on location
  // Egypt: 200 EGP, International: 50 AED (will be converted to 643 EGP for Paymob)
  const sessionPrice = isEgypt ? 200 : 50
  const sessionCurrency = isEgypt ? 'EGP' : 'AED'

  const t = {
    title: isRtl ? 'جلسات فردية (1 إلى 1)' : '1:1 Solo Sessions',
    subtitle: isRtl ? 'اطلب جلسة خاصة مع مدرب وانتظر الموافقة' : 'Request a private session with a coach and wait for approval',
    coach: isRtl ? 'المدرب' : 'Coach',
    optional: isRtl ? '(اختياري)' : '(Optional)',
    durationInfo: isRtl ? 'مدة الجلسة: 30-45 دقيقة' : 'Session Duration: 30-45 minutes',
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
    payNow: isRtl ? 'ادفع الآن' : 'Pay now',
    payNowWithPrice: (price: number, currency: string) => 
      isRtl ? `ادفع الآن - ${price} ${currency}` : `Pay now - ${price} ${currency}`,
    scheduled: isRtl ? 'الوقت المعتمد' : 'Scheduled Time',
  }

  const statusColor = (status: string) => {
    if (status === 'approved' || status === 'paid') return 'bg-green-100 text-green-700'
    if (status === 'rejected') return 'bg-red-100 text-red-700'
    if (status === 'payment_pending') return 'bg-amber-100 text-amber-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  // Check if user has an active request (pending or payment_pending)
  const hasActiveRequest = requests.some(req => req.status === 'pending' || req.status === 'payment_pending')
  const activeRequest = requests.find(req => req.status === 'pending' || req.status === 'payment_pending')

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await createSoloSessionRequest({
        coach_id: form.coach_id === '' ? null : Number(form.coach_id),
        notes: form.notes || undefined,
      })
      alert(isRtl ? 'تم إرسال الطلب، بانتظار الموافقة' : 'Request submitted, awaiting approval')
      setForm({ coach_id: '', notes: '' })
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
      // Wait for location detection to complete
      if (priceLoading) {
        // Wait a bit for location to be detected
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      const { initiateSoloSessionPayment } = await import('@/actions/solo-sessions')
      // Pass the detected location to the server action
      const result = await initiateSoloSessionPayment(id, isEgypt ?? false)
      
      if (result.success && result.redirectUrl) {
        // Redirect to payment checkout
        router.push(result.redirectUrl)
      } else {
        throw new Error('Failed to create payment')
      }
    } catch (err: any) {
      alert(err.message || 'Error')
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
        {hasActiveRequest && (
          <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800">
            <p className="font-semibold mb-1">
              {isRtl ? 'لديك طلب نشط بالفعل' : 'You already have an active request'}
            </p>
            <p className="text-sm">
              {activeRequest?.status === 'pending'
                ? (isRtl 
                    ? 'لديك طلب قيد المراجعة. يرجى الانتظار حتى يتم معالجة طلبك الحالي قبل إنشاء طلب جديد.'
                    : 'You have a pending request. Please wait for your current request to be processed before creating a new one.')
                : (isRtl
                    ? 'لديك طلب بانتظار الدفع. يرجى إكمال الدفع لطلبك الحالي قبل إنشاء طلب جديد.'
                    : 'You have a request awaiting payment. Please complete the payment for your current request before creating a new one.')}
            </p>
          </div>
        )}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-800">{t.durationInfo}</p>
          <p className="text-xs text-blue-600 mt-1">
            {isRtl ? 'سيتم تحديد وقت الجلسة من قبل الإدارة' : 'The session time will be scheduled by the admin'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.coach} {t.optional}
            </label>
            <div className="space-y-2">
              <select
                className="w-full border rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                value={form.coach_id}
                onChange={(e) => setForm({ ...form, coach_id: e.target.value === '' ? '' : Number(e.target.value) })}
                disabled={hasActiveRequest}
              >
                <option value="">{isRtl ? 'أي مدرب' : 'Any coach'}</option>
                {coaches.map(c => (
                  <option key={c.id} value={c.id}>
                    {isRtl ? (c.name_ar || c.name) : c.name}
                  </option>
                ))}
              </select>
              {coaches.length > 0 && (
                <div className="text-xs text-gray-600">
                  <button
                    type="button"
                    onClick={() => setShowAllCoaches(true)}
                    className="text-indigo-600 hover:text-indigo-800 underline"
                  >
                    {isRtl ? 'عرض جميع الملفات الشخصية للمدربين' : 'View all coach profiles'}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.notes} {t.optional}
            </label>
            <textarea
              className="w-full border rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={isRtl ? 'أذكر ما تحتاجه في الجلسة' : 'Describe what you need in the session'}
              disabled={hasActiveRequest}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleSubmit}
            disabled={loading || hasActiveRequest}
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
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
                    {req.status === 'rejected' ? (
                      <p className="font-semibold text-red-600">
                        {isRtl ? 'مرفوضة من قبل الإدارة' : 'Rejected by admin'}
                      </p>
                    ) : req.scheduled_time ? (
                      <p className="font-semibold text-gray-900">
                        {t.scheduled}: {new Date(req.scheduled_time).toLocaleString(isRtl ? 'ar-EG' : 'en-US')}
                      </p>
                    ) : (
                      <p className="font-semibold text-gray-900">
                        {isRtl ? 'بانتظار تحديد الوقت من الإدارة' : 'Awaiting time scheduling by admin'}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {t.durationInfo}
                    </p>
                    {req.coach && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{t.coach}: </span>
                        <button
                          onClick={() => {
                            const fullCoach = coaches.find(c => c.id === req.coach?.id)
                            if (fullCoach) setSelectedCoach(fullCoach)
                          }}
                          className="text-indigo-600 hover:text-indigo-800 underline"
                        >
                          {isRtl ? (req.coach.name_ar || req.coach.name) : req.coach.name}
                        </button>
                      </div>
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
                        disabled={payLoadingId === req.id || priceLoading}
                        className="mt-2 inline-flex items-center px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-60"
                      >
                        {payLoadingId === req.id 
                          ? '...' 
                          : priceLoading 
                          ? (isRtl ? 'جاري التحميل...' : 'Loading...')
                          : t.payNowWithPrice(sessionPrice, sessionCurrency)}
                      </button>
                    )}
                    {req.status === 'rejected' && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-semibold text-red-800 mb-1">
                          {t.adminReason}:
                        </p>
                        {req.admin_reason ? (
                          <p className="text-sm text-red-700 whitespace-pre-wrap">
                            {req.admin_reason}
                          </p>
                        ) : (
                          <p className="text-sm text-red-600 italic">
                            {isRtl ? 'لم يتم تقديم سبب' : 'No reason provided'}
                          </p>
                        )}
                      </div>
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

      {/* Coach Profile Modal */}
      {selectedCoach && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{isRtl ? 'الملف الشخصي للمدرب' : 'Coach Profile'}</h3>
              <button onClick={() => setSelectedCoach(null)} className="text-gray-500 text-2xl">✕</button>
            </div>
            
            <div className="flex flex-col items-center mb-6">
              {selectedCoach.image_url ? (
                <img 
                  src={selectedCoach.image_url} 
                  alt={selectedCoach.name} 
                  className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-indigo-100"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-5xl mb-4 border-4 border-indigo-100">
                  👤
                </div>
              )}
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                {isRtl ? (selectedCoach.name_ar || selectedCoach.name) : selectedCoach.name}
              </h4>
              {selectedCoach.title && (
                <p className="text-lg text-indigo-600 font-medium">
                  {isRtl ? (selectedCoach.title_ar || selectedCoach.title) : selectedCoach.title}
                </p>
              )}
            </div>

            {selectedCoach.bio && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">{isRtl ? 'نبذة عن المدرب' : 'About Coach'}</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {isRtl ? (selectedCoach.bio_ar || selectedCoach.bio) : selectedCoach.bio}
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedCoach(null)}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold"
              >
                {isRtl ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Coaches Modal */}
      {showAllCoaches && coaches.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold">{isRtl ? 'جميع المدربين' : 'All Coaches'}</h3>
              <button onClick={() => setShowAllCoaches(false)} className="text-gray-500 text-2xl">✕</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coaches.map(coach => (
                <div 
                  key={coach.id}
                  className="border rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedCoach(coach)
                    setShowAllCoaches(false)
                  }}
                >
                  <div className="flex items-center gap-4">
                    {coach.image_url ? (
                      <img 
                        src={coach.image_url} 
                        alt={coach.name} 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                        👤
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">
                        {isRtl ? (coach.name_ar || coach.name) : coach.name}
                      </h4>
                      {coach.title && (
                        <p className="text-sm text-indigo-600">
                          {isRtl ? (coach.title_ar || coach.title) : coach.title}
                        </p>
                      )}
                      {coach.bio && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {isRtl ? (coach.bio_ar || coach.bio) : coach.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowAllCoaches(false)}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold"
              >
                {isRtl ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



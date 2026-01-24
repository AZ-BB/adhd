'use client'

import { useState } from 'react'
import { Coach, SessionWithCoach } from '@/types/sessions'
import { enrollInSession, cancelEnrollment } from '@/actions/sessions'
import { useRouter } from 'next/navigation'

interface SessionsClientProps {
  initialSessions: SessionWithCoach[]
  coaches: Coach[]
  isRtl: boolean
  hasSubscription?: boolean
}

export default function SessionsClient({ initialSessions, coaches, isRtl, hasSubscription = false }: SessionsClientProps) {
  const router = useRouter()
  const [sessions, setSessions] = useState(initialSessions)
  const [selectedCoachId, setSelectedCoachId] = useState<number | 'all'>('all')
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null)

  // Filter sessions: if user doesn't have subscription, only show free sessions
  const availableSessions = hasSubscription 
    ? sessions 
    : sessions.filter(s => s.is_free === true)

  const filteredSessions = availableSessions.filter(s => 
    selectedCoachId === 'all' || s.coach_id === selectedCoachId
  )

  const t = {
    title: isRtl ? 'الجلسات القادمة' : 'Upcoming Sessions',
    subtitle: isRtl ? 'انضم إلى جلساتنا التفاعلية مع مدربين خبراء' : 'Join our interactive sessions with expert coaches',
    filterCoach: isRtl ? 'تصفية حسب المدرب' : 'Filter by Coach',
    allCoaches: isRtl ? 'جميع المدربين' : 'All Coaches',
    noSessions: isRtl ? 'لا توجد جلسات متاحة حالياً.' : 'No sessions available at the moment.',
    enroll: isRtl ? 'تسجيل' : 'Enroll',
    cancel: isRtl ? 'إلغاء التسجيل' : 'Cancel Enrollment',
    full: isRtl ? 'ممتلئ' : 'Full',
    join: isRtl ? 'انضم للجلسة' : 'Join Session',
    startsIn: isRtl ? 'تبدأ في' : 'Starts in',
    participants: isRtl ? 'مشترك' : 'participants',
    coach: isRtl ? 'المدرب' : 'Coach',
    date: isRtl ? 'التاريخ' : 'Date',
    time: isRtl ? 'الوقت' : 'Time',
    duration: isRtl ? 'المدة' : 'Duration',
    minutes: isRtl ? 'دقيقة' : 'minutes',
    viewProfile: isRtl ? 'عرض الملف الشخصي' : 'View Profile',
    about: isRtl ? 'عن المدرب' : 'About Coach',
  }

  const handleEnroll = async (sessionId: number) => {
    setLoadingId(sessionId)
    try {
      await enrollInSession(sessionId)
      // Optimistic update
      setSessions(sessions.map(s => 
        s.id === sessionId 
          ? { ...s, is_enrolled: true, enrollment_count: (s.enrollment_count || 0) + 1 }
          : s
      ))
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoadingId(null)
    }
  }

  const handleCancel = async (sessionId: number) => {
    if (!confirm(isRtl ? 'هل أنت متأكد أنك تريد إلغاء التسجيل؟' : 'Are you sure you want to cancel enrollment?')) return
    
    setLoadingId(sessionId)
    try {
      await cancelEnrollment(sessionId)
      // Optimistic update
      setSessions(sessions.map(s => 
        s.id === sessionId 
          ? { ...s, is_enrolled: false, enrollment_count: Math.max(0, (s.enrollment_count || 0) - 1) }
          : s
      ))
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoadingId(null)
    }
  }

  const isSessionJoinable = (sessionDate: string) => {
    const now = new Date()
    const start = new Date(sessionDate)
    const diffMinutes = (start.getTime() - now.getTime()) / 1000 / 60
    return diffMinutes <= 15 // Joinable 15 mins before
  }

  return (
    <div className="max-w-7xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600">{t.subtitle}</p>
        {!hasSubscription && availableSessions.length > 0 && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              {isRtl 
                ? '✨ أنت تشاهد الجلسات المجانية فقط. اشترك للوصول إلى جميع الجلسات.'
                : '✨ You are viewing free sessions only. Subscribe to access all sessions.'}
            </p>
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="mb-8 flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <label className="font-medium text-gray-700">{t.filterCoach}:</label>
        <select
          value={selectedCoachId}
          onChange={(e) => setSelectedCoachId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
        >
          <option value="all">{t.allCoaches}</option>
          {coaches.map(c => (
            <option key={c.id} value={c.id}>
              {isRtl ? (c.name_ar || c.name) : c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSessions.map(session => {
          const sessionDate = new Date(session.session_date)
          const isFull = (session.enrollment_count || 0) >= session.max_participants
          const canJoin = isSessionJoinable(session.session_date)
          
          return (
            <div key={session.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow flex flex-col">
              {/* Coach Header */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-full bg-white p-1 shadow-sm flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                    onClick={() => session.coach && setSelectedCoach(session.coach)}
                  >
                    {session.coach?.image_url ? (
                      <img 
                        src={session.coach.image_url} 
                        alt={session.coach.name} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                        👤
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 
                      className="font-bold text-lg text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => session.coach && setSelectedCoach(session.coach)}
                    >
                        {isRtl ? (session.coach?.name_ar || session.coach?.name) : session.coach?.name}
                    </h3>
                    <p className="text-sm text-blue-600 font-medium">
                        {isRtl ? (session.coach?.title_ar || session.coach?.title) : session.coach?.title}
                    </p>
                    {session.coach && (
                      <button
                        onClick={() => setSelectedCoach(session.coach!)}
                        className="text-xs text-blue-500 hover:text-blue-700 underline mt-1"
                      >
                        {t.viewProfile}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="text-xl font-bold text-gray-900">
                      {isRtl ? (session.title_ar || session.title) : session.title}
                  </h4>
                  {session.is_free && (
                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                      {isRtl ? 'مجاني' : 'FREE'}
                    </span>
                  )}
                </div>
                
                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center gap-3 text-gray-600">
                    <span>📅</span>
                    <span>{sessionDate.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <span>⏰</span>
                    <span>{sessionDate.toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })} ({session.duration_minutes} {t.minutes})</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <span>🎥</span>
                    <span>{session.platform}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <span>👥</span>
                    <span>{session.enrollment_count} / {session.max_participants} {t.participants}</span>
                  </div>
                  {session.description && (
                    <p className="text-sm text-gray-500 mt-2 border-t pt-2">
                        {isRtl ? (session.description_ar || session.description) : session.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-auto space-y-3">
                  {session.is_enrolled ? (
                    <>
                      {canJoin ? (
                        <a
                          href={session.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                        >
                          {t.join}
                        </a>
                      ) : (
                        <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl text-center font-medium border border-gray-200">
                          {t.startsIn} {Math.ceil((new Date(session.session_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} {isRtl ? 'أيام' : 'days'}
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleCancel(session.id)}
                        disabled={loadingId === session.id}
                        className="block w-full text-center py-2 text-red-600 text-sm font-medium hover:text-red-800 transition-colors"
                      >
                        {loadingId === session.id ? '...' : t.cancel}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEnroll(session.id)}
                      disabled={isFull || loadingId === session.id}
                      className={`block w-full text-center py-3 rounded-xl font-bold transition-all shadow-lg ${
                        isFull 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                      }`}
                    >
                      {loadingId === session.id ? '...' : (isFull ? t.full : t.enroll)}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        
        {filteredSessions.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-lg">{t.noSessions}</p>
          </div>
        )}
      </div>

      {/* Coach Profile Modal */}
      {selectedCoach && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 shadow-lg">
                  {selectedCoach.image_url ? (
                    <img 
                      src={selectedCoach.image_url} 
                      alt={selectedCoach.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {isRtl ? (selectedCoach.name_ar || selectedCoach.name) : selectedCoach.name}
                  </h2>
                  <p className="text-lg text-blue-600 font-medium">
                    {isRtl ? (selectedCoach.title_ar || selectedCoach.title) : selectedCoach.title}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCoach(null)} 
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            {(selectedCoach.bio || selectedCoach.bio_ar) && (
              <div className="mt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t.about}</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {isRtl ? (selectedCoach.bio_ar || selectedCoach.bio) : selectedCoach.bio}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


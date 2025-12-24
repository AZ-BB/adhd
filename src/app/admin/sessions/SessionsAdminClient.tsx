'use client'

import { useState } from 'react'
import { Coach, SessionWithCoach } from '@/types/sessions'
import { 
  createCoach, updateCoach, deleteCoach, 
  createSession, updateSession, deleteSession,
  getSessionEnrollments
} from '@/actions/sessions'
import { useRouter } from 'next/navigation'

interface SessionsAdminClientProps {
  initialCoaches: Coach[]
  initialSessions: SessionWithCoach[]
  isSuperAdmin: boolean
}

export default function SessionsAdminClient({ initialCoaches, initialSessions, isSuperAdmin }: SessionsAdminClientProps) {
  const [activeTab, setActiveTab] = useState<'sessions' | 'coaches'>('sessions')
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sessions & Coaches Management</h1>
            <p className="text-gray-600 mt-1">Manage online sessions and coaches profiles</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`pb-2 px-4 font-semibold transition-colors ${
              activeTab === 'sessions' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sessions
          </button>
          <button
            onClick={() => setActiveTab('coaches')}
            className={`pb-2 px-4 font-semibold transition-colors ${
              activeTab === 'coaches' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Coaches
          </button>
        </div>

        {activeTab === 'sessions' ? (
          <SessionManager initialSessions={initialSessions} coaches={initialCoaches} />
        ) : (
          <CoachManager initialCoaches={initialCoaches} />
        )}
      </div>
    </div>
  )
}

// --- Coach Manager Component ---

function CoachManager({ initialCoaches }: { initialCoaches: Coach[] }) {
  const router = useRouter()
  const [coaches, setCoaches] = useState(initialCoaches)
  const [isEditing, setIsEditing] = useState(false)
  const [currentCoach, setCurrentCoach] = useState<Partial<Coach>>({})
  const [isUploading, setIsUploading] = useState(false)

  const handleEdit = (coach: Coach) => {
    setCurrentCoach(coach)
    setIsEditing(true)
  }

  const handleCreate = () => {
    setCurrentCoach({})
    setIsEditing(true)
  }

  const handleCancel = () => {
    setCurrentCoach({})
    setIsEditing(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coach? This will affect sessions assigned to them.')) return
    try {
      await deleteCoach(id)
      setCoaches(coaches.filter(c => c.id !== id))
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleSave = async () => {
    if (!currentCoach.name) {
      alert('Name is required')
      return
    }
    try {
      if (currentCoach.id) {
        await updateCoach(currentCoach.id, currentCoach)
      } else {
        await createCoach(currentCoach)
      }
      setIsEditing(false)
      setCurrentCoach({})
      router.refresh()
      window.location.reload() 
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const { createBrowserClient } = await import('@supabase/ssr')
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { data, error } = await supabase.storage
        .from('coaches')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('coaches')
        .getPublicUrl(fileName)

      setCurrentCoach(prev => ({ ...prev, image_url: publicUrl }))
    } catch (error: any) {
      alert('Upload failed: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Coaches List</h2>
        <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Coach
        </button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded shadow mb-6 border border-blue-200">
          <h3 className="text-lg font-bold mb-4">{currentCoach.id ? 'Edit Coach' : 'New Coach'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input 
                    type="text" 
                    className="mt-1 block w-full border rounded p-2" 
                    value={currentCoach.name || ''}
                    onChange={e => setCurrentCoach({...currentCoach, name: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Name (Arabic)</label>
                <input 
                    type="text" 
                    className="mt-1 block w-full border rounded p-2" 
                    dir="rtl"
                    value={currentCoach.name_ar || ''}
                    onChange={e => setCurrentCoach({...currentCoach, name_ar: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input 
                    type="text" 
                    className="mt-1 block w-full border rounded p-2" 
                    value={currentCoach.title || ''}
                    onChange={e => setCurrentCoach({...currentCoach, title: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Title (Arabic)</label>
                <input 
                    type="text" 
                    className="mt-1 block w-full border rounded p-2" 
                    dir="rtl"
                    value={currentCoach.title_ar || ''}
                    onChange={e => setCurrentCoach({...currentCoach, title_ar: e.target.value})}
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea 
                    className="mt-1 block w-full border rounded p-2" 
                    rows={3}
                    value={currentCoach.bio || ''}
                    onChange={e => setCurrentCoach({...currentCoach, bio: e.target.value})}
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Bio (Arabic)</label>
                <textarea 
                    className="mt-1 block w-full border rounded p-2" 
                    rows={3}
                    dir="rtl"
                    value={currentCoach.bio_ar || ''}
                    onChange={e => setCurrentCoach({...currentCoach, bio_ar: e.target.value})}
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Photo</label>
                <div className="flex items-center gap-4 mt-1">
                    {currentCoach.image_url && (
                        <img src={currentCoach.image_url} alt="Preview" className="w-16 h-16 object-cover rounded-full" />
                    )}
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                    />
                    {isUploading && <span className="text-sm text-gray-500">Uploading...</span>}
                </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
            <button onClick={handleCancel} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.map(coach => (
            <div key={coach.id} className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
                <div className="flex-shrink-0">
                    {coach.image_url ? (
                        <img src={coach.image_url} alt={coach.name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">👤</div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{coach.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{coach.title}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <button onClick={() => handleEdit(coach)} className="text-blue-600 hover:text-blue-800 text-sm font-semibold">Edit</button>
                    <button onClick={() => handleDelete(coach.id)} className="text-red-600 hover:text-red-800 text-sm font-semibold">Delete</button>
                </div>
            </div>
        ))}
        {coaches.length === 0 && <p className="text-gray-500 col-span-full text-center py-8">No coaches found.</p>}
      </div>
    </div>
  )
}

// --- Session Manager Component ---

function SessionManager({ initialSessions, coaches }: { initialSessions: SessionWithCoach[], coaches: Coach[] }) {
  const router = useRouter()
  const [sessions, setSessions] = useState(initialSessions)
  const [isEditing, setIsEditing] = useState(false)
  const [currentSession, setCurrentSession] = useState<Partial<SessionWithCoach>>({})
  const [enrollments, setEnrollments] = useState<any[] | null>(null)
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false)

  const handleEdit = (session: SessionWithCoach) => {
    // Convert UTC timestamp to local datetime string for the input
    const date = new Date(session.session_date)
    // Subtract timezone offset to get the correct local time in ISO format
    // offset is in minutes (UTC - Local), so we subtract it (add if negative)
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    
    setCurrentSession({
        ...session,
        session_date: localDate.toISOString().slice(0, 16)
    })
    setIsEditing(true)
  }

  const handleCreate = () => {
    setCurrentSession({
        max_participants: 10,
        duration_minutes: 60,
        platform: 'Zoom'
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setCurrentSession({})
    setIsEditing(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this session?')) return
    try {
      await deleteSession(id)
      setSessions(sessions.filter(s => s.id !== id))
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleSave = async () => {
    if (!currentSession.title || !currentSession.session_date || !currentSession.meeting_link) {
      alert('Title, Date, and Meeting Link are required')
      return
    }
    
    // Convert datetime-local string back to ISO and remove joined fields
    // IMPORTANT: Destructure 'coach' AND 'coaches' to prevent sending them to DB, which causes "Could not find the 'coach'/'coaches' column" error
    const { coach, coaches, enrollments, enrollment_count, is_enrolled, ...sessionData } = {
        ...currentSession,
        session_date: new Date(currentSession.session_date!).toISOString()
    } as any

    try {
      if (currentSession.id) {
        // Ensure we are passing the sanitized sessionData, not currentSession
        await updateSession(currentSession.id, sessionData)
      } else {
        await createSession(sessionData)
      }
      setIsEditing(false)
      setCurrentSession({})
      window.location.reload()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleViewEnrollments = async (sessionId: number) => {
    setIsLoadingEnrollments(true)
    try {
      const data = await getSessionEnrollments(sessionId)
      setEnrollments(data)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsLoadingEnrollments(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Sessions List</h2>
        <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Create Session
        </button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded shadow mb-6 border border-blue-200">
          <h3 className="text-lg font-bold mb-4">{currentSession.id ? 'Edit Session' : 'New Session'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input 
                    type="text" 
                    className="mt-1 block w-full border rounded p-2" 
                    value={currentSession.title || ''}
                    onChange={e => setCurrentSession({...currentSession, title: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Title (Arabic)</label>
                <input 
                    type="text" 
                    className="mt-1 block w-full border rounded p-2" 
                    dir="rtl"
                    value={currentSession.title_ar || ''}
                    onChange={e => setCurrentSession({...currentSession, title_ar: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Coach</label>
                <select 
                    className="mt-1 block w-full border rounded p-2"
                    value={currentSession.coach_id || ''}
                    onChange={e => setCurrentSession({...currentSession, coach_id: e.target.value ? Number(e.target.value) : null})}
                >
                    <option value="">Select Coach</option>
                    {coaches.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Date & Time *</label>
                <input 
                    type="datetime-local" 
                    className="mt-1 block w-full border rounded p-2" 
                    value={currentSession.session_date || ''}
                    onChange={e => setCurrentSession({...currentSession, session_date: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Platform *</label>
                <select
                    className="mt-1 block w-full border rounded p-2"
                    value={currentSession.platform || 'Zoom'}
                    onChange={e => setCurrentSession({...currentSession, platform: e.target.value})}
                >
                    <option value="Zoom">Zoom</option>
                    <option value="Google Meet">Google Meet</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Meeting Link *</label>
                <input 
                    type="text" 
                    className="mt-1 block w-full border rounded p-2" 
                    value={currentSession.meeting_link || ''}
                    onChange={e => setCurrentSession({...currentSession, meeting_link: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Max Participants</label>
                <input 
                    type="number" 
                    className="mt-1 block w-full border rounded p-2" 
                    value={currentSession.max_participants || 10}
                    onChange={e => setCurrentSession({...currentSession, max_participants: Number(e.target.value)})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Duration (Minutes)</label>
                <input 
                    type="number" 
                    className="mt-1 block w-full border rounded p-2" 
                    value={currentSession.duration_minutes || 60}
                    onChange={e => setCurrentSession({...currentSession, duration_minutes: Number(e.target.value)})}
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                    className="mt-1 block w-full border rounded p-2" 
                    rows={3}
                    value={currentSession.description || ''}
                    onChange={e => setCurrentSession({...currentSession, description: e.target.value})}
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description (Arabic)</label>
                <textarea 
                    className="mt-1 block w-full border rounded p-2" 
                    rows={3}
                    dir="rtl"
                    value={currentSession.description_ar || ''}
                    onChange={e => setCurrentSession({...currentSession, description_ar: e.target.value})}
                />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
            <button onClick={handleCancel} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
          </div>
        </div>
      )}

      {enrollments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Enrolled Users</h3>
              <button onClick={() => setEnrollments(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="space-y-4">
              {enrollments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No users enrolled yet.</p>
              ) : (
                enrollments.map((enrollment: any) => (
                  <div key={enrollment.created_at} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {enrollment.user.child_profile_picture ? (
                        <img src={enrollment.user.child_profile_picture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold">{enrollment.user.child_first_name} {enrollment.user.child_last_name}</p>
                      {isSuperAdmin && enrollment.user.parent_phone && (
                        <p className="text-sm text-gray-500">Phone: {enrollment.user.parent_phone}</p>
                      )}
                      {isSuperAdmin && enrollment.user.email && enrollment.user.email !== 'N/A' && (
                        <p className="text-sm text-gray-500">Email: {enrollment.user.email}</p>
                      )}
                      {(enrollment.user.parent_first_name || enrollment.user.parent_last_name) && (
                        <p className="text-sm text-gray-500">Parent: {enrollment.user.parent_first_name} {enrollment.user.parent_last_name}</p>
                      )}
                    </div>
                    <div className="ml-auto text-xs text-gray-400">
                      {new Date(enrollment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coach</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollments</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map(session => (
                    <tr key={session.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(session.session_date).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{session.title}</div>
                            <div className="text-sm text-gray-500">{session.platform}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {session.coach?.name || 'No Coach'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  (session.enrollment_count || 0) >= session.max_participants ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                  {session.enrollment_count || 0} / {session.max_participants}
                              </span>
                              <button 
                                onClick={() => handleViewEnrollments(session.id)}
                                disabled={isLoadingEnrollments}
                                className="text-blue-600 hover:text-blue-800 text-xs underline"
                              >
                                View
                              </button>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button onClick={() => handleEdit(session)} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                            <button onClick={() => handleDelete(session.id)} className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                    </tr>
                ))}
                {sessions.length === 0 && (
                    <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No sessions found.</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  )
}

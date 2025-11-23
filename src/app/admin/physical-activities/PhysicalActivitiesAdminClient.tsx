'use client'

import { useState } from 'react'
import { PhysicalActivityVideo } from '@/types/physical-activities'
import { updatePhysicalActivityVideo, createPhysicalActivityVideo, deletePhysicalActivityVideo } from '@/actions/physical-activities'
import { uploadVideoFromFormData } from '@/actions/storage'
import { useRouter } from 'next/navigation'

interface PhysicalActivitiesAdminClientProps {
  videos: PhysicalActivityVideo[]
}

export default function PhysicalActivitiesAdminClient({ videos }: PhysicalActivitiesAdminClientProps) {
  const router = useRouter()
  const [editingVideo, setEditingVideo] = useState<PhysicalActivityVideo | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  
  const [formData, setFormData] = useState({
    video_number: 0,
    title: '',
    title_ar: '',
    description: '',
    description_ar: '',
    duration_seconds: 0,
    thumbnail_url: '',
    storage_path: '',
    is_active: true
  })
  
  const handleEdit = (video: PhysicalActivityVideo) => {
    setEditingVideo(video)
    setFormData({
      video_number: video.video_number,
      title: video.title,
      title_ar: video.title_ar,
      description: video.description || '',
      description_ar: video.description_ar || '',
      duration_seconds: video.duration_seconds || 0,
      thumbnail_url: video.thumbnail_url || '',
      storage_path: video.storage_path,
      is_active: video.is_active
    })
    setIsCreating(false)
  }
  
  const handleCreate = () => {
    setIsCreating(true)
    setEditingVideo(null)
    setFormData({
      video_number: Math.max(...videos.map(v => v.video_number), 0) + 1,
      title: '',
      title_ar: '',
      description: '',
      description_ar: '',
      duration_seconds: 0,
      thumbnail_url: '',
      storage_path: '',
      is_active: true
    })
  }
  
  const handleCancel = () => {
    setEditingVideo(null)
    setIsCreating(false)
    setFormData({
      video_number: 0,
      title: '',
      title_ar: '',
      description: '',
      description_ar: '',
      duration_seconds: 0,
      thumbnail_url: '',
      storage_path: '',
      is_active: true
    })
  }
  
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file')
      return
    }
    
    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      alert('File size must be less than 100MB')
      return
    }
    
    setIsUploading(true)
    setUploadProgress('Uploading video...')
    
    try {
      // Use client-side Supabase with browser session
      const { createBrowserClient } = await import('@supabase/ssr')
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      // Log diagnostic info
      console.log('=== Upload Diagnostics ===')
      console.log('File:', file.name, file.type, `${(file.size / 1024 / 1024).toFixed(2)} MB`)
      console.log('Video Number:', formData.video_number)
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      
      // Check current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log('Current User:', user?.email, user?.id)
      console.log('User Error:', userError)
      
      if (!user) {
        throw new Error('Not authenticated. Please log in again.')
      }
      
      console.log('Proceeding with upload to bucket: physical-activities')
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${formData.video_number}.${fileExt}`
      console.log('Target File Name:', fileName)
      
      // Try to upload
      console.log('Attempting upload to bucket: physical-activities')
      const { data, error } = await supabase.storage
        .from('physical-activities')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true,
        })
      
      console.log('Upload Response Data:', data)
      console.log('Upload Response Error:', error)
      
      if (error) {
        console.error('=== Upload Failed ===')
        console.error('Error Code:', error.name)
        console.error('Error Message:', error.message)
        console.error('Full Error:', JSON.stringify(error, null, 2))
        
        // Provide detailed error message
        let errorMsg = `Upload failed: ${error.message}`
        
        if (error.message.includes('row-level security') || error.message.includes('policy')) {
          errorMsg += '\n\n🔐 RLS Policy Issue:\n'
          errorMsg += '1. Go to Supabase Dashboard → SQL Editor\n'
          errorMsg += '2. Run this query:\n\n'
          errorMsg += 'SELECT email, role FROM users WHERE auth_id = auth.uid();\n\n'
          errorMsg += '3. If role is not "admin", run:\n\n'
          errorMsg += 'UPDATE users SET role = \'admin\' WHERE auth_id = auth.uid();\n\n'
          errorMsg += '4. Then create storage policies (check console for SQL)'
        }
        
        // Log the policy SQL needed
        console.log('=== Run This SQL to Fix RLS ===')
        console.log(`
-- Make yourself admin
UPDATE users SET role = 'admin' WHERE email = '${user.email}';

-- Create storage policies
DROP POLICY IF EXISTS "allow_all_authenticated" ON storage.objects;

CREATE POLICY "allow_all_authenticated"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'physical-activities')
WITH CHECK (bucket_id = 'physical-activities');
        `)
        
        throw new Error(errorMsg)
      }
      
      console.log('=== Upload Successful ===')
      setFormData(prev => ({ ...prev, storage_path: fileName }))
      setUploadProgress('Upload successful!')
      setTimeout(() => setUploadProgress(''), 3000)
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error'
      alert(errorMessage)
      console.error('=== Final Error ===', error)
      setUploadProgress('')
    } finally {
      setIsUploading(false)
    }
  }
  
  const handleSave = async () => {
    if (!formData.title || !formData.title_ar || !formData.storage_path) {
      alert('Please fill in all required fields (titles and video file)')
      return
    }
    
    try {
      let result
      if (editingVideo) {
        result = await updatePhysicalActivityVideo(editingVideo.id, formData)
      } else {
        result = await createPhysicalActivityVideo(formData)
      }
      
      if (result.success) {
        alert('Saved successfully!')
        router.refresh()
        handleCancel()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert('An error occurred')
      console.error(error)
    }
  }
  
  const handleDelete = async (videoId: number, videoNumber: number) => {
    if (!confirm(`Are you sure you want to delete video #${videoNumber}?`)) {
      return
    }
    
    try {
      const result = await deletePhysicalActivityVideo(videoId)
      
      if (result.success) {
        alert('Deleted successfully!')
        router.refresh()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert('An error occurred')
      console.error(error)
    }
  }
  
  const handleToggleActive = async (video: PhysicalActivityVideo) => {
    try {
      const result = await updatePhysicalActivityVideo(video.id, {
        is_active: !video.is_active
      })
      
      if (result.success) {
        router.refresh()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert('An error occurred')
      console.error(error)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Physical Activities Management</h1>
            <p className="text-gray-600 mt-1">Manage physical activity videos for users</p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            + Add New Video
          </button>
        </div>
        
        {/* Edit/Create Form */}
        {(editingVideo || isCreating) && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {isCreating ? 'Create New Video' : `Edit Video #${formData.video_number}`}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Video Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Video Number *
                </label>
                <input
                  type="number"
                  value={formData.video_number}
                  onChange={(e) => setFormData({ ...formData, video_number: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!isCreating}
                />
              </div>
              
              {/* English Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title (English) *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Warm-up Exercises"
                />
              </div>
              
              {/* Arabic Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title (Arabic) *
                </label>
                <input
                  type="text"
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="مثال: تمارين الإحماء"
                  dir="rtl"
                />
              </div>
              
              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  value={formData.duration_seconds}
                  onChange={(e) => setFormData({ ...formData, duration_seconds: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 300"
                />
              </div>
              
              {/* English Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (English)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Brief description of the activity"
                />
              </div>
              
              {/* Arabic Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Arabic)
                </label>
                <textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="وصف موجز للنشاط"
                  dir="rtl"
                />
              </div>
              
              {/* Thumbnail URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Thumbnail URL (optional)
                </label>
                <input
                  type="text"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
              
              {/* Video Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Video File * {formData.storage_path && '(Current: ' + formData.storage_path + ')'}
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={isUploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {uploadProgress && (
                  <p className="text-sm text-blue-600 mt-2">{uploadProgress}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Upload video as {formData.video_number}.mp4 (or other format). Max size: 100MB
                </p>
              </div>
              
              {/* Active Toggle */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">Active</span>
                </label>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSave}
                disabled={isUploading}
                className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {/* Videos List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">#</th>
                  <th className="px-6 py-4 text-left font-semibold">Title</th>
                  <th className="px-6 py-4 text-left font-semibold">عنوان</th>
                  <th className="px-6 py-4 text-left font-semibold">Duration</th>
                  <th className="px-6 py-4 text-left font-semibold">File</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No videos found. Click "Add New Video" to create one.
                    </td>
                  </tr>
                ) : (
                  videos.map((video) => (
                    <tr key={video.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-blue-600">{video.video_number}</td>
                      <td className="px-6 py-4">{video.title}</td>
                      <td className="px-6 py-4" dir="rtl">{video.title_ar}</td>
                      <td className="px-6 py-4">
                        {video.duration_seconds 
                          ? `${Math.floor(video.duration_seconds / 60)}:${(video.duration_seconds % 60).toString().padStart(2, '0')}`
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{video.storage_path}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(video)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            video.is_active 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {video.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(video)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-600 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(video.id, video.video_number)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Instructions Panel */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
            <span>📋</span>
            <span>Instructions</span>
          </h3>
          <ul className="space-y-2 text-blue-700 text-sm">
            <li>• Videos should be uploaded to the "physical-activities" bucket in Supabase Storage</li>
            <li>• Video files should be named as {'{'}number{'}'}.mp4 (e.g., 1.mp4, 2.mp4, 3.mp4)</li>
            <li>• System verifies video existence before showing to users</li>
            <li>• Users get 4 random videos per day displayed one by one</li>
            <li>• Users navigate through videos using Previous/Next buttons or numbered boxes</li>
            <li>• Each day shows a different set of 4 random videos</li>
            <li>• Make sure to set proper titles and descriptions in both English and Arabic</li>
            <li>• Inactive videos won't be shown to users but remain in the database</li>
          </ul>
        </div>
      </div>
    </div>
  )
}


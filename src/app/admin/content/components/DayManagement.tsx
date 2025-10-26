'use client'

import { useState } from 'react'
import { LearningDay } from '@/types/learning-path'
import { createLearningDay, updateLearningDay, deleteLearningDay } from '@/actions/content-management'
import { useRouter } from 'next/navigation'

interface DayManagementProps {
  initialDays: LearningDay[]
}

export default function DayManagement({ initialDays }: DayManagementProps) {
  const router = useRouter()
  const [days, setDays] = useState(initialDays)
  const [isCreating, setIsCreating] = useState(false)
  const [editingDay, setEditingDay] = useState<LearningDay | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    description: '',
    description_ar: '',
    required_correct_games: 5,
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setFormData({
      title: '',
      title_ar: '',
      description: '',
      description_ar: '',
      required_correct_games: 5,
      is_active: true
    })
    setIsCreating(false)
    setEditingDay(null)
    setError(null)
  }

  const handleEdit = (day: LearningDay) => {
    setFormData({
      title: day.title,
      title_ar: day.title_ar || '',
      description: day.description || '',
      description_ar: day.description_ar || '',
      required_correct_games: day.required_correct_games,
      is_active: day.is_active
    })
    setEditingDay(day)
    setIsCreating(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (editingDay) {
        await updateLearningDay(editingDay.id, formData)
      } else {
        await createLearningDay(formData)
      }
      router.refresh()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this day? This will also delete all user progress for this day.')) {
      return
    }

    setLoading(true)
    try {
      await deleteLearningDay(id)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete day')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Create/Edit Form */}
      {isCreating ? (
        <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            {editingDay ? 'Edit Learning Day' : 'Create New Learning Day'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Show day number only when editing */}
            {editingDay && (
              <div className="p-3 bg-purple-500/20 border border-purple-500/50 rounded-lg">
                <span className="text-sm text-gray-300">Editing Day {editingDay.day_number}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Required Correct Games */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Required Correct Games *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={formData.required_correct_games}
                  onChange={(e) => setFormData({ ...formData, required_correct_games: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-black/50 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Title (English) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title (English) *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-black/50 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Getting Started"
              />
            </div>

            {/* Title (Arabic) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title (Arabic)
              </label>
              <input
                type="text"
                dir="rtl"
                value={formData.title_ar}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                className="w-full px-4 py-2 bg-black/50 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="البداية"
              />
            </div>

            {/* Description (English) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (English)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-black/50 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Welcome! Start with easy games to warm up"
              />
            </div>

            {/* Description (Arabic) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Arabic)
              </label>
              <textarea
                dir="rtl"
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-black/50 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="مرحباً! ابدأ بألعاب سهلة للتسخين"
              />
            </div>

            {/* Is Active */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-purple-800/50 bg-black/50 text-purple-600 focus:ring-2 focus:ring-purple-500"
              />
              <label htmlFor="is_active" className="text-sm text-gray-300">
                Active (visible to users)
              </label>
            </div>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingDay ? 'Update Day' : 'Create Day'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full p-6 bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl text-white hover:bg-black/40 transition-all"
        >
          <div className="text-4xl mb-2">➕</div>
          <div className="font-medium">Create New Learning Day</div>
        </button>
      )}

      {/* Days List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map((day) => (
          <div
            key={day.id}
            className={`bg-black/30 backdrop-blur border rounded-2xl p-6 ${
              day.is_active ? 'border-purple-800/50' : 'border-gray-700/50 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm text-gray-400">Day {day.day_number}</div>
                <h3 className="text-xl font-bold text-white">{day.title}</h3>
                {day.title_ar && (
                  <h4 className="text-sm text-gray-400" dir="rtl">{day.title_ar}</h4>
                )}
              </div>
              {!day.is_active && (
                <span className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded">
                  Inactive
                </span>
              )}
            </div>
            
            {day.description && (
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{day.description}</p>
            )}

            <div className="text-sm text-gray-400 mb-4">
              Required Games: {day.required_correct_games}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(day)}
                className="flex-1 px-3 py-2 bg-purple-600/20 border border-purple-500/50 rounded-lg text-purple-300 text-sm font-medium hover:bg-purple-600/30 transition-all"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(day.id)}
                className="px-3 py-2 bg-red-600/20 border border-red-500/50 rounded-lg text-red-300 text-sm font-medium hover:bg-red-600/30 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


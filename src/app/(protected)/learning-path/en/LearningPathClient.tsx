'use client'

import { useRouter } from 'next/navigation'
import { LearningDay, UserDayProgress, UserLearningPathStats } from '@/types/learning-path'

interface DayWithProgress extends LearningDay {
  progress: UserDayProgress | null
  canAccess: boolean
  lockReason: 'available' | 'time_locked'
  availableDate?: string
}

interface LearningPathClientProps {
  days: DayWithProgress[]
  stats: UserLearningPathStats
  userId: number
}

export default function LearningPathClient({ days, stats }: LearningPathClientProps) {
  const router = useRouter()

  const handleDayClick = (day: DayWithProgress) => {
    if (!day.canAccess) {
      if (day.lockReason === 'time_locked' && day.availableDate) {
        const availableDate = new Date(day.availableDate)
        const formattedDate = availableDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        })
        alert(`This day will be available on ${formattedDate}. Come back tomorrow! 📅`)
      } else {
        alert('This day is not available yet.')
      }
      return
    }
    router.push(`/learning-path/${day.day_number}`)
  }

  const getStatusColor = (day: DayWithProgress) => {
    if (day.progress?.is_completed) {
      return 'bg-green-500'
    } else if (day.canAccess) {
      return 'bg-blue-500'
    } else {
      return 'bg-gray-300'
    }
  }

  const getStatusText = (day: DayWithProgress) => {
    if (day.progress?.is_completed) {
      return 'Completed ✓'
    } else if (day.canAccess) {
      if (day.progress) {
        return `${day.progress.games_correct_count}/${day.required_correct_games} games`
      }
      return 'Start'
    } else {
      return 'Coming Soon ⏰'
    }
  }

  const getLockMessage = (day: DayWithProgress) => {
    if (day.canAccess || day.progress?.is_completed) return null
    
    if (day.lockReason === 'time_locked' && day.availableDate) {
      const availableDate = new Date(day.availableDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      availableDate.setHours(0, 0, 0, 0)
      
      const daysUntil = Math.ceil((availableDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntil === 1) {
        return 'Available tomorrow'
      } else if (daysUntil > 1) {
        return `Available in ${daysUntil} days`
      }
    }
    
    return null
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Learning Path
            </h1>
            <p className="text-gray-600">
              Complete games every day to progress through your learning journey!
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
          >
            Dashboard
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-lg">
            <div className="text-sm text-purple-700 mb-1">Progress</div>
            <div className="text-2xl font-bold text-purple-900">
              {stats.completedDays}/{stats.totalDays}
            </div>
            <div className="text-xs text-purple-600">days completed</div>
          </div>

          <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-lg">
            <div className="text-sm text-blue-700 mb-1">Current Day</div>
            <div className="text-2xl font-bold text-blue-900">
              {stats.currentDay}
            </div>
            <div className="text-xs text-blue-600">of {stats.totalDays}</div>
          </div>

          <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-lg">
            <div className="text-sm text-green-700 mb-1">Streak</div>
            <div className="text-2xl font-bold text-green-900">
              {stats.streak} 🔥
            </div>
            <div className="text-xs text-green-600">consecutive days</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-4 rounded-lg">
            <div className="text-sm text-yellow-700 mb-1">Avg Score</div>
            <div className="text-2xl font-bold text-yellow-900">
              {stats.averageScore}
            </div>
            <div className="text-xs text-yellow-600">out of 100</div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((stats.completedDays / stats.totalDays) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${(stats.completedDays / stats.totalDays) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map((day) => (
          <button
            key={day.id}
            onClick={() => handleDayClick(day)}
            disabled={!day.canAccess}
            className={`
              bg-white rounded-lg shadow-lg p-6 text-left transition-all
              ${day.canAccess
                ? 'hover:shadow-xl hover:scale-105 cursor-pointer'
                : 'opacity-60 cursor-not-allowed'
              }
            `}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  text-white font-bold text-lg
                  ${getStatusColor(day)}
                `}>
                  {day.day_number}
                </div>
                <div className="ml-3">
                  <h3 className="font-bold text-gray-800">
                    Day {day.day_number}
                  </h3>
                  <div className={`
                    text-xs px-2 py-1 rounded-full inline-block mt-1
                    ${day.progress?.is_completed
                      ? 'bg-green-100 text-green-700'
                      : day.canAccess
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}>
                    {getStatusText(day)}
                  </div>
                </div>
              </div>
            </div>

            <h4 className="font-semibold text-lg text-gray-800 mb-2">
              {day.title}
            </h4>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {day.description}
            </p>

            {/* Progress for this day */}
            {day.progress && !day.progress.is_completed && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(day.progress.games_correct_count / day.required_correct_games) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}

            {day.progress?.is_completed && day.progress.completed_at && (
              <div className="mt-3 text-xs text-green-600">
                Completed on {new Date(day.progress.completed_at).toLocaleDateString()}
              </div>
            )}

            {getLockMessage(day) && (
              <div className="mt-3 text-xs font-medium text-orange-600">
                {getLockMessage(day)}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Motivational Message */}
      <div className="mt-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg shadow-lg p-6 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">
          {stats.completedDays === stats.totalDays
            ? '🎉 Congratulations! You completed all days!'
            : stats.completedDays > 0
            ? `Great job! Keep going! 💪`
            : 'Start your learning journey today! 🚀'
          }
        </h2>
        <p className="text-purple-100">
          {stats.completedDays === stats.totalDays
            ? 'You are amazing! You have completed the entire learning path!'
            : `You have ${stats.totalDays - stats.completedDays} days remaining. You can do it!`
          }
        </p>
      </div>
    </div>
  )
}


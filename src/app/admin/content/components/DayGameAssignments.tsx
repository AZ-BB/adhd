'use client'

import { useState, useEffect } from 'react'
import { LearningDay, Game } from '@/types/learning-path'
import { getDayGames, assignGameToDay, removeGameFromDay, updateDayGamesOrder } from '@/actions/content-management'
import { useRouter } from 'next/navigation'

interface DayGameAssignmentsProps {
  days: LearningDay[]
  games: Game[]
}

export default function DayGameAssignments({ days, games }: DayGameAssignmentsProps) {
  const router = useRouter()
  const [selectedDay, setSelectedDay] = useState<LearningDay | null>(days[0] || null)
  const [assignedGames, setAssignedGames] = useState<Array<any>>([])
  const [availableGames, setAvailableGames] = useState<Game[]>(games.filter(g => g.is_active))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedDay) {
      loadDayGames(selectedDay.id)
    }
  }, [selectedDay])

  const loadDayGames = async (dayId: number) => {
    setLoading(true)
    try {
      const dayGames = await getDayGames(dayId)
      setAssignedGames(dayGames)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load games')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignGame = async (gameId: number) => {
    if (!selectedDay) return

    setLoading(true)
    setError(null)
    try {
      const nextOrder = assignedGames.length + 1
      await assignGameToDay({
        learning_day_id: selectedDay.id,
        game_id: gameId,
        order_in_day: nextOrder
      })
      await loadDayGames(selectedDay.id)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign game')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveGame = async (dayGameId: number) => {
    if (!confirm('Remove this game from the day?')) return

    setLoading(true)
    setError(null)
    try {
      // Remove the game
      await removeGameFromDay(dayGameId)
      
      // Get the updated list of games
      const updatedGames = await getDayGames(selectedDay!.id)
      
      // Reorder all remaining games to be sequential (1, 2, 3, etc.)
      if (updatedGames.length > 0) {
        const reorderUpdates = updatedGames.map((dg, index) => ({
          id: dg.id,
          order_in_day: index + 1
        }))
        await updateDayGamesOrder(reorderUpdates)
      }
      
      // Reload games to get the fresh ordered list
      await loadDayGames(selectedDay!.id)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove game')
    } finally {
      setLoading(false)
    }
  }

  const handleMoveGame = async (index: number, direction: 'up' | 'down') => {
    const newAssignedGames = [...assignedGames]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newAssignedGames.length) return

    // Swap
    ;[newAssignedGames[index], newAssignedGames[targetIndex]] = 
      [newAssignedGames[targetIndex], newAssignedGames[index]]

    // Update order_in_day for all
    const updates = newAssignedGames.map((dg, i) => ({
      id: dg.id,
      order_in_day: i + 1
    }))

    setLoading(true)
    setError(null)
    try {
      await updateDayGamesOrder(updates)
      await loadDayGames(selectedDay!.id)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder games')
    } finally {
      setLoading(false)
    }
  }

  const assignedGameIds = assignedGames.map(ag => ag.game_id)
  const unassignedGames = availableGames.filter(g => !assignedGameIds.includes(g.id))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Day Selection */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Select Day</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {days.map((day) => (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedDay?.id === day.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-black/30 text-gray-300 hover:bg-black/50'
                }`}
              >
                <div className="text-xs text-purple-300">Day {day.day_number}</div>
                <div className="font-medium">{day.title}</div>
                {day.title_ar && (
                  <div className="text-xs text-gray-400" dir="rtl">{day.title_ar}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assigned Games & Assignment Interface */}
      <div className="lg:col-span-2 space-y-6">
        {selectedDay && (
          <>
            {/* Current Day Info */}
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6">
              <div className="text-sm text-purple-300">Day {selectedDay.day_number}</div>
              <h2 className="text-2xl font-bold text-white">{selectedDay.title}</h2>
              {selectedDay.description && (
                <p className="text-gray-300 mt-2">{selectedDay.description}</p>
              )}
              <div className="mt-4 text-sm text-gray-400">
                Required Games: {selectedDay.required_correct_games} | 
                Currently Assigned: {assignedGames.length}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                {error}
              </div>
            )}

            {/* Assigned Games */}
            <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Assigned Games ({assignedGames.length})
              </h3>

              {loading && assignedGames.length === 0 ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : assignedGames.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No games assigned yet. Select games from the available list below.
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedGames.map((dayGame, index) => (
                    <div
                      key={dayGame.id}
                      className="flex items-center gap-3 p-4 bg-black/30 border border-purple-800/30 rounded-xl"
                    >
                      {/* Order Number */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveGame(index, 'up')}
                          disabled={index === 0 || loading}
                          className="px-2 py-1 bg-purple-600/20 border border-purple-500/50 rounded text-purple-300 text-xs hover:bg-purple-600/30 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          ▲
                        </button>
                        <div className="text-center text-sm font-bold text-white px-2">
                          {dayGame.order_in_day}
                        </div>
                        <button
                          onClick={() => handleMoveGame(index, 'down')}
                          disabled={index === assignedGames.length - 1 || loading}
                          className="px-2 py-1 bg-purple-600/20 border border-purple-500/50 rounded text-purple-300 text-xs hover:bg-purple-600/30 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          ▼
                        </button>
                      </div>

                      {/* Game Info */}
                      <div className="flex-1">
                        <div className="font-medium text-white">{dayGame.game.name}</div>
                        <div className="text-xs text-gray-400">
                          Type: {dayGame.game.type} • Difficulty: {dayGame.game.difficulty_level}/5
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveGame(dayGame.id)}
                        disabled={loading}
                        className="px-3 py-2 bg-red-600/20 border border-red-500/50 rounded-lg text-red-300 text-sm hover:bg-red-600/30 transition-all disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Games to Assign */}
            <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Available Games ({unassignedGames.length})
              </h3>

              {unassignedGames.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  All active games have been assigned to this day.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {unassignedGames.map((game) => (
                    <div
                      key={game.id}
                      className="p-4 bg-black/30 border border-purple-800/30 rounded-xl"
                    >
                      <div className="font-medium text-white mb-1">{game.name}</div>
                      <div className="text-xs text-gray-400 mb-3">
                        {game.type} • Difficulty {game.difficulty_level}/5
                      </div>
                      <button
                        onClick={() => handleAssignGame(game.id)}
                        disabled={loading}
                        className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-all disabled:opacity-50"
                      >
                        + Assign to Day
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}


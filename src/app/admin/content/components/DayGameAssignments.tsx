'use client'

import { useState, useEffect, useMemo } from 'react'
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
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')

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

  // Get unique game types for filter
  const gameTypes = useMemo(() => {
    const types = new Set(games.map(g => g.type))
    return Array.from(types).sort()
  }, [games])

  // Filter and search logic
  const filteredUnassignedGames = useMemo(() => {
    return unassignedGames.filter(game => {
      const matchesSearch = searchQuery.trim() === '' || 
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.type.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesType = filterType === 'all' || game.type === filterType
      const matchesDifficulty = filterDifficulty === 'all' || game.difficulty_level.toString() === filterDifficulty
      
      return matchesSearch && matchesType && matchesDifficulty
    })
  }, [unassignedGames, searchQuery, filterType, filterDifficulty])

  // Filter assigned games by search
  const filteredAssignedGames = useMemo(() => {
    if (searchQuery.trim() === '') return assignedGames
    
    return assignedGames.filter(dayGame => {
      const game = dayGame.game
      return game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.type.toLowerCase().includes(searchQuery.toLowerCase())
    })
  }, [assignedGames, searchQuery])

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur border border-purple-700/50 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-purple-300 mb-2">
              🔍 Search Games
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or type..."
              className="w-full px-4 py-3 bg-black/40 border border-purple-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Type Filter */}
          <div className="lg:w-48">
            <label className="block text-sm font-medium text-purple-300 mb-2">
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-purple-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="all">All Types</option>
              {gameTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="lg:w-48">
            <label className="block text-sm font-medium text-purple-300 mb-2">
              Filter by Difficulty
            </label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-purple-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="all">All Levels</option>
              <option value="1">Level 1 (Easiest)</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
              <option value="5">Level 5 (Hardest)</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchQuery || filterType !== 'all' || filterDifficulty !== 'all') && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilterType('all')
                  setFilterDifficulty('all')
                }}
                className="px-4 py-3 bg-red-600/20 border border-red-500/50 rounded-xl text-red-300 hover:bg-red-600/30 transition-all whitespace-nowrap"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Active Filter Summary */}
        {(searchQuery || filterType !== 'all' || filterDifficulty !== 'all') && (
          <div className="mt-4 pt-4 border-t border-purple-700/30">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-purple-300">Active filters:</span>
              {searchQuery && (
                <span className="px-3 py-1 bg-purple-600/30 border border-purple-500/50 rounded-full text-xs text-white">
                  Search: "{searchQuery}"
                </span>
              )}
              {filterType !== 'all' && (
                <span className="px-3 py-1 bg-purple-600/30 border border-purple-500/50 rounded-full text-xs text-white">
                  Type: {filterType}
                </span>
              )}
              {filterDifficulty !== 'all' && (
                <span className="px-3 py-1 bg-purple-600/30 border border-purple-500/50 rounded-full text-xs text-white">
                  Difficulty: Level {filterDifficulty}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Day Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">📅 Select Day</h3>
              <span className="px-3 py-1 bg-purple-600/30 border border-purple-500/50 rounded-full text-xs text-purple-300">
                {days.length} days
              </span>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {days.map((day) => {
                const dayGameCount = day.id === selectedDay?.id ? assignedGames.length : 0
                return (
                  <button
                    key={day.id}
                    onClick={() => setSelectedDay(day)}
                    className={`w-full text-left p-4 rounded-xl transition-all relative group ${
                      selectedDay?.id === day.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-[1.02]'
                        : 'bg-black/30 text-gray-300 hover:bg-black/50 hover:border-purple-600/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-semibold text-purple-200">
                        Day {day.day_number}
                      </div>
                      {selectedDay?.id === day.id && dayGameCount > 0 && (
                        <div className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                          {dayGameCount} games
                        </div>
                      )}
                    </div>
                    <div className="font-medium text-sm">{day.title}</div>
                    {day.title_ar && (
                      <div className="text-xs text-gray-400 mt-1" dir="rtl">{day.title_ar}</div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Assigned Games & Assignment Interface */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDay && (
            <>
              {/* Current Day Info */}
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-purple-300 mb-1">
                      Day {selectedDay.day_number}
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedDay.title}</h2>
                    {selectedDay.description && (
                      <p className="text-gray-300 mt-2 text-sm">{selectedDay.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className={`px-4 py-2 rounded-xl text-center ${
                      assignedGames.length >= selectedDay.required_correct_games
                        ? 'bg-green-600/20 border border-green-500/50 text-green-300'
                        : 'bg-yellow-600/20 border border-yellow-500/50 text-yellow-300'
                    }`}>
                      <div className="text-2xl font-bold">
                        {assignedGames.length}/{selectedDay.required_correct_games}
                      </div>
                      <div className="text-xs">Games</div>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Assigned Games */}
              <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    🎮 Assigned Games
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-purple-600/30 border border-purple-500/50 rounded-full text-xs text-purple-300">
                      {filteredAssignedGames.length} of {assignedGames.length}
                      {searchQuery && ' (filtered)'}
                    </span>
                  </div>
                </div>

                {loading && assignedGames.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    Loading games...
                  </div>
                ) : assignedGames.length === 0 ? (
                  <div className="text-center py-12 bg-black/20 rounded-xl border-2 border-dashed border-purple-800/30">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="text-gray-400">No games assigned yet.</p>
                    <p className="text-sm text-gray-500 mt-1">Select games from the available list below.</p>
                  </div>
                ) : filteredAssignedGames.length === 0 ? (
                  <div className="text-center py-12 bg-black/20 rounded-xl border border-purple-800/30">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-gray-400">No games match your search.</p>
                    <p className="text-sm text-gray-500 mt-1">Try different search terms.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAssignedGames.map((dayGame, index) => {
                      // Find actual index in full array for proper movement
                      const actualIndex = assignedGames.findIndex(ag => ag.id === dayGame.id)
                      const difficultyColor = dayGame.game.difficulty_level <= 2 
                        ? 'text-green-400' 
                        : dayGame.game.difficulty_level <= 3 
                        ? 'text-yellow-400' 
                        : 'text-red-400'
                      
                      return (
                        <div
                          key={dayGame.id}
                          className="flex items-center gap-3 p-4 bg-gradient-to-r from-black/40 to-black/20 border border-purple-800/30 rounded-xl hover:border-purple-600/50 transition-all group"
                        >
                          {/* Order Controls */}
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleMoveGame(actualIndex, 'up')}
                              disabled={actualIndex === 0 || loading}
                              className="px-2 py-1 bg-purple-600/20 border border-purple-500/50 rounded text-purple-300 text-xs hover:bg-purple-600/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                              title="Move up"
                            >
                              ▲
                            </button>
                            <div className="text-center text-base font-bold text-white px-2 py-1 bg-purple-600/30 rounded">
                              {dayGame.order_in_day}
                            </div>
                            <button
                              onClick={() => handleMoveGame(actualIndex, 'down')}
                              disabled={actualIndex === assignedGames.length - 1 || loading}
                              className="px-2 py-1 bg-purple-600/20 border border-purple-500/50 rounded text-purple-300 text-xs hover:bg-purple-600/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                              title="Move down"
                            >
                              ▼
                            </button>
                          </div>

                          {/* Game Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white mb-1 flex items-center gap-2">
                              {dayGame.game.name}
                              <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColor} bg-black/30`}>
                                ⭐ {dayGame.game.difficulty_level}/5
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span className="px-2 py-0.5 bg-purple-600/20 border border-purple-500/30 rounded">
                                {dayGame.game.type}
                              </span>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveGame(dayGame.id)}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600/20 border border-red-500/50 rounded-lg text-red-300 text-sm font-medium hover:bg-red-600/40 transition-all disabled:opacity-50 opacity-60 group-hover:opacity-100"
                            title="Remove from day"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Available Games to Assign */}
              <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    ➕ Available Games
                  </h3>
                  <span className="px-3 py-1 bg-green-600/30 border border-green-500/50 rounded-full text-xs text-green-300">
                    {filteredUnassignedGames.length} of {unassignedGames.length}
                    {(searchQuery || filterType !== 'all' || filterDifficulty !== 'all') && ' (filtered)'}
                  </span>
                </div>

                {unassignedGames.length === 0 ? (
                  <div className="text-center py-12 bg-black/20 rounded-xl border-2 border-dashed border-green-800/30">
                    <div className="text-4xl mb-3">✅</div>
                    <p className="text-gray-400 font-medium">All active games assigned!</p>
                    <p className="text-sm text-gray-500 mt-1">This day has all available games.</p>
                  </div>
                ) : filteredUnassignedGames.length === 0 ? (
                  <div className="text-center py-12 bg-black/20 rounded-xl border border-purple-800/30">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-gray-400">No games match your filters.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setFilterType('all')
                        setFilterDifficulty('all')
                      }}
                      className="mt-3 px-4 py-2 bg-purple-600/30 border border-purple-500/50 rounded-lg text-purple-300 hover:bg-purple-600/50 transition-all"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredUnassignedGames.map((game) => {
                      const difficultyColor = game.difficulty_level <= 2 
                        ? 'border-green-500/50 bg-green-600/10' 
                        : game.difficulty_level <= 3 
                        ? 'border-yellow-500/50 bg-yellow-600/10' 
                        : 'border-red-500/50 bg-red-600/10'
                      
                      return (
                        <div
                          key={game.id}
                          className="p-4 bg-gradient-to-br from-black/40 to-black/20 border border-purple-800/30 rounded-xl hover:border-purple-600/50 hover:shadow-lg transition-all group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                              {game.name}
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColor} border`}>
                              ⭐ {game.difficulty_level}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 mb-3">
                            <span className="px-2 py-1 bg-purple-600/20 border border-purple-500/30 rounded">
                              {game.type}
                            </span>
                          </div>
                          <button
                            onClick={() => handleAssignGame(game.id)}
                            disabled={loading}
                            className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                          >
                            ➕ Assign to Day {selectedDay.day_number}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


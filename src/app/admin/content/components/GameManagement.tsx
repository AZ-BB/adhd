'use client'

import { useState } from 'react'
import { Game, GameType, GameConfig } from '@/types/learning-path'
import { createGame, updateGame, deleteGame } from '@/actions/content-management'
import { useRouter } from 'next/navigation'
import MatchingGameConfig from './game-configs/MatchingGameConfig'
import MemoryGameConfig from './game-configs/MemoryGameConfig'

interface GameManagementProps {
  initialGames: Game[]
}

const gameTypes: { value: GameType; label: string; icon: string }[] = [
  { value: 'matching', label: 'Matching Game', icon: '🎯' },
  { value: 'memory', label: 'Memory Game', icon: '🧠' },
  { value: 'sequence', label: 'Sequence Game', icon: '🔢' },
  { value: 'attention', label: 'Attention Game', icon: '👀' },
  { value: 'sorting', label: 'Sorting Game', icon: '📊' }
]

export default function GameManagement({ initialGames }: GameManagementProps) {
  const router = useRouter()
  const [games, setGames] = useState(initialGames)
  const [isCreating, setIsCreating] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [selectedType, setSelectedType] = useState<GameType>('matching')
  const [formData, setFormData] = useState({
    type: 'matching' as GameType,
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    difficulty_level: 1,
    config: {} as GameConfig,
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setFormData({
      type: 'matching',
      name: '',
      name_ar: '',
      description: '',
      description_ar: '',
      difficulty_level: 1,
      config: {},
      is_active: true
    })
    setSelectedType('matching')
    setIsCreating(false)
    setEditingGame(null)
    setError(null)
  }

  const handleEdit = (game: Game) => {
    setFormData({
      type: game.type,
      name: game.name,
      name_ar: game.name_ar || '',
      description: game.description || '',
      description_ar: game.description_ar || '',
      difficulty_level: game.difficulty_level,
      config: game.config || {},
      is_active: game.is_active
    })
    setSelectedType(game.type)
    setEditingGame(game)
    setIsCreating(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (editingGame) {
        await updateGame(editingGame.id, formData)
      } else {
        await createGame(formData)
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
    if (!confirm('Are you sure you want to delete this game? This will affect any days that use this game.')) {
      return
    }

    setLoading(true)
    try {
      await deleteGame(id)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete game')
    } finally {
      setLoading(false)
    }
  }

  const handleConfigChange = (config: GameConfig) => {
    setFormData({ ...formData, config })
  }

  const handleTypeChange = (type: GameType) => {
    setSelectedType(type)
    setFormData({ ...formData, type, config: {} })
  }

  return (
    <div className="space-y-6">
      {/* Create/Edit Form */}
      {isCreating ? (
        <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            {editingGame ? 'Edit Game' : 'Create New Game'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Game Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Game Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {gameTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeChange(type.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedType === type.value
                        ? 'border-purple-500 bg-purple-600/20'
                        : 'border-purple-800/30 bg-black/20 hover:border-purple-700/50'
                    }`}
                  >
                    <div className="text-3xl mb-1">{type.icon}</div>
                    <div className="text-sm text-white font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name (English) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-black/50 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Color Match"
                />
              </div>

              {/* Name (Arabic) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name (Arabic)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  className="w-full px-4 py-2 bg-black/50 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="مطابقة الألوان"
                />
              </div>
            </div>

            {/* Description (English) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (English)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 bg-black/50 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Match items with their correct colors"
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
                rows={2}
                className="w-full px-4 py-2 bg-black/50 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="طابق العناصر مع ألوانها الصحيحة"
              />
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty Level (1-5) *
              </label>
              <input
                type="number"
                min="1"
                max="5"
                required
                value={formData.difficulty_level}
                onChange={(e) => setFormData({ ...formData, difficulty_level: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-black/50 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Game-Specific Configuration */}
            <div className="border-t border-purple-800/30 pt-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Game Configuration
              </h3>
              
              {selectedType === 'matching' && (
                <MatchingGameConfig 
                  config={formData.config} 
                  onChange={handleConfigChange}
                />
              )}

              {selectedType === 'memory' && (
                <MemoryGameConfig 
                  config={formData.config} 
                  onChange={handleConfigChange}
                />
              )}

              {!['matching', 'memory'].includes(selectedType) && (
                <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300 text-sm">
                  ⚠️ Configuration UI for {selectedType} games coming soon. You can still create the game, and config can be added later.
                </div>
              )}
            </div>

            {/* Is Active */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active_game"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-purple-800/50 bg-black/50 text-purple-600 focus:ring-2 focus:ring-purple-500"
              />
              <label htmlFor="is_active_game" className="text-sm text-gray-300">
                Active (available for assignment)
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
                {loading ? 'Saving...' : editingGame ? 'Update Game' : 'Create Game'}
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
          <div className="font-medium">Create New Game</div>
        </button>
      )}

      {/* Games List */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">All Games ({games.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => {
            const typeInfo = gameTypes.find(t => t.value === game.type)
            return (
              <div
                key={game.id}
                className={`bg-black/30 backdrop-blur border rounded-2xl p-6 ${
                  game.is_active ? 'border-purple-800/50' : 'border-gray-700/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{typeInfo?.icon || '🎮'}</span>
                    <div>
                      <h3 className="text-lg font-bold text-white">{game.name}</h3>
                      {game.name_ar && (
                        <h4 className="text-xs text-gray-400" dir="rtl">{game.name_ar}</h4>
                      )}
                    </div>
                  </div>
                  {!game.is_active && (
                    <span className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded">
                      Inactive
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-purple-400 mb-2">
                  {typeInfo?.label || game.type}
                </div>

                {game.description && (
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{game.description}</p>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <div className="text-sm text-gray-400">Difficulty:</div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < game.difficulty_level ? 'bg-purple-500' : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(game)}
                    className="flex-1 px-3 py-2 bg-purple-600/20 border border-purple-500/50 rounded-lg text-purple-300 text-sm font-medium hover:bg-purple-600/30 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(game.id)}
                    className="px-3 py-2 bg-red-600/20 border border-red-500/50 rounded-lg text-red-300 text-sm font-medium hover:bg-red-600/30 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}


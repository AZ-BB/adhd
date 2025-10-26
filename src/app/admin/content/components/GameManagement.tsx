'use client'

import { useState } from 'react'
import { Game, GameType, GameConfig } from '@/types/learning-path'
import { createGame, updateGame, deleteGame } from '@/actions/content-management'
import { useRouter } from 'next/navigation'
import MatchingGameConfig from './game-configs/MatchingGameConfig'
import MemoryGameConfig from './game-configs/MemoryGameConfig'
import NumberSequenceGameConfig from './game-configs/NumberSequenceGameConfig'
import AttentionGameConfig from './game-configs/AttentionGameConfig'
import SortingGameConfig from './game-configs/SortingGameConfig'
import AimingGameConfig from './game-configs/AimingGameConfig'

interface GameManagementProps {
  initialGames: Game[]
}

const gameTypes: { value: GameType; label: string; icon: string }[] = [
  { value: 'matching', label: 'Matching Game', icon: '🎯' },
  { value: 'memory', label: 'Memory Game', icon: '🧠' },
  { value: 'sequence', label: 'Sequence Game', icon: '🔢' },
  { value: 'attention', label: 'Attention Game', icon: '👀' },
  { value: 'sorting', label: 'Sorting Game', icon: '📊' },
  { value: 'aiming', label: 'Aiming Game', icon: '🎪' }
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
    config: { itemCount: 5, category: 'colors' } as GameConfig,
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setFormData({
      type: 'matching',
      name: '',
      name_ar: '',
      description: '',
      description_ar: '',
      difficulty_level: 1,
      config: { itemCount: 5, category: 'colors' },
      is_active: true
    })
    setSelectedType('matching')
    setIsCreating(false)
    setEditingGame(null)
    setError(null)
    setValidationErrors({})
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Name validation (English)
    if (!formData.name.trim()) {
      errors.name = 'Game name is required'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Name must not exceed 100 characters'
    }

    // Check for duplicate name (case-insensitive, excluding current game if editing)
    const duplicateName = games.find(
      g => g.name.toLowerCase() === formData.name.trim().toLowerCase() 
        && (!editingGame || g.id !== editingGame.id)
    )
    if (duplicateName) {
      errors.name = 'A game with this name already exists'
    }

    // Name Arabic validation (optional but check length if provided)
    if (formData.name_ar.trim() && formData.name_ar.trim().length < 2) {
      errors.name_ar = 'Arabic name must be at least 2 characters'
    } else if (formData.name_ar.trim().length > 100) {
      errors.name_ar = 'Arabic name must not exceed 100 characters'
    }

    // Description validation (optional but check length if provided)
    if (formData.description.trim().length > 500) {
      errors.description = 'Description must not exceed 500 characters'
    }

    if (formData.description_ar.trim().length > 500) {
      errors.description_ar = 'Arabic description must not exceed 500 characters'
    }

    // Difficulty level validation
    if (formData.difficulty_level < 1 || formData.difficulty_level > 5) {
      errors.difficulty_level = 'Difficulty must be between 1 and 5'
    }

    // Game-specific config validation
    if (formData.type === 'matching') {
      const config = formData.config as any
      
      // Define available pairs for each built-in category
      const availablePairs: Record<string, number> = {
        colors: 5,
        shapes: 5,
        animals: 5
      }
      
      // Check if category is selected
      if (!config.category) {
        errors.config = 'Please select a matching category'
      } else if (!config.itemCount || config.itemCount < 3) {
        errors.config = 'Item count must be at least 3'
      } else if (config.category === 'custom') {
        // For custom category, validate custom pairs
        if (!config.customPairs || config.customPairs.length === 0) {
          errors.config = 'Custom matching game must have at least one pair'
        } else {
          // Validate each pair has both values
          const invalidPairs = config.customPairs.some((p: any) => 
            !p.left?.trim() || !p.right?.trim()
          )
          if (invalidPairs) {
            errors.config = 'All custom pairs must have both left and right values'
          } else if (config.customPairs.length < config.itemCount) {
            errors.config = `You need at least ${config.itemCount} custom pairs (currently have ${config.customPairs.length})`
          }
        }
      } else {
        // For built-in categories, check if itemCount exceeds available pairs
        const maxPairs = availablePairs[config.category] || 0
        if (config.itemCount > maxPairs) {
          errors.config = `The "${config.category}" category only has ${maxPairs} pairs available. Reduce item count to ${maxPairs} or less, or use custom pairs.`
        }
      }
    } else if (formData.type === 'memory') {
      const config = formData.config as any
      
      // Define available cards for each built-in theme
      const availableCards: Record<string, number> = {
        animals: 8,
        shapes: 6,
        colors: 6
      }
      
      // Check if theme is selected
      if (!config.theme) {
        errors.config = 'Please select a memory game theme'
      } else if (!config.pairs || config.pairs < 3) {
        errors.config = 'Number of pairs must be at least 3'
      } else if (config.theme === 'custom') {
        // For custom theme, validate custom cards
        if (!config.customCards || config.customCards.length === 0) {
          errors.config = 'Custom memory game must have at least one card'
        } else {
          // Validate each card has required fields
          const invalidCards = config.customCards.some((c: any) => {
            if (!c.label?.trim()) return true
            // If emoji type, must have value; if image type, must have imageUrl
            if (c.type === 'emoji' && !c.value?.trim()) return true
            if (c.type === 'image' && !c.imageUrl) return true
            return false
          })
          if (invalidCards) {
            errors.config = 'All custom cards must have a label and either an emoji/text or an image'
          } else if (config.customCards.length < config.pairs) {
            errors.config = `You need at least ${config.pairs} custom cards (currently have ${config.customCards.length})`
          }
        }
      } else {
        // For built-in themes, check if pairs exceeds available cards
        const maxCards = availableCards[config.theme] || 0
        if (config.pairs > maxCards) {
          errors.config = `The "${config.theme}" theme only has ${maxCards} cards available. Reduce pairs to ${maxCards} or less, or use custom cards.`
        }
      }
    } else if (formData.type === 'sequence') {
      const config = formData.config as any
      
      // Validate difficulty
      const validDifficulties = ['very_easy', 'easy', 'easy_medium', 'medium', 'medium_hard', 'hard', 'very_hard']
      if (!config.difficulty || !validDifficulties.includes(config.difficulty)) {
        errors.config = 'Please select a valid difficulty level'
      }
      
      // Validate sequence length
      if (!config.sequenceLength || config.sequenceLength < 3) {
        errors.config = 'Sequence length must be at least 3'
      } else if (config.sequenceLength > 7) {
        errors.config = 'Sequence length must not exceed 7'
      }
    } else if (formData.type === 'attention') {
      const config = formData.config as any
      
      // Validate difficulty
      const validDifficulties = ['very_easy', 'easy', 'easy_medium', 'medium', 'medium_hard', 'hard', 'very_hard']
      if (!config.difficulty || !validDifficulties.includes(config.difficulty)) {
        errors.config = 'Please select a valid difficulty level'
      }
      
      // Validate target count
      if (!config.targetCount || config.targetCount < 2) {
        errors.config = 'Target count must be at least 2'
      } else {
        // Validate target count doesn't exceed limits based on difficulty (40% of total items)
        const maxTargets: Record<string, number> = {
          very_easy: 3,      // 8 * 0.4 = 3.2
          easy: 5,           // 12 * 0.4 = 4.8
          easy_medium: 6,    // 16 * 0.4 = 6.4
          medium: 8,         // 20 * 0.4 = 8
          medium_hard: 10,   // 25 * 0.4 = 10
          hard: 12,          // 30 * 0.4 = 12
          very_hard: 16      // 40 * 0.4 = 16
        }
        const max = maxTargets[config.difficulty] || 5
        if (config.targetCount > max) {
          errors.config = `For ${config.difficulty.replace('_', '-')} difficulty, target count must not exceed ${max}`
        }
      }
      
      // Validate duration
      if (!config.duration || config.duration < 30) {
        errors.config = 'Duration must be at least 30 seconds'
      } else if (config.duration > 180) {
        errors.config = 'Duration must not exceed 180 seconds'
      }
    } else if (formData.type === 'sorting') {
      const config = formData.config as any
      
      // Validate category type
      if (!config.categoryType) {
        errors.config = 'Please select a category type'
      } else if (!config.itemCount || config.itemCount < 4) {
        errors.config = 'Item count must be at least 4'
      } else if (config.categoryType === 'custom') {
        // For custom category, validate custom categories and items
        if (!config.customCategories || config.customCategories.length < 2) {
          errors.config = 'Custom sorting game must have at least 2 categories'
        } else if (!config.customItems || config.customItems.length === 0) {
          errors.config = 'Custom sorting game must have at least one item'
        } else {
          // Validate each category has required fields
          const invalidCategories = config.customCategories.some((cat: any) => 
            !cat.name?.trim() || !cat.emoji?.trim() || !cat.color
          )
          if (invalidCategories) {
            errors.config = 'All custom categories must have a name, emoji, and color'
          }
          
          // Validate each item has required fields
          const invalidItems = config.customItems.some((item: any) => 
            !item.value?.trim() || !item.emoji?.trim() || !item.category
          )
          if (invalidItems) {
            errors.config = 'All custom items must have a name, emoji, and category'
          } else if (config.customItems.length < config.itemCount) {
            errors.config = `You need at least ${config.itemCount} custom items (currently have ${config.customItems.length})`
          }
        }
      }
    } else if (formData.type === 'aiming') {
      const config = formData.config as any
      
      // Validate difficulty
      const validDifficulties = ['very_easy', 'easy', 'easy_medium', 'medium', 'medium_hard', 'hard', 'very_hard']
      if (!config.difficulty || !validDifficulties.includes(config.difficulty)) {
        errors.config = 'Please select a valid difficulty level'
      }
      
      // Validate duration
      if (!config.duration || config.duration < 30) {
        errors.config = 'Duration must be at least 30 seconds'
      } else if (config.duration > 180) {
        errors.config = 'Duration must not exceed 180 seconds'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isFormValid = (): boolean => {
    // Quick validation check without setting errors (for real-time button state)
    // Name validation
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      return false
    }

    // Check for duplicate name
    const duplicateName = games.find(
      g => g.name.toLowerCase() === formData.name.trim().toLowerCase() 
        && (!editingGame || g.id !== editingGame.id)
    )
    if (duplicateName) {
      return false
    }

    // Difficulty validation
    if (formData.difficulty_level < 1 || formData.difficulty_level > 5) {
      return false
    }

    // Game-specific config validation
    if (formData.type === 'matching') {
      const config = formData.config as any
      const availablePairs: Record<string, number> = {
        colors: 5,
        shapes: 5,
        animals: 5
      }

      if (!config.category || !config.itemCount || config.itemCount < 3) {
        return false
      }

      if (config.category === 'custom') {
        if (!config.customPairs || config.customPairs.length === 0) {
          return false
        }
        const invalidPairs = config.customPairs.some((p: any) => 
          !p.left?.trim() || !p.right?.trim()
        )
        if (invalidPairs || config.customPairs.length < config.itemCount) {
          return false
        }
      } else {
        const maxPairs = availablePairs[config.category] || 0
        if (config.itemCount > maxPairs) {
          return false
        }
      }
    } else if (formData.type === 'memory') {
      const config = formData.config as any
      const availableCards: Record<string, number> = {
        animals: 8,
        shapes: 6,
        colors: 6
      }

      if (!config.theme || !config.pairs || config.pairs < 3) {
        return false
      }

      if (config.theme === 'custom') {
        if (!config.customCards || config.customCards.length === 0) {
          return false
        }
        const invalidCards = config.customCards.some((c: any) => {
          if (!c.label?.trim()) return true
          if (c.type === 'emoji' && !c.value?.trim()) return true
          if (c.type === 'image' && !c.imageUrl) return true
          return false
        })
        if (invalidCards || config.customCards.length < config.pairs) {
          return false
        }
      } else {
        const maxCards = availableCards[config.theme] || 0
        if (config.pairs > maxCards) {
          return false
        }
      }
    } else if (formData.type === 'sequence') {
      const config = formData.config as any
      
      // Validate difficulty
      const validDifficulties = ['very_easy', 'easy', 'easy_medium', 'medium', 'medium_hard', 'hard', 'very_hard']
      if (!config.difficulty || !validDifficulties.includes(config.difficulty)) {
        return false
      }
      
      // Validate sequence length
      if (!config.sequenceLength || config.sequenceLength < 3 || config.sequenceLength > 7) {
        return false
      }
    } else if (formData.type === 'attention') {
      const config = formData.config as any
      
      // Validate difficulty
      const validDifficulties = ['very_easy', 'easy', 'easy_medium', 'medium', 'medium_hard', 'hard', 'very_hard']
      if (!config.difficulty || !validDifficulties.includes(config.difficulty)) {
        return false
      }
      
      // Validate target count
      if (!config.targetCount || config.targetCount < 2) {
        return false
      } else {
        const maxTargets: Record<string, number> = {
          very_easy: 3,
          easy: 5,
          easy_medium: 6,
          medium: 8,
          medium_hard: 10,
          hard: 12,
          very_hard: 16
        }
        const max = maxTargets[config.difficulty] || 5
        if (config.targetCount > max) {
          return false
        }
      }
      
      // Validate duration
      if (!config.duration || config.duration < 30 || config.duration > 180) {
        return false
      }
    } else if (formData.type === 'sorting') {
      const config = formData.config as any
      
      if (!config.categoryType || !config.itemCount || config.itemCount < 4) {
        return false
      }
      
      if (config.categoryType === 'custom') {
        if (!config.customCategories || config.customCategories.length < 2) {
          return false
        }
        if (!config.customItems || config.customItems.length === 0) {
          return false
        }
        const invalidCategories = config.customCategories.some((cat: any) => 
          !cat.name?.trim() || !cat.emoji?.trim() || !cat.color
        )
        const invalidItems = config.customItems.some((item: any) => 
          !item.value?.trim() || !item.emoji?.trim() || !item.category
        )
        if (invalidCategories || invalidItems || config.customItems.length < config.itemCount) {
          return false
        }
      }
    } else if (formData.type === 'aiming') {
      const config = formData.config as any
      
      // Validate difficulty
      const validDifficulties = ['very_easy', 'easy', 'easy_medium', 'medium', 'medium_hard', 'hard', 'very_hard']
      if (!config.difficulty || !validDifficulties.includes(config.difficulty)) {
        return false
      }
      
      // Validate duration
      if (!config.duration || config.duration < 30 || config.duration > 180) {
        return false
      }
    }

    return true
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
    setError(null)
    setValidationErrors({})

    // Validate form
    if (!validateForm()) {
      setError('Please fix the validation errors below')
      return
    }

    setLoading(true)

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
    // Clear config validation errors when config changes
    if (validationErrors.config) {
      const newErrors = { ...validationErrors }
      delete newErrors.config
      setValidationErrors(newErrors)
    }
  }

  const handleTypeChange = (type: GameType) => {
    setSelectedType(type)
    // Set appropriate default config based on game type
    let defaultConfig: any = {}
    if (type === 'matching') {
      defaultConfig = { itemCount: 5, category: 'colors' }
    } else if (type === 'memory') {
      defaultConfig = { pairs: 4, timeLimit: 60, theme: 'animals' }
    } else if (type === 'sequence') {
      defaultConfig = { difficulty: 'easy', sequenceLength: 4 }
    } else if (type === 'attention') {
      defaultConfig = { difficulty: 'easy', targetCount: 3, duration: 60 }
    } else if (type === 'sorting') {
      defaultConfig = { categoryType: 'colors', itemCount: 8 }
    } else if (type === 'aiming') {
      defaultConfig = { difficulty: 'easy', duration: 60 }
    }
    setFormData({ ...formData, type, config: defaultConfig })
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
            {/* Validation Error Summary */}
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-red-400 text-xl">⚠️</span>
                  <div className="flex-1">
                    <div className="font-medium text-red-300">{error}</div>
                    {Object.keys(validationErrors).length > 0 && (
                      <ul className="mt-2 space-y-1 text-sm text-red-300">
                        {Object.entries(validationErrors).map(([field, err]) => (
                          <li key={field}>• {err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

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
                  className={`w-full px-4 py-2 bg-black/50 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                    validationErrors.name 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-purple-800/50 focus:ring-purple-500'
                  }`}
                  placeholder="Color Match"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.name}</p>
                )}
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
                  className={`w-full px-4 py-2 bg-black/50 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                    validationErrors.name_ar 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-purple-800/50 focus:ring-purple-500'
                  }`}
                  placeholder="مطابقة الألوان"
                />
                {validationErrors.name_ar && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.name_ar}</p>
                )}
              </div>
            </div>

            {/* Description (English) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (English)
                <span className="text-xs text-gray-500 ml-2">({formData.description.length}/500)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className={`w-full px-4 py-2 bg-black/50 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                  validationErrors.description 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-purple-800/50 focus:ring-purple-500'
                }`}
                placeholder="Match items with their correct colors"
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.description}</p>
              )}
            </div>

            {/* Description (Arabic) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Arabic)
                <span className="text-xs text-gray-500 ml-2">({formData.description_ar.length}/500)</span>
              </label>
              <textarea
                dir="rtl"
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                rows={2}
                className={`w-full px-4 py-2 bg-black/50 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                  validationErrors.description_ar 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-purple-800/50 focus:ring-purple-500'
                }`}
                placeholder="طابق العناصر مع ألوانها الصحيحة"
              />
              {validationErrors.description_ar && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.description_ar}</p>
              )}
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
                onChange={(e) => setFormData({ ...formData, difficulty_level: parseInt(e.target.value) || 1 })}
                className={`w-full px-4 py-2 bg-black/50 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                  validationErrors.difficulty_level 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-purple-800/50 focus:ring-purple-500'
                }`}
              />
              {validationErrors.difficulty_level && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.difficulty_level}</p>
              )}
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

              {selectedType === 'sequence' && (
                <NumberSequenceGameConfig 
                  config={formData.config} 
                  onChange={handleConfigChange}
                />
              )}

              {selectedType === 'attention' && (
                <AttentionGameConfig 
                  config={formData.config} 
                  onChange={handleConfigChange}
                />
              )}

              {selectedType === 'sorting' && (
                <SortingGameConfig 
                  config={formData.config} 
                  onChange={handleConfigChange}
                />
              )}

              {selectedType === 'aiming' && (
                <AimingGameConfig 
                  config={formData.config} 
                  onChange={handleConfigChange}
                />
              )}

              {!['matching', 'memory', 'sequence', 'attention', 'sorting', 'aiming'].includes(selectedType) && (
                <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300 text-sm">
                  ⚠️ Configuration UI for {selectedType} games coming soon. You can still create the game, and config can be added later.
                </div>
              )}

              {validationErrors.config && (
                <div className="mt-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                  {validationErrors.config}
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

            {/* Actions */}
            <div className="space-y-2">
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading || !isFormValid()}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!isFormValid() ? 'Please fix validation errors before submitting' : ''}
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
              {!loading && !isFormValid() && (
                <div className="text-sm text-yellow-400 flex items-start gap-2">
                  <span>⚠️</span>
                  <span>Submit is disabled: Please complete all required fields and fix any validation errors.</span>
                </div>
              )}
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


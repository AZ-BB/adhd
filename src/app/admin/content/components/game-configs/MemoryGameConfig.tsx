'use client'

import { useState, useEffect } from 'react'
import { GameConfig } from '@/types/learning-path'
import { uploadImageFromFormData, deleteGameImage } from '@/actions/storage'

interface MemoryGameConfigProps {
  config: GameConfig
  onChange: (config: GameConfig) => void
}

interface CardItem {
  id: string
  value: string
  label: string
  imageUrl?: string
  imagePath?: string
  type: 'emoji' | 'image'
}

const defaultThemes = {
  animals: {
    name: 'Animals (Emojis)',
    cards: [
      { id: 'dog', value: 'dog', label: 'Dog', emoji: '🐕' },
      { id: 'cat', value: 'cat', label: 'Cat', emoji: '🐈' },
      { id: 'rabbit', value: 'rabbit', label: 'Rabbit', emoji: '🐰' },
      { id: 'bear', value: 'bear', label: 'Bear', emoji: '🐻' },
      { id: 'lion', value: 'lion', label: 'Lion', emoji: '🦁' },
      { id: 'tiger', value: 'tiger', label: 'Tiger', emoji: '🐯' },
      { id: 'elephant', value: 'elephant', label: 'Elephant', emoji: '🐘' },
      { id: 'monkey', value: 'monkey', label: 'Monkey', emoji: '🐵' }
    ]
  },
  shapes: {
    name: 'Shapes (Emojis)',
    cards: [
      { id: 'circle', value: 'circle', label: 'Circle', emoji: '⭕' },
      { id: 'square', value: 'square', label: 'Square', emoji: '⬜' },
      { id: 'triangle', value: 'triangle', label: 'Triangle', emoji: '🔺' },
      { id: 'star', value: 'star', label: 'Star', emoji: '⭐' },
      { id: 'heart', value: 'heart', label: 'Heart', emoji: '❤️' },
      { id: 'diamond', value: 'diamond', label: 'Diamond', emoji: '💎' }
    ]
  },
  colors: {
    name: 'Colors (Emojis)',
    cards: [
      { id: 'red', value: 'red', label: 'Red', emoji: '🔴' },
      { id: 'blue', value: 'blue', label: 'Blue', emoji: '🔵' },
      { id: 'green', value: 'green', label: 'Green', emoji: '🟢' },
      { id: 'yellow', value: 'yellow', label: 'Yellow', emoji: '🟡' },
      { id: 'purple', value: 'purple', label: 'Purple', emoji: '🟣' },
      { id: 'orange', value: 'orange', label: 'Orange', emoji: '🟠' }
    ]
  }
}

export default function MemoryGameConfig({ config, onChange }: MemoryGameConfigProps) {
  const [pairs, setPairs] = useState(config.pairs || 4)
  const [timeLimit, setTimeLimit] = useState(config.timeLimit || 60)
  const [theme, setTheme] = useState(config.theme || 'animals')
  const [customCards, setCustomCards] = useState<CardItem[]>(
    (config as any).customCards || []
  )
  const [showCustomEditor, setShowCustomEditor] = useState(theme === 'custom')
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    const newConfig: GameConfig = {
      pairs,
      timeLimit,
      theme
    }

    if (theme === 'custom' && customCards.length > 0) {
      (newConfig as any).customCards = customCards
    }

    onChange(newConfig)
  }, [pairs, timeLimit, theme, customCards])

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    setShowCustomEditor(newTheme === 'custom')
    
    // Initialize with empty cards if switching to custom
    if (newTheme === 'custom' && customCards.length === 0) {
      const initialCards: CardItem[] = []
      for (let i = 0; i < pairs; i++) {
        initialCards.push({
          id: `custom-${i}`,
          value: `card-${i}`,
          label: '',
          type: 'emoji'
        })
      }
      setCustomCards(initialCards)
    }
  }

  const addCustomCard = () => {
    setCustomCards([
      ...customCards,
      {
        id: `custom-${Date.now()}`,
        value: `card-${customCards.length}`,
        label: '',
        type: 'emoji'
      }
    ])
  }

  const removeCustomCard = async (index: number) => {
    const card = customCards[index]
    // Delete image if exists
    if (card.imagePath) {
      await deleteGameImage(card.imagePath)
    }
    setCustomCards(customCards.filter((_, i) => i !== index))
  }

  const updateCustomCard = (index: number, updates: Partial<CardItem>) => {
    const newCards = [...customCards]
    newCards[index] = { ...newCards[index], ...updates }
    setCustomCards(newCards)
  }

  const handleImageUpload = async (index: number, file: File) => {
    setUploadingIndex(index)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('gameType', 'memory')

      const result = await uploadImageFromFormData(formData)

      if ('error' in result) {
        setUploadError(result.error)
      } else {
        // Delete old image if exists
        const oldPath = customCards[index].imagePath
        if (oldPath) {
          await deleteGameImage(oldPath)
        }

        updateCustomCard(index, {
          type: 'image',
          imageUrl: result.url,
          imagePath: result.path
        })
      }
    } catch (error) {
      setUploadError('Failed to upload image')
    } finally {
      setUploadingIndex(null)
    }
  }

  const handleFileSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(index, file)
    }
  }

  const switchToEmoji = async (index: number) => {
    const card = customCards[index]
    // Delete image if exists
    if (card.imagePath) {
      await deleteGameImage(card.imagePath)
    }
    updateCustomCard(index, {
      type: 'emoji',
      imageUrl: undefined,
      imagePath: undefined,
      value: card.label.toLowerCase().replace(/\s+/g, '-') || `card-${index}`
    })
  }

  return (
    <div className="space-y-4">
      {/* Number of Pairs */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Number of Pairs *
        </label>
        <input
          type="number"
          min="3"
          max="12"
          value={pairs}
          onChange={(e) => setPairs(parseInt(e.target.value) || 4)}
          className="w-full px-4 py-2 bg-black/50 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          How many card pairs (3-12). Total cards will be pairs × 2.
        </p>
      </div>

      {/* Time Limit */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Time Limit (seconds)
        </label>
        <input
          type="number"
          min="30"
          max="300"
          value={timeLimit}
          onChange={(e) => setTimeLimit(parseInt(e.target.value) || 60)}
          className="w-full px-4 py-2 bg-black/50 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Time limit in seconds (30-300). Set 0 for no limit.
        </p>
      </div>

      {/* Theme Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Card Theme *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(defaultThemes).map(([key, themeData]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleThemeChange(key)}
              className={`p-3 rounded-lg border transition-all ${
                theme === key
                  ? 'border-purple-500 bg-purple-600/20 text-white'
                  : 'border-purple-800/30 bg-black/20 text-gray-400 hover:border-purple-700/50'
              }`}
            >
              {themeData.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleThemeChange('custom')}
            className={`p-3 rounded-lg border transition-all ${
              theme === 'custom'
                ? 'border-purple-500 bg-purple-600/20 text-white'
                : 'border-purple-800/30 bg-black/20 text-gray-400 hover:border-purple-700/50'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Preview Default Theme */}
      {theme !== 'custom' && (
        <div className="p-4 bg-black/30 border border-purple-800/30 rounded-lg">
          <div className="text-sm font-medium text-gray-300 mb-3">
            Preview Cards (showing {Math.min(pairs, defaultThemes[theme as keyof typeof defaultThemes].cards.length)} pairs)
          </div>
          <div className="grid grid-cols-4 gap-2">
            {defaultThemes[theme as keyof typeof defaultThemes].cards
              .slice(0, pairs)
              .map((card) => (
                <div
                  key={card.id}
                  className="aspect-square bg-purple-900/20 rounded-lg flex flex-col items-center justify-center p-2 text-center"
                >
                  <div className="text-3xl mb-1">{card.emoji}</div>
                  <div className="text-xs text-gray-400">{card.label}</div>
                </div>
              ))}
          </div>
          {pairs > defaultThemes[theme as keyof typeof defaultThemes].cards.length && (
            <div className="mt-2 text-xs text-yellow-400">
              ⚠️ Only {defaultThemes[theme as keyof typeof defaultThemes].cards.length} cards available. Reduce pairs or use custom cards.
            </div>
          )}
        </div>
      )}

      {/* Custom Cards Editor */}
      {showCustomEditor && (
        <div className="p-4 bg-black/30 border border-purple-800/30 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-300">
                Custom Memory Cards
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Upload images or use emojis/text. Each card will appear twice.
              </div>
            </div>
            <button
              type="button"
              onClick={addCustomCard}
              className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-all"
            >
              + Add Card
            </button>
          </div>

          {uploadError && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {uploadError}
            </div>
          )}

          {customCards.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              No cards yet. Click "Add Card" to create your first card.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {customCards.map((card, index) => (
                <div key={card.id} className="p-3 bg-black/50 border border-purple-800/50 rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    {/* Preview */}
                    <div className="w-20 h-20 bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      {card.type === 'image' && card.imageUrl ? (
                        <img 
                          src={card.imageUrl} 
                          alt={card.label}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-2xl">{card.value || '?'}</div>
                      )}
                    </div>

                    {/* Card Info */}
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder="Card label"
                        value={card.label}
                        onChange={(e) => updateCustomCard(index, { label: e.target.value })}
                        className="w-full px-2 py-1 bg-black/50 border border-purple-800/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      
                      {card.type === 'emoji' ? (
                        <input
                          type="text"
                          placeholder="Emoji or text (e.g., 🐶)"
                          value={card.value}
                          onChange={(e) => updateCustomCard(index, { value: e.target.value })}
                          className="w-full px-2 py-1 bg-black/50 border border-purple-800/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      ) : null}

                      {/* Actions */}
                      <div className="flex gap-1">
                        {card.type === 'emoji' ? (
                          <label className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileSelect(index, e)}
                              disabled={uploadingIndex === index}
                              className="hidden"
                            />
                            <div className="px-2 py-1 bg-blue-600/20 border border-blue-500/50 rounded text-blue-300 text-xs text-center cursor-pointer hover:bg-blue-600/30">
                              {uploadingIndex === index ? 'Uploading...' : '📷 Upload'}
                            </div>
                          </label>
                        ) : (
                          <button
                            type="button"
                            onClick={() => switchToEmoji(index)}
                            className="flex-1 px-2 py-1 bg-yellow-600/20 border border-yellow-500/50 rounded text-yellow-300 text-xs hover:bg-yellow-600/30"
                          >
                            Switch to Emoji
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeCustomCard(index)}
                          className="px-2 py-1 bg-red-600/20 border border-red-500/50 rounded text-red-300 text-xs hover:bg-red-600/30"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {customCards.length > 0 && customCards.length < pairs && (
            <div className="text-xs text-yellow-400">
              ⚠️ You have {customCards.length} cards but need {pairs}. Add more cards or reduce pairs.
            </div>
          )}
        </div>
      )}

      {/* Configuration Summary */}
      <div className="p-3 bg-purple-900/20 border border-purple-800/30 rounded-lg">
        <div className="text-xs text-gray-400">Configuration Summary</div>
        <div className="text-sm text-white mt-1">
          • Pairs: <span className="text-purple-400">{pairs}</span> ({pairs * 2} cards)<br />
          • Time limit: <span className="text-purple-400">{timeLimit}s</span><br />
          • Theme: <span className="text-purple-400">{theme}</span><br />
          {theme === 'custom' && (
            <>• Custom cards: <span className="text-purple-400">{customCards.length}</span></>
          )}
        </div>
      </div>
    </div>
  )
}


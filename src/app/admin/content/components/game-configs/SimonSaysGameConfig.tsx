'use client'

import { useState, useEffect } from 'react'
import { GameConfig } from '@/types/learning-path'
import { uploadImageFromFormData, deleteGameImage } from '@/actions/storage'

interface SimonSaysGameConfigProps {
  config: GameConfig
  onChange: (config: GameConfig) => void
}

interface CustomSimonItem {
  id: string
  label: string
  type: 'emoji' | 'image'
  emoji?: string
  imageUrl?: string
  imagePath?: string
  color: string
  sound: string
}

export default function SimonSaysGameConfig({ config, onChange }: SimonSaysGameConfigProps) {
  const [difficulty, setDifficulty] = useState(config.difficulty || 'easy')
  const [simonTheme, setSimonTheme] = useState(config.simonTheme || 'colors')
  const [maxLevel, setMaxLevel] = useState(config.maxLevel || 10)
  const [customItems, setCustomItems] = useState<CustomSimonItem[]>(
    (config as any).customSimonItems || []
  )
  const [showCustomEditor, setShowCustomEditor] = useState(simonTheme === 'custom')
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    const newConfig: GameConfig = {
      difficulty,
      simonTheme,
      maxLevel
    }

    if (simonTheme === 'custom' && customItems.length > 0) {
      (newConfig as any).customSimonItems = customItems
    }

    onChange(newConfig)
  }, [difficulty, simonTheme, maxLevel, customItems])

  const difficultyLevels = [
    { 
      value: 'very_easy', 
      label: 'Very Easy',
      description: 'Starts at 2, slow speed (1.2s)'
    },
    { 
      value: 'easy', 
      label: 'Easy',
      description: 'Starts at 2, moderate speed (1.0s)'
    },
    { 
      value: 'easy_medium', 
      label: 'Easy-Medium',
      description: 'Starts at 3, moderate speed (0.85s)'
    },
    { 
      value: 'medium', 
      label: 'Medium',
      description: 'Starts at 3, good speed (0.7s)'
    },
    { 
      value: 'medium_hard', 
      label: 'Medium-Hard',
      description: 'Starts at 3, fast speed (0.6s)'
    },
    { 
      value: 'hard', 
      label: 'Hard',
      description: 'Starts at 4, fast speed (0.5s)'
    },
    { 
      value: 'very_hard', 
      label: 'Very Hard',
      description: 'Starts at 4, very fast (0.4s)'
    }
  ]

  const themes = [
    { 
      value: 'colors', 
      label: 'Colors',
      preview: '🔴🔵🟢🟡',
      description: 'Red, Blue, Green, Yellow'
    },
    { 
      value: 'shapes', 
      label: 'Shapes',
      preview: '⭕⬜🔺⭐',
      description: 'Circle, Square, Triangle, Star'
    },
    { 
      value: 'animals', 
      label: 'Animals',
      preview: '🐕🐈🐰🐻',
      description: 'Dog, Cat, Rabbit, Bear'
    },
    { 
      value: 'food', 
      label: 'Food',
      preview: '🍎🍌🍇🍊',
      description: 'Apple, Banana, Grapes, Orange'
    },
    { 
      value: 'numbers', 
      label: 'Numbers',
      preview: '1️⃣2️⃣3️⃣4️⃣',
      description: 'Numbers 1-4'
    },
    { 
      value: 'custom', 
      label: 'Custom Images',
      preview: '📷🖼️✨',
      description: 'Upload your own 4 items'
    }
  ]

  const predefinedColors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-cyan-500']
  const predefinedSounds = ['261.63', '329.63', '392.00', '523.25']

  const handleThemeChange = (newTheme: string) => {
    setSimonTheme(newTheme)
    setShowCustomEditor(newTheme === 'custom')
    
    // Initialize with 4 items if switching to custom
    if (newTheme === 'custom' && customItems.length === 0) {
      const initialItems: CustomSimonItem[] = []
      for (let i = 0; i < 4; i++) {
        initialItems.push({
          id: `custom-${i}`,
          label: '',
          type: 'emoji',
          emoji: '',
          color: predefinedColors[i],
          sound: predefinedSounds[i]
        })
      }
      setCustomItems(initialItems)
    }
  }

  const updateCustomItem = (index: number, updates: Partial<CustomSimonItem>) => {
    const newItems = [...customItems]
    newItems[index] = { ...newItems[index], ...updates }
    setCustomItems(newItems)
  }

  const clearItemImage = async (index: number) => {
    const item = customItems[index]
    // Delete image if exists
    if (item.imagePath) {
      await deleteGameImage(item.imagePath)
    }
    // Clear image but keep the item
    updateCustomItem(index, {
      type: 'emoji',
      imageUrl: undefined,
      imagePath: undefined,
      emoji: ''
    })
  }

  const handleImageUpload = async (index: number, file: File) => {
    setUploadingIndex(index)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('gameType', 'simon')

      const result = await uploadImageFromFormData(formData)

      if ('error' in result) {
        setUploadError(result.error)
      } else {
        // Delete old image if exists
        const oldPath = customItems[index].imagePath
        if (oldPath) {
          await deleteGameImage(oldPath)
        }

        updateCustomItem(index, {
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

  return (
    <div className="space-y-4">
      {/* Theme Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Game Theme *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {themes.map((themeOption) => (
            <button
              key={themeOption.value}
              type="button"
              onClick={() => handleThemeChange(themeOption.value)}
              className={`p-3 rounded-lg border text-left transition-all ${
                simonTheme === themeOption.value
                  ? 'border-purple-500 bg-purple-600/20 text-white'
                  : 'border-purple-800/30 bg-black/20 text-gray-400 hover:border-purple-700/50'
              }`}
            >
              <div className="font-medium mb-1">{themeOption.label}</div>
              <div className="text-2xl mb-1">{themeOption.preview}</div>
              <div className="text-xs opacity-75">{themeOption.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Items Editor */}
      {showCustomEditor && (
        <div className="p-4 bg-black/30 border border-purple-800/30 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-300">
                Custom Simon Items
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Upload 4 custom images or use emojis. Each gets a unique sound.
              </div>
            </div>
            <div className="px-3 py-2 bg-purple-900/30 text-white text-sm rounded-lg border border-purple-700/50">
              {customItems.length} / 4 Items
            </div>
          </div>

          {uploadError && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {uploadError}
            </div>
          )}

          {customItems.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              No items yet. Switch to custom theme to create items.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {customItems.map((item, index) => (
                <div key={item.id} className="p-3 bg-black/50 border border-purple-800/50 rounded-lg space-y-2">
                  {/* Preview with color */}
                  <div className={`w-full aspect-square ${item.color} rounded-lg flex items-center justify-center overflow-hidden`}>
                    {item.type === 'image' && item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-4xl">{item.emoji || '?'}</div>
                    )}
                  </div>

                  {/* Label Input */}
                  <input
                    type="text"
                    placeholder={`Item ${index + 1} label`}
                    value={item.label}
                    onChange={(e) => updateCustomItem(index, { label: e.target.value })}
                    className="w-full px-2 py-1 bg-black/50 border border-purple-800/30 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  
                  {item.type === 'emoji' && (
                    <input
                      type="text"
                      placeholder="Emoji (e.g., 🎵)"
                      value={item.emoji || ''}
                      onChange={(e) => updateCustomItem(index, { emoji: e.target.value })}
                      className="w-full px-2 py-1 bg-black/50 border border-purple-800/30 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  )}

                  {/* Color Picker */}
                  <div>
                    <label className="text-xs text-gray-400">Button Color:</label>
                    <select
                      value={item.color}
                      onChange={(e) => updateCustomItem(index, { color: e.target.value })}
                      className="w-full px-2 py-1 bg-black/50 border border-purple-800/30 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="bg-red-500">🔴 Red</option>
                      <option value="bg-blue-500">🔵 Blue</option>
                      <option value="bg-green-500">🟢 Green</option>
                      <option value="bg-yellow-500">🟡 Yellow</option>
                      <option value="bg-purple-500">🟣 Purple</option>
                      <option value="bg-pink-500">🌸 Pink</option>
                      <option value="bg-orange-500">🟠 Orange</option>
                      <option value="bg-cyan-500">🔷 Cyan</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    {item.type === 'emoji' ? (
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
                        onClick={() => clearItemImage(index)}
                        className="flex-1 px-2 py-1 bg-orange-600/20 border border-orange-500/50 rounded text-orange-300 text-xs hover:bg-orange-600/30"
                      >
                        🗑️ Clear
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {customItems.length !== 4 && (
            <div className="text-xs text-yellow-400">
              ⚠️ Simon Says game needs exactly 4 items. Current: {customItems.length}
            </div>
          )}
        </div>
      )}

      {/* Difficulty Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Difficulty Level *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {difficultyLevels.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setDifficulty(level.value)}
              className={`p-3 rounded-lg border text-left transition-all ${
                difficulty === level.value
                  ? 'border-purple-500 bg-purple-600/20 text-white'
                  : 'border-purple-800/30 bg-black/20 text-gray-400 hover:border-purple-700/50'
              }`}
            >
              <div className="font-medium mb-1">{level.label}</div>
              <div className="text-xs opacity-75">{level.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Max Level */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Maximum Level *
        </label>
        <input
          type="number"
          min="5"
          max="20"
          value={maxLevel}
          onChange={(e) => setMaxLevel(parseInt(e.target.value) || 10)}
          className="w-full px-4 py-2 bg-black/50 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          How many levels before game ends (5-20). Each level adds one item to the sequence.
        </p>
      </div>

      {/* Difficulty Stats Preview */}
      <div className="p-4 bg-black/30 border border-purple-800/30 rounded-lg">
        <div className="text-sm font-medium text-gray-300 mb-3">
          Current Settings Preview
        </div>
        {(() => {
          const settings = {
            very_easy: { start: 2, speed: '1.2s', pace: 'Slow' },
            easy: { start: 2, speed: '1.0s', pace: 'Moderate' },
            easy_medium: { start: 3, speed: '0.85s', pace: 'Moderate' },
            medium: { start: 3, speed: '0.7s', pace: 'Good' },
            medium_hard: { start: 3, speed: '0.6s', pace: 'Fast' },
            hard: { start: 4, speed: '0.5s', pace: 'Fast' },
            very_hard: { start: 4, speed: '0.4s', pace: 'Very Fast' }
          }
          const current = settings[difficulty as keyof typeof settings] || settings.easy
          
          return (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Starting Length</div>
                <div className="text-white">{current.start} items</div>
              </div>
              <div>
                <div className="text-gray-500">Item Speed</div>
                <div className="text-white">{current.speed}</div>
              </div>
              <div>
                <div className="text-gray-500">Pace</div>
                <div className="text-white">{current.pace}</div>
              </div>
              <div>
                <div className="text-gray-500">Max Level</div>
                <div className="text-white">{maxLevel}</div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Game Mechanics */}
      <div className="p-4 bg-purple-900/20 border border-purple-800/30 rounded-lg">
        <div className="text-xs text-gray-400 mb-2">Game Mechanics</div>
        <div className="text-sm text-white space-y-1">
          • Sequence starts at configured length<br />
          • Each level adds one more item<br />
          • Player gets 3 mistakes before game over<br />
          • Same sequence repeats after mistake<br />
          • Audio and visual feedback included<br />
          • Score based on levels completed
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="p-3 bg-purple-900/20 border border-purple-800/30 rounded-lg">
        <div className="text-xs text-gray-400">Configuration Summary</div>
        <div className="text-sm text-white mt-1">
          • Theme: <span className="text-purple-400">{themes.find(t => t.value === simonTheme)?.label}</span><br />
          • Difficulty: <span className="text-purple-400">{difficultyLevels.find(d => d.value === difficulty)?.label}</span><br />
          • Max Level: <span className="text-purple-400">{maxLevel}</span><br />
          {simonTheme === 'custom' && (
            <>• Custom items: <span className="text-purple-400">{customItems.length}</span></>
          )}
        </div>
      </div>
    </div>
  )
}


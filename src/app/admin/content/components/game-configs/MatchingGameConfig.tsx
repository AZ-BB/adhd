'use client'

import { useState, useEffect } from 'react'
import { GameConfig } from '@/types/learning-path'
import { uploadImageFromFormData, deleteGameImage } from '@/actions/storage'

interface MatchingGameConfigProps {
  config: GameConfig
  onChange: (config: GameConfig) => void
}

interface MatchPair {
  left: string
  right: string
  leftType?: 'text' | 'image'
  rightType?: 'text' | 'image'
  leftImageUrl?: string
  rightImageUrl?: string
  leftImagePath?: string
  rightImagePath?: string
}

const defaultCategories = {
  colors: {
    name: 'Colors',
    pairs: [
      { left: 'Apple 🍎', right: 'Red' },
      { left: 'Banana 🍌', right: 'Yellow' },
      { left: 'Leaf 🍃', right: 'Green' },
      { left: 'Sky ☁️', right: 'Blue' },
      { left: 'Orange 🍊', right: 'Orange' }
    ]
  },
  shapes: {
    name: 'Shapes',
    pairs: [
      { left: 'Circle', right: '⭕' },
      { left: 'Square', right: '⬜' },
      { left: 'Triangle', right: '🔺' },
      { left: 'Star', right: '⭐' },
      { left: 'Heart', right: '❤️' }
    ]
  },
  animals: {
    name: 'Animals',
    pairs: [
      { left: 'Dog 🐕', right: 'Bark' },
      { left: 'Cat 🐈', right: 'Meow' },
      { left: 'Cow 🐄', right: 'Moo' },
      { left: 'Duck 🦆', right: 'Quack' },
      { left: 'Lion 🦁', right: 'Roar' }
    ]
  },
  custom: {
    name: 'Custom',
    pairs: []
  }
}

export default function MatchingGameConfig({ config, onChange }: MatchingGameConfigProps) {
  const [itemCount, setItemCount] = useState(config.itemCount || 5)
  const [category, setCategory] = useState(config.category || 'colors')
  const [customPairs, setCustomPairs] = useState<MatchPair[]>(
    (config as any).customPairs || []
  )
  const [showCustomEditor, setShowCustomEditor] = useState(category === 'custom')
  const [uploadingIndex, setUploadingIndex] = useState<{ index: number; side: 'left' | 'right' } | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    const newConfig: GameConfig = {
      itemCount,
      category
    }

    if (category === 'custom' && customPairs.length > 0) {
      (newConfig as any).customPairs = customPairs
    }

    onChange(newConfig)
  }, [itemCount, category, customPairs])

  // Auto-adjust custom pairs when itemCount changes
  useEffect(() => {
    if (category === 'custom') {
      // Adjust the customPairs array to match itemCount
      const currentLength = customPairs.length
      
      if (currentLength < itemCount) {
        // Add more pairs
        const newPairs = [...customPairs]
        for (let i = currentLength; i < itemCount; i++) {
          newPairs.push({ left: '', right: '', leftType: 'text', rightType: 'text' })
        }
        setCustomPairs(newPairs)
      } else if (currentLength > itemCount) {
        // Remove excess pairs (and clean up their images)
        const pairsToRemove = customPairs.slice(itemCount)
        pairsToRemove.forEach(async (pair) => {
          if (pair.leftImagePath) {
            await deleteGameImage(pair.leftImagePath)
          }
          if (pair.rightImagePath) {
            await deleteGameImage(pair.rightImagePath)
          }
        })
        setCustomPairs(customPairs.slice(0, itemCount))
      }
    }
  }, [itemCount, category])

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
    setShowCustomEditor(newCategory === 'custom')
    
    // If switching to custom, initialize pairs based on itemCount
    if (newCategory === 'custom') {
      if (customPairs.length === 0) {
        const initialPairs: MatchPair[] = []
        for (let i = 0; i < itemCount; i++) {
          initialPairs.push({ left: '', right: '', leftType: 'text', rightType: 'text' })
        }
        setCustomPairs(initialPairs)
      } else if (customPairs.length !== itemCount) {
        // Adjust to match itemCount
        const adjusted: MatchPair[] = []
        for (let i = 0; i < itemCount; i++) {
          if (i < customPairs.length) {
            adjusted.push(customPairs[i])
          } else {
            adjusted.push({ left: '', right: '', leftType: 'text', rightType: 'text' })
          }
        }
        setCustomPairs(adjusted)
      }
    }
  }

  const removeCustomPair = async (index: number) => {
    const pair = customPairs[index]
    // Delete images if they exist
    if (pair.leftImagePath) {
      await deleteGameImage(pair.leftImagePath)
    }
    if (pair.rightImagePath) {
      await deleteGameImage(pair.rightImagePath)
    }
    setCustomPairs(customPairs.filter((_, i) => i !== index))
  }

  const updateCustomPair = (index: number, field: 'left' | 'right', value: string) => {
    const newPairs = [...customPairs]
    newPairs[index][field] = value
    setCustomPairs(newPairs)
  }

  const clearPairImage = async (index: number, side: 'left' | 'right') => {
    const pair = customPairs[index]
    const imagePath = side === 'left' ? pair.leftImagePath : pair.rightImagePath
    
    if (imagePath) {
      await deleteGameImage(imagePath)
    }

    const newPairs = [...customPairs]
    if (side === 'left') {
      newPairs[index] = {
        ...newPairs[index],
        leftType: 'text',
        leftImageUrl: undefined,
        leftImagePath: undefined,
        left: ''
      }
    } else {
      newPairs[index] = {
        ...newPairs[index],
        rightType: 'text',
        rightImageUrl: undefined,
        rightImagePath: undefined,
        right: ''
      }
    }
    setCustomPairs(newPairs)
  }

  const handleImageUpload = async (index: number, side: 'left' | 'right', file: File) => {
    setUploadingIndex({ index, side })
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('gameType', 'matching')

      const result = await uploadImageFromFormData(formData)

      if ('error' in result) {
        setUploadError(result.error)
      } else {
        // Delete old image if exists
        const pair = customPairs[index]
        const oldPath = side === 'left' ? pair.leftImagePath : pair.rightImagePath
        if (oldPath) {
          await deleteGameImage(oldPath)
        }

        const newPairs = [...customPairs]
        if (side === 'left') {
          newPairs[index] = {
            ...newPairs[index],
            leftType: 'image',
            leftImageUrl: result.url,
            leftImagePath: result.path
          }
        } else {
          newPairs[index] = {
            ...newPairs[index],
            rightType: 'image',
            rightImageUrl: result.url,
            rightImagePath: result.path
          }
        }
        setCustomPairs(newPairs)
      }
    } catch (error) {
      setUploadError('Failed to upload image')
    } finally {
      setUploadingIndex(null)
    }
  }

  const handleFileSelect = (index: number, side: 'left' | 'right', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(index, side, file)
    }
  }

  return (
    <div className="space-y-4">
      {/* Item Count */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Number of Items to Match *
        </label>
        <input
          type="number"
          min="3"
          max="10"
          value={itemCount}
          onChange={(e) => setItemCount(parseInt(e.target.value) || 5)}
          className="w-full px-4 py-2 bg-black/50 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          How many pairs to match (3-10)
        </p>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Category *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(defaultCategories).map(([key, cat]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleCategoryChange(key)}
              className={`p-3 rounded-lg border transition-all ${
                category === key
                  ? 'border-purple-500 bg-purple-600/20 text-white'
                  : 'border-purple-800/30 bg-black/20 text-gray-400 hover:border-purple-700/50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Default Pairs */}
      {category !== 'custom' && (
        <div className="p-4 bg-black/30 border border-purple-800/30 rounded-lg">
          <div className="text-sm font-medium text-gray-300 mb-3">
            Preview Pairs (showing {Math.min(itemCount, defaultCategories[category as keyof typeof defaultCategories].pairs.length)} pairs)
          </div>
          <div className="space-y-2">
            {defaultCategories[category as keyof typeof defaultCategories].pairs
              .slice(0, itemCount)
              .map((pair, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <div className="flex-1 px-3 py-2 bg-purple-900/20 rounded text-white">
                    {pair.left}
                  </div>
                  <div className="text-purple-400">→</div>
                  <div className="flex-1 px-3 py-2 bg-purple-900/20 rounded text-white">
                    {pair.right}
                  </div>
                </div>
              ))}
          </div>
          {itemCount > defaultCategories[category as keyof typeof defaultCategories].pairs.length && (
            <div className="mt-2 text-xs text-yellow-400">
              ⚠️ Only {defaultCategories[category as keyof typeof defaultCategories].pairs.length} pairs available. Reduce item count or use custom pairs.
            </div>
          )}
        </div>
      )}

      {/* Custom Pairs Editor */}
      {showCustomEditor && (
        <div className="p-4 bg-black/30 border border-purple-800/30 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-300">
                Custom Matching Pairs
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {itemCount} pairs required. Add text or upload images for each side.
              </div>
            </div>
            <div className="px-3 py-2 bg-purple-900/30 text-white text-sm rounded-lg border border-purple-700/50">
              {customPairs.length} / {itemCount} Pairs
            </div>
          </div>

          {uploadError && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {uploadError}
            </div>
          )}

          {customPairs.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              Set the number of items above to create pair slots.
            </div>
          ) : (
            <div className="space-y-3">
              {customPairs.map((pair, index) => (
                <div key={index} className="p-3 bg-black/50 border border-purple-800/50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-400 font-medium">Pair {index + 1} of {itemCount}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Left Side */}
                    <div className="space-y-2">
                      <div className="text-xs text-gray-400">Left Item</div>
                      {pair.leftType === 'image' && pair.leftImageUrl ? (
                        <div className="space-y-2">
                          <div className="w-20 h-20 bg-purple-900/20 rounded-lg overflow-hidden mx-auto">
                            <img 
                              src={pair.leftImageUrl} 
                              alt="Left item"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Label (optional)"
                            value={pair.left}
                            onChange={(e) => updateCustomPair(index, 'left', e.target.value)}
                            className="w-full px-2 py-1 bg-black/50 border border-purple-800/30 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                          <button
                            type="button"
                            onClick={() => clearPairImage(index, 'left')}
                            className="w-full px-2 py-1 bg-orange-600/20 border border-orange-500/50 rounded text-orange-300 text-xs hover:bg-orange-600/30"
                          >
                            🗑️ Clear Image
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Text or emoji"
                            value={pair.left}
                            onChange={(e) => updateCustomPair(index, 'left', e.target.value)}
                            className="w-full px-3 py-2 bg-black/50 border border-purple-800/50 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <label className="block">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileSelect(index, 'left', e)}
                              disabled={uploadingIndex?.index === index && uploadingIndex?.side === 'left'}
                              className="hidden"
                            />
                            <div className="w-full px-2 py-1 bg-blue-600/20 border border-blue-500/50 rounded text-blue-300 text-xs text-center cursor-pointer hover:bg-blue-600/30">
                              {uploadingIndex?.index === index && uploadingIndex?.side === 'left' ? 'Uploading...' : '📷 Upload Image'}
                            </div>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Right Side */}
                    <div className="space-y-2">
                      <div className="text-xs text-gray-400">Right Match</div>
                      {pair.rightType === 'image' && pair.rightImageUrl ? (
                        <div className="space-y-2">
                          <div className="w-20 h-20 bg-purple-900/20 rounded-lg overflow-hidden mx-auto">
                            <img 
                              src={pair.rightImageUrl} 
                              alt="Right match"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Label (optional)"
                            value={pair.right}
                            onChange={(e) => updateCustomPair(index, 'right', e.target.value)}
                            className="w-full px-2 py-1 bg-black/50 border border-purple-800/30 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                          <button
                            type="button"
                            onClick={() => clearPairImage(index, 'right')}
                            className="w-full px-2 py-1 bg-orange-600/20 border border-orange-500/50 rounded text-orange-300 text-xs hover:bg-orange-600/30"
                          >
                            🗑️ Clear Image
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Text or emoji"
                            value={pair.right}
                            onChange={(e) => updateCustomPair(index, 'right', e.target.value)}
                            className="w-full px-3 py-2 bg-black/50 border border-purple-800/50 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <label className="block">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileSelect(index, 'right', e)}
                              disabled={uploadingIndex?.index === index && uploadingIndex?.side === 'right'}
                              className="hidden"
                            />
                            <div className="w-full px-2 py-1 bg-blue-600/20 border border-blue-500/50 rounded text-blue-300 text-xs text-center cursor-pointer hover:bg-blue-600/30">
                              {uploadingIndex?.index === index && uploadingIndex?.side === 'right' ? 'Uploading...' : '📷 Upload Image'}
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {customPairs.length !== itemCount && (
            <div className="text-xs text-yellow-400">
              ⚠️ Adjusting... Expected {itemCount} pairs, currently have {customPairs.length}. Change "Number of Items to Match" to adjust pair slots.
            </div>
          )}
        </div>
      )}

      {/* Configuration Summary */}
      <div className="p-3 bg-purple-900/20 border border-purple-800/30 rounded-lg">
        <div className="text-xs text-gray-400">Configuration Summary</div>
        <div className="text-sm text-white mt-1">
          • Category: <span className="text-purple-400">{category}</span><br />
          • Items to match: <span className="text-purple-400">{itemCount}</span><br />
          {category === 'custom' && (
            <>• Custom pairs defined: <span className="text-purple-400">{customPairs.length}</span></>
          )}
        </div>
      </div>
    </div>
  )
}


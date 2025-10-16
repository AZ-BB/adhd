'use client'

import { useState, useEffect } from 'react'
import { GameConfig } from '@/types/learning-path'

interface MatchingGameConfigProps {
  config: GameConfig
  onChange: (config: GameConfig) => void
}

interface MatchPair {
  left: string
  right: string
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

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
    setShowCustomEditor(newCategory === 'custom')
    
    // If switching to custom and no pairs exist, initialize with one pair
    if (newCategory === 'custom' && customPairs.length === 0) {
      setCustomPairs([{ left: '', right: '' }])
    }
  }

  const addCustomPair = () => {
    setCustomPairs([...customPairs, { left: '', right: '' }])
  }

  const removeCustomPair = (index: number) => {
    setCustomPairs(customPairs.filter((_, i) => i !== index))
  }

  const updateCustomPair = (index: number, field: 'left' | 'right', value: string) => {
    const newPairs = [...customPairs]
    newPairs[index][field] = value
    setCustomPairs(newPairs)
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
            <div className="text-sm font-medium text-gray-300">
              Custom Matching Pairs
            </div>
            <button
              type="button"
              onClick={addCustomPair}
              className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-all"
            >
              + Add Pair
            </button>
          </div>

          {customPairs.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              No custom pairs yet. Click "Add Pair" to create your first matching pair.
            </div>
          ) : (
            <div className="space-y-2">
              {customPairs.map((pair, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Left item"
                    value={pair.left}
                    onChange={(e) => updateCustomPair(index, 'left', e.target.value)}
                    className="flex-1 px-3 py-2 bg-black/50 border border-purple-800/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="text-purple-400">→</div>
                  <input
                    type="text"
                    placeholder="Right match"
                    value={pair.right}
                    onChange={(e) => updateCustomPair(index, 'right', e.target.value)}
                    className="flex-1 px-3 py-2 bg-black/50 border border-purple-800/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeCustomPair(index)}
                    className="px-2 py-2 bg-red-600/20 border border-red-500/50 rounded-lg text-red-300 hover:bg-red-600/30 transition-all"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {customPairs.length > 0 && customPairs.length < itemCount && (
            <div className="text-xs text-yellow-400">
              ⚠️ You have {customPairs.length} pairs but need {itemCount}. Add more pairs or reduce item count.
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


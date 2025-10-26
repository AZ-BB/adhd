'use client'

import { useState, useEffect } from 'react'
import { GameConfig } from '@/types/learning-path'

interface AttentionGameConfigProps {
  config: GameConfig
  onChange: (config: GameConfig) => void
}

type DifficultyLevel = 'very_easy' | 'easy' | 'easy_medium' | 'medium' | 'medium_hard' | 'hard' | 'very_hard'

const difficultyInfo = {
  very_easy: {
    name: 'Very Easy',
    description: 'Minimal items for beginners (8 total items)',
    icon: '🟢',
    color: 'green',
    totalItems: 8,
    emojiSet: '😀 😊 😂 😍 🥰 😎',
    theme: 'Faces',
    recommendedTargets: 2,
    recommendedTime: 45
  },
  easy: {
    name: 'Easy',
    description: 'Few items to search through (12 total items)',
    icon: '🟢',
    color: 'green',
    totalItems: 12,
    emojiSet: '🐕 🐈 🐰 🐻 🦁 🐸 🐷 🐮',
    theme: 'Animals',
    recommendedTargets: 3,
    recommendedTime: 60
  },
  easy_medium: {
    name: 'Easy-Medium',
    description: 'Slightly more items (16 total items)',
    icon: '🟢',
    color: 'lime',
    totalItems: 16,
    emojiSet: '🌸 🌺 🌻 🌷 🌹 🏵️ 🌼 💐 🥀',
    theme: 'Flowers',
    recommendedTargets: 4,
    recommendedTime: 75
  },
  medium: {
    name: 'Medium',
    description: 'Moderate number of items (20 total items)',
    icon: '🟡',
    color: 'yellow',
    totalItems: 20,
    emojiSet: '🍎 🍌 🍇 🍊 🍓 🍉 🍒 🥝 🍑 🍍',
    theme: 'Fruits',
    recommendedTargets: 5,
    recommendedTime: 90
  },
  medium_hard: {
    name: 'Medium-Hard',
    description: 'Getting challenging (25 total items)',
    icon: '🟠',
    color: 'orange',
    totalItems: 25,
    emojiSet: '🚗 🚕 🚙 🚌 🚎 🏎️ 🚓 🚑 🚒 🚐 🚚',
    theme: 'Vehicles',
    recommendedTargets: 6,
    recommendedTime: 105
  },
  hard: {
    name: 'Hard',
    description: 'Many items to search through (30 total items)',
    icon: '🔴',
    color: 'red',
    totalItems: 30,
    emojiSet: '⚽ 🏀 ⚾ 🎾 🏐 🏈 🎱 🏓 🏸 🥏 🎳 ⛳',
    theme: 'Sports',
    recommendedTargets: 7,
    recommendedTime: 120
  },
  very_hard: {
    name: 'Very Hard',
    description: 'Maximum challenge (40 total items)',
    icon: '🔴',
    color: 'red',
    totalItems: 40,
    emojiSet: '🎮 🎯 🎲 🎰 🎳 🎪 🎨 🎭 🎬 🎤 🎧 🎸 🎹 🎺',
    theme: 'Entertainment',
    recommendedTargets: 8,
    recommendedTime: 150
  }
}

export default function AttentionGameConfig({ config, onChange }: AttentionGameConfigProps) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    (config.difficulty as DifficultyLevel) || 'easy'
  )
  const currentInfo = difficultyInfo[difficulty]
  const [targetCount, setTargetCount] = useState(
    config.targetCount || currentInfo.recommendedTargets
  )
  const [duration, setDuration] = useState(
    config.duration || currentInfo.recommendedTime
  )

  useEffect(() => {
    const newConfig: GameConfig = {
      difficulty,
      targetCount,
      duration
    }

    onChange(newConfig)
  }, [difficulty, targetCount, duration])

  const handleDifficultyChange = (newDifficulty: DifficultyLevel) => {
    setDifficulty(newDifficulty)
    const newInfo = difficultyInfo[newDifficulty]
    
    // Set recommended values for the new difficulty
    setTargetCount(newInfo.recommendedTargets)
    setDuration(newInfo.recommendedTime)
    
    // Adjust target count if it exceeds the max for the new difficulty
    const maxTargets = getMaxTargets(newDifficulty)
    if (targetCount > maxTargets) {
      setTargetCount(maxTargets)
    }
  }

  const getMaxTargets = (diff: DifficultyLevel): number => {
    // Max targets should be reasonable - about 30-40% of total items
    const info = difficultyInfo[diff]
    return Math.floor(info.totalItems * 0.4)
  }

  const maxTargets = getMaxTargets(difficulty)

  return (
    <div className="space-y-4">
      {/* Difficulty Level */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Difficulty Level * <span className="text-xs text-gray-500">(7 variations available)</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {(Object.keys(difficultyInfo) as DifficultyLevel[]).map((level) => {
            const info = difficultyInfo[level]
            return (
              <button
                key={level}
                type="button"
                onClick={() => handleDifficultyChange(level)}
                className={`p-3 rounded-lg border transition-all text-left ${
                  difficulty === level
                    ? 'border-purple-500 bg-purple-600/20 text-white ring-2 ring-purple-500/50'
                    : 'border-purple-800/30 bg-black/20 text-gray-400 hover:border-purple-700/50 hover:bg-black/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{info.icon}</span>
                  <span className="font-bold text-sm">{info.name}</span>
                </div>
                <p className="text-xs text-gray-400 mb-2 line-clamp-2">{info.description}</p>
                <div className="space-y-1">
                  <div className="text-xs">
                    <span className="text-gray-500">Theme:</span>
                    <span className="text-gray-300 ml-1">{info.theme}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500">Items:</span>
                    <span className="text-purple-400 ml-1 font-semibold">{info.totalItems}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500">Suggested:</span>
                    <span className="text-green-400 ml-1 font-semibold">{info.recommendedTargets} targets, {info.recommendedTime}s</span>
                  </div>
                  <div className="text-lg mt-1 truncate">{info.emojiSet}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Target Count */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Target Items to Find *
        </label>
        <input
          type="number"
          min="2"
          max={maxTargets}
          value={targetCount}
          onChange={(e) => setTargetCount(parseInt(e.target.value) || 3)}
          className="w-full px-4 py-2 bg-black/50 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          How many target items players must find (2-{maxTargets}). The rest will be distractors.
        </p>
        <div className="mt-2 text-xs text-gray-400">
          With this setting: <span className="text-purple-400 font-semibold">{targetCount}</span> target items + 
          <span className="text-purple-400 font-semibold ml-1">{currentInfo.totalItems - targetCount}</span> distractors = 
          <span className="text-purple-400 font-semibold ml-1">{currentInfo.totalItems}</span> total items
        </div>
      </div>

      {/* Time Limit */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Time Limit (seconds) *
        </label>
        <input
          type="number"
          min="30"
          max="180"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
          className="w-full px-4 py-2 bg-black/50 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Time limit in seconds (30-180). Recommended: 60s for easy, 90s for medium, 120s for hard.
        </p>
      </div>

      {/* Game Info */}
      <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-blue-300 text-xl">ℹ️</span>
          <div className="flex-1 text-sm text-blue-300">
            <div className="font-medium mb-1">About Attention Game (Spot The Item)</div>
            <ul className="space-y-1 text-xs">
              <li>• Players must find all target items scattered on the screen</li>
              <li>• Items are randomly positioned throughout the play area</li>
              <li>• Clicking wrong items counts as mistakes</li>
              <li>• Score based on time taken and mistakes made</li>
              <li>• Game ends when all targets are found or time runs out</li>
              <li>• Higher difficulty = more items to search through</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Visual Preview */}
      <div className="p-4 bg-black/30 border border-purple-800/30 rounded-lg">
        <div className="text-sm font-medium text-gray-300 mb-3">
          Configuration Preview
        </div>
        <div className="space-y-3">
          {/* Theme Preview */}
          <div className="p-3 bg-purple-900/20 rounded-lg">
            <div className="text-xs text-gray-400 mb-2">Emoji Theme: {currentInfo.theme}</div>
            <div className="text-2xl flex gap-2 flex-wrap">
              {currentInfo.emojiSet.split(' ').map((emoji, i) => (
                <span key={i} className="inline-block">{emoji}</span>
              ))}
            </div>
          </div>

          {/* Game Layout Preview */}
          <div className="p-3 bg-purple-900/20 rounded-lg">
            <div className="text-xs text-gray-400 mb-2">Example Layout</div>
            <div className="relative bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg h-40 overflow-hidden">
              {/* Simulate some items */}
              {Array.from({ length: Math.min(12, currentInfo.totalItems) }).map((_, i) => {
                const emojis = currentInfo.emojiSet.split(' ')
                const emoji = emojis[i % emojis.length]
                const isTarget = i < Math.min(3, targetCount)
                return (
                  <div
                    key={i}
                    className={`absolute text-xl ${isTarget ? 'opacity-100' : 'opacity-60'}`}
                    style={{
                      left: `${10 + (i % 4) * 22}%`,
                      top: `${15 + Math.floor(i / 4) * 30}%`,
                    }}
                  >
                    {emoji}
                  </div>
                )
              })}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {currentInfo.totalItems > 12 && `(Showing 12 of ${currentInfo.totalItems} items for preview)`}
            </div>
          </div>

          {/* Game Stats */}
          <div className="p-3 bg-purple-900/20 rounded-lg">
            <div className="text-xs text-gray-400 mb-2">Expected Gameplay</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-black/30 p-2 rounded">
                <div className="text-gray-500">Total Items</div>
                <div className="text-purple-400 font-semibold text-base">{currentInfo.totalItems}</div>
              </div>
              <div className="bg-black/30 p-2 rounded">
                <div className="text-gray-500">Targets to Find</div>
                <div className="text-green-400 font-semibold text-base">{targetCount}</div>
              </div>
              <div className="bg-black/30 p-2 rounded">
                <div className="text-gray-500">Distractors</div>
                <div className="text-orange-400 font-semibold text-base">{currentInfo.totalItems - targetCount}</div>
              </div>
              <div className="bg-black/30 p-2 rounded">
                <div className="text-gray-500">Time Limit</div>
                <div className="text-blue-400 font-semibold text-base">{duration}s</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="p-3 bg-purple-900/20 border border-purple-800/30 rounded-lg">
        <div className="text-xs text-gray-400">Configuration Summary</div>
        <div className="text-sm text-white mt-1">
          • Difficulty: <span className="text-purple-400">{currentInfo.name}</span> ({currentInfo.theme} theme)<br />
          • Targets to find: <span className="text-purple-400">{targetCount}</span><br />
          • Total items: <span className="text-purple-400">{currentInfo.totalItems}</span><br />
          • Time limit: <span className="text-purple-400">{duration}s</span> ({Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')} minutes)
        </div>
      </div>
    </div>
  )
}


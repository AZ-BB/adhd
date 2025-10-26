'use client'

import { useState, useEffect } from 'react'
import { GameConfig } from '@/types/learning-path'

interface PatternRecognitionGameConfigProps {
  config: GameConfig
  onChange: (config: GameConfig) => void
}

export default function PatternRecognitionGameConfig({ config, onChange }: PatternRecognitionGameConfigProps) {
  const [difficulty, setDifficulty] = useState(config.difficulty || 'easy')
  const [patternType, setPatternType] = useState(config.patternType || 'colors')
  const [rounds, setRounds] = useState(config.rounds || 5)

  useEffect(() => {
    const newConfig: GameConfig = {
      difficulty,
      patternType,
      rounds
    }
    onChange(newConfig)
  }, [difficulty, patternType, rounds])

  const difficultyLevels = [
    { 
      value: 'very_easy', 
      label: 'Very Easy',
      description: '2×2 grid, 5s display time'
    },
    { 
      value: 'easy', 
      label: 'Easy',
      description: '2×2 grid, 4s display time'
    },
    { 
      value: 'easy_medium', 
      label: 'Easy-Medium',
      description: '2×3 grid, 3.5s display time'
    },
    { 
      value: 'medium', 
      label: 'Medium',
      description: '3×3 grid, 3s display time'
    },
    { 
      value: 'medium_hard', 
      label: 'Medium-Hard',
      description: '3×3 grid, 2.5s display time'
    },
    { 
      value: 'hard', 
      label: 'Hard',
      description: '3×4 grid, 2s display time'
    },
    { 
      value: 'very_hard', 
      label: 'Very Hard',
      description: '4×4 grid, 1.5s display time'
    }
  ]

  const patternTypes = [
    { 
      value: 'colors', 
      label: 'Colors',
      preview: '🟥🟦🟩🟨🟪'
    },
    { 
      value: 'shapes', 
      label: 'Shapes',
      preview: '⭕⬜🔺⬛💠'
    },
    { 
      value: 'emojis', 
      label: 'Emojis',
      preview: '😀😎🥳😊🤔'
    },
    { 
      value: 'animals', 
      label: 'Animals',
      preview: '🐕🐈🐰🐻🦁'
    },
    { 
      value: 'food', 
      label: 'Food',
      preview: '🍎🍌🍇🍊🍓'
    },
    { 
      value: 'numbers', 
      label: 'Numbers',
      preview: '1️⃣2️⃣3️⃣4️⃣5️⃣'
    }
  ]

  return (
    <div className="space-y-4">
      {/* Pattern Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Pattern Type *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {patternTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setPatternType(type.value)}
              className={`p-3 rounded-lg border text-left transition-all ${
                patternType === type.value
                  ? 'border-purple-500 bg-purple-600/20 text-white'
                  : 'border-purple-800/30 bg-black/20 text-gray-400 hover:border-purple-700/50'
              }`}
            >
              <div className="font-medium mb-1">{type.label}</div>
              <div className="text-2xl">{type.preview}</div>
            </button>
          ))}
        </div>
      </div>

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

      {/* Number of Rounds */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Number of Rounds *
        </label>
        <input
          type="number"
          min="3"
          max="10"
          value={rounds}
          onChange={(e) => setRounds(parseInt(e.target.value) || 5)}
          className="w-full px-4 py-2 bg-black/50 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          How many patterns the player needs to memorize (3-10). Recommended: 5 rounds.
        </p>
      </div>

      {/* Difficulty Stats Preview */}
      <div className="p-4 bg-black/30 border border-purple-800/30 rounded-lg">
        <div className="text-sm font-medium text-gray-300 mb-3">
          Current Settings Preview
        </div>
        {(() => {
          const settings = {
            very_easy: { grid: '2×2', cells: 4, time: '5.0s' },
            easy: { grid: '2×2', cells: 4, time: '4.0s' },
            easy_medium: { grid: '2×3', cells: 6, time: '3.5s' },
            medium: { grid: '3×3', cells: 9, time: '3.0s' },
            medium_hard: { grid: '3×3', cells: 9, time: '2.5s' },
            hard: { grid: '3×4', cells: 12, time: '2.0s' },
            very_hard: { grid: '4×4', cells: 16, time: '1.5s' }
          }
          const current = settings[difficulty as keyof typeof settings] || settings.easy
          
          return (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Grid Size</div>
                <div className="text-white">{current.grid}</div>
              </div>
              <div>
                <div className="text-gray-500">Total Cells</div>
                <div className="text-white">{current.cells}</div>
              </div>
              <div>
                <div className="text-gray-500">Display Time</div>
                <div className="text-white">{current.time}</div>
              </div>
              <div>
                <div className="text-gray-500">Rounds</div>
                <div className="text-white">{rounds}</div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Game Instructions */}
      <div className="p-4 bg-purple-900/20 border border-purple-800/30 rounded-lg">
        <div className="text-xs text-gray-400 mb-2">Game Instructions</div>
        <div className="text-sm text-white space-y-1">
          • Pattern appears for a few seconds<br />
          • Player must memorize the arrangement<br />
          • Pattern disappears with 3-second countdown<br />
          • Player recreates the pattern from memory<br />
          • Game succeeds with ≥60% accuracy
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="p-3 bg-purple-900/20 border border-purple-800/30 rounded-lg">
        <div className="text-xs text-gray-400">Configuration Summary</div>
        <div className="text-sm text-white mt-1">
          • Pattern type: <span className="text-purple-400">{patternTypes.find(p => p.value === patternType)?.label}</span><br />
          • Difficulty: <span className="text-purple-400">{difficultyLevels.find(d => d.value === difficulty)?.label}</span><br />
          • Rounds: <span className="text-purple-400">{rounds}</span>
        </div>
      </div>
    </div>
  )
}


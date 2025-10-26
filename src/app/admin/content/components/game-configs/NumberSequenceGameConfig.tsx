'use client'

import { useState, useEffect } from 'react'
import { GameConfig } from '@/types/learning-path'

interface NumberSequenceGameConfigProps {
  config: GameConfig
  onChange: (config: GameConfig) => void
}

type DifficultyLevel = 'very_easy' | 'easy' | 'easy_medium' | 'medium' | 'medium_hard' | 'hard' | 'very_hard'

const difficultyInfo = {
  very_easy: {
    name: 'Very Easy',
    description: 'Simple counting by 1s',
    icon: '🟢',
    color: 'green',
    patterns: ['Counting by 1', 'Simple +1 patterns'],
    examples: ['1, 2, 3, 4, ?', '5, 6, 7, 8, ?'],
    recommendedLength: 3
  },
  easy: {
    name: 'Easy',
    description: 'Simple addition patterns (+2, +3, +5)',
    icon: '🟢',
    color: 'green',
    patterns: ['Adding 2', 'Adding 3', 'Adding 5'],
    examples: ['2, 4, 6, 8, ?', '5, 10, 15, 20, ?'],
    recommendedLength: 4
  },
  easy_medium: {
    name: 'Easy-Medium',
    description: 'Counting by larger numbers (+10, +15)',
    icon: '🟢',
    color: 'lime',
    patterns: ['Adding 10', 'Adding 15', 'Adding 20'],
    examples: ['10, 20, 30, 40, ?', '15, 30, 45, 60, ?'],
    recommendedLength: 4
  },
  medium: {
    name: 'Medium',
    description: 'Skip counting or simple subtraction',
    icon: '🟡',
    color: 'yellow',
    patterns: ['Subtracting 3-5', 'Skip counting by 7-12'],
    examples: ['50, 45, 40, 35, ?', '7, 14, 21, 28, ?'],
    recommendedLength: 4
  },
  medium_hard: {
    name: 'Medium-Hard',
    description: 'Simple multiplication or larger subtraction',
    icon: '🟠',
    color: 'orange',
    patterns: ['Multiplying by 2', 'Subtracting 10-15'],
    examples: ['2, 4, 8, 16, ?', '100, 85, 70, 55, ?'],
    recommendedLength: 5
  },
  hard: {
    name: 'Hard',
    description: 'Fibonacci-like or alternating patterns',
    icon: '🔴',
    color: 'red',
    patterns: ['Fibonacci', 'Alternating +/-'],
    examples: ['1, 1, 2, 3, 5, ?', '10, 15, 13, 18, 16, ?'],
    recommendedLength: 5
  },
  very_hard: {
    name: 'Very Hard',
    description: 'Complex patterns (squares, cubes, multiple operations)',
    icon: '🔴',
    color: 'red',
    patterns: ['Squares', 'Cubes', 'Complex alternating'],
    examples: ['1, 4, 9, 16, 25, ?', '1, 8, 27, 64, ?', '2, 6, 4, 12, 10, ?'],
    recommendedLength: 6
  }
}

export default function NumberSequenceGameConfig({ config, onChange }: NumberSequenceGameConfigProps) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    (config.difficulty as DifficultyLevel) || 'easy'
  )
  const currentInfo = difficultyInfo[difficulty]
  const [sequenceLength, setSequenceLength] = useState(
    config.sequenceLength || currentInfo.recommendedLength
  )

  useEffect(() => {
    const newConfig: GameConfig = {
      difficulty,
      sequenceLength
    }

    onChange(newConfig)
  }, [difficulty, sequenceLength])

  const handleDifficultyChange = (newDifficulty: DifficultyLevel) => {
    setDifficulty(newDifficulty)
    const newInfo = difficultyInfo[newDifficulty]
    // Set recommended sequence length for the new difficulty
    setSequenceLength(newInfo.recommendedLength)
  }

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
                    <span className="text-gray-500">Patterns:</span>
                    <div className="text-gray-300 ml-1">
                      {info.patterns.map((p, i) => (
                        <div key={i}>• {p}</div>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500">Suggested length:</span>
                    <span className="text-purple-400 ml-1 font-semibold">{info.recommendedLength} numbers</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    <div className="font-semibold mb-1">Examples:</div>
                    {info.examples.slice(0, 2).map((example, i) => (
                      <div key={i} className="font-mono text-xs">• {example}</div>
                    ))}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Sequence Length */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Sequence Length *
        </label>
        <input
          type="number"
          min="3"
          max="7"
          value={sequenceLength}
          onChange={(e) => setSequenceLength(parseInt(e.target.value) || 4)}
          className="w-full px-4 py-2 bg-black/50 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          How many numbers to show before the missing number (3-7). Recommended for {currentInfo.name}: <span className="text-purple-400 font-semibold">{currentInfo.recommendedLength}</span>
        </p>
      </div>

      {/* Game Info */}
      <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-blue-300 text-xl">ℹ️</span>
          <div className="flex-1 text-sm text-blue-300">
            <div className="font-medium mb-1">About Number Sequence Game</div>
            <ul className="space-y-1 text-xs">
              <li>• Players see a sequence of numbers and must identify the next number</li>
              <li>• 5 rounds per game with 4 multiple-choice options each round</li>
              <li>• Pattern hints are provided (e.g., "Adding 3")</li>
              <li>• Score based on correct answers, with penalties for mistakes and time</li>
              <li>• Difficulty affects pattern complexity, not sequence length</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pattern Examples Preview */}
      <div className="p-4 bg-black/30 border border-purple-800/30 rounded-lg">
        <div className="text-sm font-medium text-gray-300 mb-3">
          Pattern Examples for "{currentInfo.name}" Difficulty
        </div>
        <div className="space-y-2">
          <div className="space-y-2 text-sm">
            {currentInfo.examples.map((example, i) => {
              const pattern = currentInfo.patterns[i] || currentInfo.patterns[0]
              return (
                <div key={i} className="flex items-center gap-3 p-2 bg-purple-900/20 rounded">
                  <span className="font-mono text-white">{example}</span>
                  <span className="text-xs text-gray-400">→ {pattern}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="p-3 bg-purple-900/20 border border-purple-800/30 rounded-lg">
        <div className="text-xs text-gray-400">Configuration Summary</div>
        <div className="text-sm text-white mt-1">
          • Difficulty: <span className="text-purple-400">{currentInfo.name}</span><br />
          • Pattern types: <span className="text-purple-400">{currentInfo.patterns.join(', ')}</span><br />
          • Sequence length: <span className="text-purple-400">{sequenceLength}</span> numbers<br />
          • Total rounds: <span className="text-purple-400">5</span> per game<br />
          • Options per question: <span className="text-purple-400">4</span> choices
        </div>
      </div>
    </div>
  )
}


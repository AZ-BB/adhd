'use client'

import { useState, useEffect } from 'react'
import { GameConfig } from '@/types/learning-path'

interface AimingGameConfigProps {
  config: GameConfig
  onChange: (config: GameConfig) => void
}

export default function AimingGameConfig({ config, onChange }: AimingGameConfigProps) {
  const [difficulty, setDifficulty] = useState(config.difficulty || 'easy')
  const [duration, setDuration] = useState(config.duration || 60)

  useEffect(() => {
    const newConfig: GameConfig = {
      difficulty,
      duration
    }
    onChange(newConfig)
  }, [difficulty, duration])

  const difficultyLevels = [
    { 
      value: 'very_easy', 
      label: 'Very Easy',
      description: 'Large circles, slow spawn, 80% green, 4s lifetime'
    },
    { 
      value: 'easy', 
      label: 'Easy',
      description: 'Large circles, moderate spawn, 70% green, 3.5s lifetime'
    },
    { 
      value: 'easy_medium', 
      label: 'Easy-Medium',
      description: 'Medium circles, moderate spawn, 65% green, 3s lifetime'
    },
    { 
      value: 'medium', 
      label: 'Medium',
      description: 'Medium circles, moderate spawn, 60% green, 2.5s lifetime'
    },
    { 
      value: 'medium_hard', 
      label: 'Medium-Hard',
      description: 'Small circles, fast spawn, 55% green, 2s lifetime'
    },
    { 
      value: 'hard', 
      label: 'Hard',
      description: 'Small circles, fast spawn, 50% green, 1.5s lifetime'
    },
    { 
      value: 'very_hard', 
      label: 'Very Hard',
      description: 'Tiny circles, very fast spawn, 45% green, 1s lifetime'
    }
  ]

  return (
    <div className="space-y-4">
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

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Duration (seconds) *
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
          Game duration in seconds (30-180). Recommended: 60s for easy, 90s for hard.
        </p>
      </div>

      {/* Difficulty Stats Preview */}
      <div className="p-4 bg-black/30 border border-purple-800/30 rounded-lg">
        <div className="text-sm font-medium text-gray-300 mb-3">
          Difficulty Settings Preview
        </div>
        {(() => {
          const settings = {
            very_easy: { size: '80px', spawn: '2.0s', green: '80%', lifetime: '4.0s' },
            easy: { size: '70px', spawn: '1.5s', green: '70%', lifetime: '3.5s' },
            easy_medium: { size: '60px', spawn: '1.2s', green: '65%', lifetime: '3.0s' },
            medium: { size: '50px', spawn: '1.0s', green: '60%', lifetime: '2.5s' },
            medium_hard: { size: '45px', spawn: '0.8s', green: '55%', lifetime: '2.0s' },
            hard: { size: '40px', spawn: '0.6s', green: '50%', lifetime: '1.5s' },
            very_hard: { size: '35px', spawn: '0.4s', green: '45%', lifetime: '1.0s' }
          }
          const current = settings[difficulty as keyof typeof settings] || settings.easy
          
          return (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Circle Size</div>
                <div className="text-white">{current.size}</div>
              </div>
              <div>
                <div className="text-gray-500">Spawn Rate</div>
                <div className="text-white">{current.spawn}</div>
              </div>
              <div>
                <div className="text-gray-500">Green Ratio</div>
                <div className="text-white">{current.green}</div>
              </div>
              <div>
                <div className="text-gray-500">Circle Lifetime</div>
                <div className="text-white">{current.lifetime}</div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Game Instructions */}
      <div className="p-4 bg-purple-900/20 border border-purple-800/30 rounded-lg">
        <div className="text-xs text-gray-400 mb-2">Game Instructions</div>
        <div className="text-sm text-white space-y-1">
          • Green and red circles appear randomly on screen<br />
          • Click on <span className="text-green-400 font-bold">GREEN</span> circles as fast as possible<br />
          • Avoid clicking <span className="text-red-400 font-bold">RED</span> circles<br />
          • Circles fade and disappear after their lifetime<br />
          • Game succeeds with ≥70% accuracy and score &gt;50
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="p-3 bg-purple-900/20 border border-purple-800/30 rounded-lg">
        <div className="text-xs text-gray-400">Configuration Summary</div>
        <div className="text-sm text-white mt-1">
          • Difficulty: <span className="text-purple-400">{difficultyLevels.find(d => d.value === difficulty)?.label}</span><br />
          • Duration: <span className="text-purple-400">{duration}s</span>
        </div>
      </div>
    </div>
  )
}


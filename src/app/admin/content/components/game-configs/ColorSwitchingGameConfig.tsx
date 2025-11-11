'use client'

import { useState, useEffect } from 'react'

interface ColorSwitchingGameConfigProps {
  config: Record<string, any>
  onChange: (config: Record<string, any>) => void
}

interface CustomColor {
  name: string
  value: string
  word: string
}

export default function ColorSwitchingGameConfig({ config, onChange }: ColorSwitchingGameConfigProps) {
  const [difficulty, setDifficulty] = useState(config.difficulty || 'easy')
  const [gameMode, setGameMode] = useState(config.gameMode || 'mixed')
  const [rounds, setRounds] = useState(config.rounds || 15)
  const [timePerRound, setTimePerRound] = useState(config.timePerRound || 3000)
  const [showTimer, setShowTimer] = useState(config.showTimer !== false)
  const [congruentRatio, setCongruentRatio] = useState(config.congruentRatio || 0.5)
  const [useCustomColors, setUseCustomColors] = useState(config.useCustomColors || false)
  const [customColors, setCustomColors] = useState<CustomColor[]>(
    config.customColors || [
      { name: 'Red', value: '#EF4444', word: 'RED' },
      { name: 'Blue', value: '#3B82F6', word: 'BLUE' },
      { name: 'Green', value: '#10B981', word: 'GREEN' },
      { name: 'Yellow', value: '#EAB308', word: 'YELLOW' },
      { name: 'Purple', value: '#A855F7', word: 'PURPLE' },
      { name: 'Orange', value: '#F97316', word: 'ORANGE' }
    ]
  )

  const difficultyLevels = [
    { value: 'very_easy', label: 'Very Easy', description: '5s per round, 60% matching', time: 5000, ratio: 0.6 },
    { value: 'easy', label: 'Easy', description: '4s per round, 50% matching', time: 4000, ratio: 0.5 },
    { value: 'easy_medium', label: 'Easy-Medium', description: '3.5s per round, 40% matching', time: 3500, ratio: 0.4 },
    { value: 'medium', label: 'Medium', description: '3s per round, 30% matching', time: 3000, ratio: 0.3 },
    { value: 'medium_hard', label: 'Medium-Hard', description: '2.5s per round, 25% matching', time: 2500, ratio: 0.25 },
    { value: 'hard', label: 'Hard', description: '2s per round, 20% matching', time: 2000, ratio: 0.2 },
    { value: 'very_hard', label: 'Very Hard', description: '1.5s per round, 10% matching', time: 1500, ratio: 0.1 }
  ]

  const gameModes = [
    { value: 'word', label: 'Word Only', icon: '📖', description: 'Always select based on the word' },
    { value: 'color', label: 'Color Only', icon: '🎨', description: 'Always select based on the text color' },
    { value: 'mixed', label: 'Mixed Mode', icon: '🔀', description: 'Randomly switches between word and color' }
  ]

  useEffect(() => {
    onChange({
      difficulty,
      gameMode,
      rounds,
      timePerRound,
      showTimer,
      congruentRatio,
      useCustomColors,
      customColors: useCustomColors ? customColors : undefined
    })
  }, [difficulty, gameMode, rounds, timePerRound, showTimer, congruentRatio, useCustomColors, customColors])

  const handleDifficultyChange = (newDifficulty: string) => {
    setDifficulty(newDifficulty)
    const level = difficultyLevels.find(d => d.value === newDifficulty)
    if (level) {
      setTimePerRound(level.time)
      setCongruentRatio(level.ratio)
    }
  }

  const updateColor = (index: number, field: keyof CustomColor, value: string) => {
    const newColors = [...customColors]
    newColors[index] = { ...newColors[index], [field]: value }
    setCustomColors(newColors)
  }

  const addColor = () => {
    if (customColors.length < 10) {
      setCustomColors([
        ...customColors,
        { name: 'New Color', value: '#000000', word: 'NEW' }
      ])
    }
  }

  const removeColor = (index: number) => {
    if (customColors.length > 3) {
      setCustomColors(customColors.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="space-y-6">
      {/* Difficulty Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Difficulty Level (Auto-sets timing & ratio)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {difficultyLevels.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => handleDifficultyChange(level.value)}
              className={`
                p-3 rounded-lg border-2 transition-all text-left
                ${difficulty === level.value
                  ? 'bg-purple-600 border-white text-white shadow-lg scale-105'
                  : 'bg-black/30 border-purple-800/30 text-gray-400 hover:border-purple-600'
                }
              `}
            >
              <div className="font-semibold text-sm">{level.label}</div>
              <div className="text-xs opacity-80 mt-1">{level.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Game Mode */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Game Mode
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {gameModes.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setGameMode(mode.value)}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${gameMode === mode.value
                  ? 'bg-purple-600 border-white text-white shadow-lg scale-105'
                  : 'bg-black/30 border-purple-800/30 text-gray-300 hover:border-purple-600'
                }
              `}
            >
              <div className="text-3xl mb-2">{mode.icon}</div>
              <div className="text-sm font-medium mb-1">{mode.label}</div>
              <div className="text-xs opacity-80">{mode.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Number of Rounds */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Number of Rounds
        </label>
        <input
          type="number"
          min="5"
          max="30"
          value={rounds}
          onChange={(e) => setRounds(Math.max(5, Math.min(30, parseInt(e.target.value) || 15)))}
          className="w-full px-4 py-2 bg-black/30 border border-purple-800/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-gray-500 mt-1">5-30 rounds (recommended: 10-20)</p>
      </div>

      {/* Time Per Round */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Time Per Round (milliseconds)
        </label>
        <input
          type="number"
          min="1000"
          max="10000"
          step="500"
          value={timePerRound}
          onChange={(e) => setTimePerRound(Math.max(1000, parseInt(e.target.value) || 3000))}
          className="w-full px-4 py-2 bg-black/30 border border-purple-800/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          {(timePerRound / 1000).toFixed(1)} seconds per round
        </p>
      </div>

      {/* Congruent Ratio */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Matching Ratio (How often word & color match)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={congruentRatio}
            onChange={(e) => setCongruentRatio(parseFloat(e.target.value))}
            className="flex-1"
          />
          <div className="text-white font-semibold min-w-[60px]">
            {Math.round(congruentRatio * 100)}%
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {congruentRatio === 0 && 'Never match (hardest - pure Stroop effect)'}
          {congruentRatio > 0 && congruentRatio < 0.3 && 'Rarely match (very challenging)'}
          {congruentRatio >= 0.3 && congruentRatio < 0.5 && 'Sometimes match (challenging)'}
          {congruentRatio === 0.5 && 'Half match, half don\'t (balanced)'}
          {congruentRatio > 0.5 && congruentRatio < 0.8 && 'Often match (easier)'}
          {congruentRatio >= 0.8 && congruentRatio < 1 && 'Usually match (easy)'}
          {congruentRatio === 1 && 'Always match (easiest - no conflict)'}
        </p>
      </div>

      {/* Show Timer Toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showTimer}
            onChange={(e) => setShowTimer(e.target.checked)}
            className="w-5 h-5 rounded border-purple-800/30 bg-black/30 text-purple-600 focus:ring-2 focus:ring-purple-500"
          />
          <span className="text-sm font-medium text-gray-300">Show Timer Bar</span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-8">
          Display a countdown timer during each round
        </p>
      </div>

      {/* Custom Colors */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={useCustomColors}
            onChange={(e) => setUseCustomColors(e.target.checked)}
            className="w-5 h-5 rounded border-purple-800/30 bg-black/30 text-purple-600 focus:ring-2 focus:ring-purple-500"
          />
          <span className="text-sm font-medium text-gray-300">Use Custom Colors</span>
        </label>

        {useCustomColors && (
          <div className="p-4 bg-black/30 border border-purple-800/30 rounded-lg space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-400">
                {customColors.length} colors (minimum 3, maximum 10)
              </div>
              <button
                type="button"
                onClick={addColor}
                disabled={customColors.length >= 10}
                className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Add Color
              </button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {customColors.map((color, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-black/50 rounded-lg">
                  {/* Color Picker */}
                  <div className="flex flex-col items-center gap-1">
                    <input
                      type="color"
                      value={color.value}
                      onChange={(e) => updateColor(index, 'value', e.target.value)}
                      className="w-16 h-16 rounded cursor-pointer border-2 border-white/30"
                    />
                    <div className="text-xs text-gray-500">{color.value}</div>
                  </div>

                  {/* Name & Word */}
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Display Name (e.g., Red)"
                      value={color.name}
                      onChange={(e) => updateColor(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-black/50 border border-purple-800/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <input
                      type="text"
                      placeholder="Word Text (e.g., RED)"
                      value={color.word}
                      onChange={(e) => updateColor(index, 'word', e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-black/50 border border-purple-800/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 uppercase"
                    />
                  </div>

                  {/* Preview */}
                  <div 
                    className="px-4 py-2 rounded font-bold text-2xl"
                    style={{ color: color.value, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    {color.word || 'WORD'}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeColor(index)}
                    disabled={customColors.length <= 3}
                    className="px-3 py-2 bg-red-600/20 border border-red-500/50 rounded text-red-300 text-sm hover:bg-red-600/30 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {customColors.length < 3 && (
              <div className="text-xs text-yellow-400 mt-2">
                ⚠️ You need at least 3 colors for the game to work properly
              </div>
            )}
          </div>
        )}
      </div>

      {/* Current Settings Summary */}
      <div className="p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/50 rounded-lg">
        <div className="text-sm font-medium text-gray-300 mb-3">📋 Current Settings</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-500">Difficulty:</span>
            <span className="text-white ml-2 font-semibold">
              {difficultyLevels.find(d => d.value === difficulty)?.label}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Mode:</span>
            <span className="text-white ml-2 font-semibold">
              {gameModes.find(m => m.value === gameMode)?.label}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Rounds:</span>
            <span className="text-white ml-2 font-semibold">{rounds}</span>
          </div>
          <div>
            <span className="text-gray-500">Time/Round:</span>
            <span className="text-white ml-2 font-semibold">{(timePerRound / 1000).toFixed(1)}s</span>
          </div>
          <div>
            <span className="text-gray-500">Matching:</span>
            <span className="text-white ml-2 font-semibold">{Math.round(congruentRatio * 100)}%</span>
          </div>
          <div>
            <span className="text-gray-500">Colors:</span>
            <span className="text-white ml-2 font-semibold">
              {useCustomColors ? `${customColors.length} custom` : '6 default'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}


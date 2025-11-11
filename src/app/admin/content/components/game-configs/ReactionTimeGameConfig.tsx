'use client'

import { useState, useEffect, useRef } from 'react'
import { uploadImageFromFormData, deleteGameImage } from '@/actions/storage'

interface ReactionTimeGameConfigProps {
  config: Record<string, any>
  onChange: (config: Record<string, any>) => void
}

interface CustomStimulus {
  type: 'emoji' | 'image'
  emoji?: string
  label?: string
  imageUrl?: string
  imagePath?: string
}

export default function ReactionTimeGameConfig({ config, onChange }: ReactionTimeGameConfigProps) {
  const [difficulty, setDifficulty] = useState(config.difficulty || 'easy')
  const [rounds, setRounds] = useState(config.rounds || 5)
  const [stimulusType, setStimulusType] = useState(config.stimulusType || 'color')
  const [minDelay, setMinDelay] = useState(config.minDelay || 1000)
  const [maxDelay, setMaxDelay] = useState(config.maxDelay || 3000)
  const [customStimulus, setCustomStimulus] = useState<CustomStimulus>(
    config.customStimulus || { type: 'emoji', emoji: '⚡', label: 'CLICK NOW!' }
  )
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const difficultyLevels = [
    { value: 'very_easy', label: 'Very Easy', description: 'Target: <800ms', color: 'bg-green-600' },
    { value: 'easy', label: 'Easy', description: 'Target: <700ms', color: 'bg-green-500' },
    { value: 'easy_medium', label: 'Easy-Medium', description: 'Target: <600ms', color: 'bg-blue-500' },
    { value: 'medium', label: 'Medium', description: 'Target: <500ms', color: 'bg-yellow-500' },
    { value: 'medium_hard', label: 'Medium-Hard', description: 'Target: <400ms', color: 'bg-orange-500' },
    { value: 'hard', label: 'Hard', description: 'Target: <350ms', color: 'bg-red-500' },
    { value: 'very_hard', label: 'Very Hard', description: 'Target: <300ms', color: 'bg-red-600' }
  ]

  const stimulusTypes = [
    { value: 'color', label: 'Color Flash', preview: '🟢' },
    { value: 'emoji', label: 'Lightning Bolt', preview: '⚡' },
    { value: 'shape', label: 'Circle Shape', preview: '🔴' },
    { value: 'target', label: 'Target Icon', preview: '🎯' },
    { value: 'star', label: 'Star Icon', preview: '⭐' },
    { value: 'custom', label: 'Custom', preview: '📷🖼️✨' }
  ]

  useEffect(() => {
    onChange({
      difficulty,
      rounds,
      stimulusType,
      minDelay,
      maxDelay,
      customStimulus: stimulusType === 'custom' ? customStimulus : undefined
    })
  }, [difficulty, rounds, stimulusType, minDelay, maxDelay, customStimulus])

  const handleDifficultyChange = (newDifficulty: string) => {
    setDifficulty(newDifficulty)
    
    // Adjust delays based on difficulty
    const delaySettings: Record<string, { min: number; max: number }> = {
      very_easy: { min: 1500, max: 3500 },
      easy: { min: 1200, max: 3000 },
      easy_medium: { min: 1000, max: 2500 },
      medium: { min: 800, max: 2000 },
      medium_hard: { min: 600, max: 1500 },
      hard: { min: 500, max: 1200 },
      very_hard: { min: 400, max: 1000 }
    }
    
    const settings = delaySettings[newDifficulty] || delaySettings.easy
    setMinDelay(settings.min)
    setMaxDelay(settings.max)
  }

  const handleStimulusTypeChange = (type: string) => {
    setStimulusType(type)
    
    if (type === 'custom' && !customStimulus.emoji && !customStimulus.imageUrl) {
      setCustomStimulus({
        type: 'emoji',
        emoji: '⚡',
        label: 'CLICK NOW!'
      })
    }
  }

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    try {
      // Delete old image if exists
      if (customStimulus.imagePath) {
        await deleteGameImage(customStimulus.imagePath)
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('gameType', 'reaction')

      const result = await uploadImageFromFormData(formData)

      if ('url' in result && result.url && result.path) {
        setCustomStimulus({
          ...customStimulus,
          type: 'image',
          imageUrl: result.url,
          imagePath: result.path
        })
      } else {
        alert('Failed to upload image: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }
      handleImageUpload(file)
    }
  }

  const clearStimulusImage = async () => {
    if (customStimulus.imagePath) {
      try {
        await deleteGameImage(customStimulus.imagePath)
      } catch (error) {
        console.error('Error deleting image:', error)
      }
    }
    
    setCustomStimulus({
      type: 'emoji',
      emoji: customStimulus.emoji || '⚡',
      label: customStimulus.label
    })
  }

  const showCustomEditor = stimulusType === 'custom'

  return (
    <div className="space-y-6">
      {/* Difficulty Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Difficulty Level
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
                  ? `${level.color} border-white text-white shadow-lg scale-105`
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

      {/* Number of Rounds */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Number of Rounds
        </label>
        <input
          type="number"
          min="3"
          max="15"
          value={rounds}
          onChange={(e) => setRounds(Math.max(3, Math.min(15, parseInt(e.target.value) || 5)))}
          className="w-full px-4 py-2 bg-black/30 border border-purple-800/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-gray-500 mt-1">3-15 rounds (recommended: 5-10)</p>
      </div>

      {/* Stimulus Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Stimulus Type (What appears when it's time to react)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {stimulusTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => handleStimulusTypeChange(type.value)}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${stimulusType === type.value
                  ? 'bg-purple-600 border-white text-white shadow-lg scale-105'
                  : 'bg-black/30 border-purple-800/30 text-gray-300 hover:border-purple-600'
                }
              `}
            >
              <div className="text-3xl mb-2">{type.preview}</div>
              <div className="text-sm font-medium">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Stimulus Editor */}
      {showCustomEditor && (
        <div className="p-4 bg-black/30 border border-purple-800/30 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-300">Custom Stimulus</div>
            <div className="text-xs text-gray-500">Choose emoji/text or upload an image</div>
          </div>

          {/* Label Input */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              Label (optional - shown with stimulus)
            </label>
            <input
              type="text"
              placeholder="e.g., CLICK NOW!, GO!, React!"
              value={customStimulus.label || ''}
              onChange={(e) => setCustomStimulus({ ...customStimulus, label: e.target.value })}
              className="w-full px-3 py-2 bg-black/50 border border-purple-800/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Image or Emoji Display */}
          <div className="space-y-3">
            {customStimulus.type === 'image' && customStimulus.imageUrl ? (
              <div className="space-y-2">
                <div className="text-xs text-gray-400">Current Image</div>
                <div className="relative w-32 h-32 bg-purple-900/20 rounded-lg overflow-hidden mx-auto border-2 border-purple-600/50">
                  <img 
                    src={customStimulus.imageUrl} 
                    alt="Custom stimulus"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={clearStimulusImage}
                  className="w-full px-3 py-2 bg-orange-600/20 border border-orange-500/50 rounded text-orange-300 text-sm hover:bg-orange-600/30"
                >
                  🗑️ Clear Image
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-gray-400">Emoji / Text</div>
                <input
                  type="text"
                  placeholder="Enter emoji or text (e.g., ⚡ 🎯 GO!)"
                  value={customStimulus.emoji || ''}
                  onChange={(e) => setCustomStimulus({ ...customStimulus, type: 'emoji', emoji: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-purple-800/30 rounded text-white text-center text-2xl focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full px-3 py-2 bg-purple-600/20 border border-purple-500/50 rounded text-purple-300 text-sm hover:bg-purple-600/30 disabled:opacity-50"
                >
                  {uploadingImage ? '⏳ Uploading...' : '📷 Upload Custom Image'}
                </button>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="p-4 bg-green-600/20 border border-green-500/30 rounded-lg">
            <div className="text-xs text-gray-400 mb-2 text-center">Preview (on green screen)</div>
            <div className="flex flex-col items-center gap-2">
              {customStimulus.type === 'image' && customStimulus.imageUrl ? (
                <div className="w-24 h-24 flex items-center justify-center bg-white/10 rounded-lg">
                  <img 
                    src={customStimulus.imageUrl} 
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="text-6xl">{customStimulus.emoji || '⚡'}</div>
              )}
              {customStimulus.label && (
                <div className="text-lg font-bold text-white">{customStimulus.label}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timing Settings */}
      <div className="p-4 bg-black/20 border border-purple-800/20 rounded-lg space-y-4">
        <div className="text-sm font-medium text-gray-300 mb-3">
          Timing Settings (automatically set by difficulty)
        </div>
        
        <div>
          <label className="block text-xs text-gray-400 mb-2">
            Minimum Delay Before Stimulus (ms)
          </label>
          <input
            type="number"
            min="200"
            max="5000"
            step="100"
            value={minDelay}
            onChange={(e) => setMinDelay(Math.max(200, parseInt(e.target.value) || 1000))}
            className="w-full px-3 py-2 bg-black/30 border border-purple-800/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-2">
            Maximum Delay Before Stimulus (ms)
          </label>
          <input
            type="number"
            min="500"
            max="10000"
            step="100"
            value={maxDelay}
            onChange={(e) => setMaxDelay(Math.max(minDelay + 100, parseInt(e.target.value) || 3000))}
            className="w-full px-3 py-2 bg-black/30 border border-purple-800/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="text-xs text-gray-500">
          The stimulus will appear randomly between {minDelay}ms and {maxDelay}ms after the "Wait..." screen
        </div>
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
            <span className="text-gray-500">Rounds:</span>
            <span className="text-white ml-2 font-semibold">{rounds}</span>
          </div>
          <div>
            <span className="text-gray-500">Stimulus:</span>
            <span className="text-white ml-2 font-semibold">
              {stimulusTypes.find(s => s.value === stimulusType)?.label}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Delay Range:</span>
            <span className="text-white ml-2 font-semibold">{minDelay}-{maxDelay}ms</span>
          </div>
        </div>
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect, useRef } from 'react'
import { Game, GameConfig } from '@/types/learning-path'
import { recordGameAttempt } from '@/actions/learning-path'

interface SimonSaysGameProps {
  game: Game
  userId: number
  learningDayId: number
  dayGameId: number
  onComplete: (isCorrect: boolean, score: number) => void
}

interface SimonItem {
  id: string
  value: string
  emoji: string
  color: string
  sound?: string
  imageUrl?: string
  isImage?: boolean
}

export default function SimonSaysGame({ 
  game, 
  userId, 
  learningDayId, 
  dayGameId, 
  onComplete 
}: SimonSaysGameProps) {
  const config = game.config as GameConfig
  const difficulty = config.difficulty || 'easy'
  const theme = config.simonTheme || 'colors'
  const maxLevel = config.maxLevel || 10
  
  const [sequence, setSequence] = useState<number[]>([])
  const [userSequence, setUserSequence] = useState<number[]>([])
  const [currentLevel, setCurrentLevel] = useState(1)
  const [isShowingSequence, setIsShowingSequence] = useState(false)
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null)
  const [canPlay, setCanPlay] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [score, setScore] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrectRound, setIsCorrectRound] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Timer
  useEffect(() => {
    if (!gameStarted || gameCompleted) return
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)
    
    return () => clearInterval(timer)
  }, [gameStarted, gameCompleted])

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return () => {
      audioContextRef.current?.close()
    }
  }, [])

  function getItems(): SimonItem[] {
    // Check if custom items exist in config
    const customSimonItems = (config as any).customSimonItems
    if (theme === 'custom' && customSimonItems && customSimonItems.length === 4) {
      return customSimonItems.map((item: any, index: number) => ({
        id: String(index + 1),
        value: item.label,
        emoji: item.type === 'image' ? '' : (item.emoji || '?'),
        color: item.color,
        sound: item.sound,
        imageUrl: item.imageUrl,
        isImage: item.type === 'image'
      }))
    }

    // Default built-in themes
    const themes = {
      colors: [
        { id: '1', value: 'red', emoji: '🔴', color: 'bg-red-500', sound: '261.63' },
        { id: '2', value: 'blue', emoji: '🔵', color: 'bg-blue-500', sound: '329.63' },
        { id: '3', value: 'green', emoji: '🟢', color: 'bg-green-500', sound: '392.00' },
        { id: '4', value: 'yellow', emoji: '🟡', color: 'bg-yellow-500', sound: '523.25' }
      ],
      shapes: [
        { id: '1', value: 'circle', emoji: '⭕', color: 'bg-purple-500', sound: '261.63' },
        { id: '2', value: 'square', emoji: '⬜', color: 'bg-pink-500', sound: '329.63' },
        { id: '3', value: 'triangle', emoji: '🔺', color: 'bg-orange-500', sound: '392.00' },
        { id: '4', value: 'star', emoji: '⭐', color: 'bg-cyan-500', sound: '523.25' }
      ],
      animals: [
        { id: '1', value: 'dog', emoji: '🐕', color: 'bg-amber-600', sound: '261.63' },
        { id: '2', value: 'cat', emoji: '🐈', color: 'bg-gray-600', sound: '329.63' },
        { id: '3', value: 'rabbit', emoji: '🐰', color: 'bg-pink-400', sound: '392.00' },
        { id: '4', value: 'bear', emoji: '🐻', color: 'bg-amber-800', sound: '523.25' }
      ],
      food: [
        { id: '1', value: 'apple', emoji: '🍎', color: 'bg-red-600', sound: '261.63' },
        { id: '2', value: 'banana', emoji: '🍌', color: 'bg-yellow-400', sound: '329.63' },
        { id: '3', value: 'grapes', emoji: '🍇', color: 'bg-purple-600', sound: '392.00' },
        { id: '4', value: 'orange', emoji: '🍊', color: 'bg-orange-500', sound: '523.25' }
      ],
      numbers: [
        { id: '1', value: '1', emoji: '1️⃣', color: 'bg-blue-600', sound: '261.63' },
        { id: '2', value: '2', emoji: '2️⃣', color: 'bg-green-600', sound: '329.63' },
        { id: '3', value: '3', emoji: '3️⃣', color: 'bg-red-600', sound: '392.00' },
        { id: '4', value: '4', emoji: '4️⃣', color: 'bg-yellow-600', sound: '523.25' }
      ]
    }
    return themes[theme as keyof typeof themes] || themes.colors
  }

  function getSpeed(): number {
    const speeds = {
      very_easy: 1200,
      easy: 1000,
      easy_medium: 850,
      medium: 700,
      medium_hard: 600,
      hard: 500,
      very_hard: 400
    }
    return speeds[difficulty as keyof typeof speeds] || 1000
  }

  function getStartingLength(): number {
    const lengths = {
      very_easy: 2,
      easy: 2,
      easy_medium: 3,
      medium: 3,
      medium_hard: 3,
      hard: 4,
      very_hard: 4
    }
    return lengths[difficulty as keyof typeof lengths] || 2
  }

  function playSound(frequency: string) {
    if (!audioContextRef.current) return
    
    try {
      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)
      
      oscillator.frequency.value = parseFloat(frequency)
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.3)
      
      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + 0.3)
    } catch (error) {
      console.log('Audio playback failed:', error)
    }
  }

  async function startNewRound() {
    setCanPlay(false)
    setUserSequence([])
    setShowFeedback(false)
    
    // Generate new sequence
    const items = getItems()
    const newSequence = [...sequence]
    const randomIndex = Math.floor(Math.random() * items.length)
    newSequence.push(randomIndex)
    setSequence(newSequence)
    
    // Show sequence
    await showSequence(newSequence)
  }

  async function showSequence(seq: number[]) {
    setIsShowingSequence(true)
    const items = getItems()
    const speed = getSpeed()
    
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, speed))
      setActiveItemIndex(seq[i])
      playSound(items[seq[i]].sound || '440')
      await new Promise(resolve => setTimeout(resolve, speed * 0.6))
      setActiveItemIndex(null)
    }
    
    setIsShowingSequence(false)
    setCanPlay(true)
  }

  function handleItemClick(index: number) {
    if (!canPlay || isShowingSequence || showFeedback) return
    
    const items = getItems()
    const newUserSequence = [...userSequence, index]
    setUserSequence(newUserSequence)
    
    // Visual and audio feedback
    setActiveItemIndex(index)
    playSound(items[index].sound || '440')
    setTimeout(() => setActiveItemIndex(null), 200)
    
    // Check if correct
    if (index !== sequence[newUserSequence.length - 1]) {
      // Wrong!
      handleWrongAnswer()
      return
    }
    
    // Check if sequence is complete
    if (newUserSequence.length === sequence.length) {
      handleCorrectSequence()
    }
  }

  function handleWrongAnswer() {
    setMistakes(prev => prev + 1)
    setCanPlay(false)
    setShowFeedback(true)
    setIsCorrectRound(false)
    
    setTimeout(() => {
      if (mistakes + 1 >= 3) {
        // Game over after 3 mistakes
        handleGameEnd()
      } else {
        // Try same sequence again
        setUserSequence([])
        setShowFeedback(false)
        showSequence(sequence)
      }
    }, 1500)
  }

  function handleCorrectSequence() {
    setIsCorrectRound(true)
    setShowFeedback(true)
    setCanPlay(false)
    
    // Calculate score for this round
    const roundScore = Math.round(100 * (sequence.length / maxLevel))
    setScore(prev => prev + roundScore)
    
    setTimeout(() => {
      if (currentLevel >= maxLevel) {
        handleGameEnd()
      } else {
        setCurrentLevel(prev => prev + 1)
        startNewRound()
      }
    }, 1500)
  }

  const handleGameEnd = async () => {
    if (gameCompleted) return
    setGameCompleted(true)

    const levelsCompleted = currentLevel - (isCorrectRound ? 0 : 1)
    const finalScore = Math.max(0, Math.min(100, Math.round((levelsCompleted / maxLevel) * 100)))
    
    await recordGameAttempt({
      userId,
      gameId: game.id,
      learningDayId,
      dayGameId,
      isCorrect: true, // Always mark as completed
      score: finalScore,
      timeTakenSeconds: timeElapsed,
      mistakesCount: mistakes,
      gameData: {
        correctSequence: sequence,
        userSequence: userSequence,
        levelsCompleted,
        maxLevel,
        accuracy: sequence.length > 0 ? (levelsCompleted / maxLevel) * 100 : 0
      }
    })

    setTimeout(() => {
      onComplete(true, finalScore)
    }, 2000)
  }

  function startGame() {
    setGameStarted(true)
    const startLength = getStartingLength()
    const items = getItems()
    
    // Generate initial sequence
    const initialSequence: number[] = []
    for (let i = 0; i < startLength; i++) {
      initialSequence.push(Math.floor(Math.random() * items.length))
    }
    
    setSequence(initialSequence)
    setTimeout(() => showSequence(initialSequence), 500)
  }

  const items = getItems()

  if (gameCompleted) {
    const levelsCompleted = currentLevel - (isCorrectRound ? 0 : 1)
    const successRate = (levelsCompleted / maxLevel) * 100
    
    return (
      <div className="text-center py-12">
        <div className={`text-6xl mb-4 ${successRate >= 50 ? 'text-green-600' : 'text-yellow-600'}`}>
          {successRate >= 70 ? '🎉' : successRate >= 50 ? '👍' : '💪'}
        </div>
        <h3 className="text-3xl font-bold mb-2">
          {successRate >= 70 ? 'Amazing Memory!' : successRate >= 50 ? 'Good Job!' : 'Keep Practicing!'}
        </h3>
        <p className="text-gray-600 mb-4 text-xl">
          You completed {levelsCompleted} out of {maxLevel} levels!
        </p>
        <p className="text-gray-500">
          Longest sequence: {sequence.length} | Mistakes: {mistakes} | Time: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
        </p>
      </div>
    )
  }

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-4">{game.name}</h2>
          <p className="text-gray-600 text-center mb-6 text-lg">{game.description}</p>

          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-blue-800 mb-3">🎮 How to Play:</h3>
            <ol className="space-y-2 text-blue-900">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>Watch the sequence of items light up and play sounds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>Wait for the sequence to finish</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Repeat the sequence by clicking the items in the same order</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">4.</span>
                <span>Each level adds one more item to remember!</span>
              </li>
            </ol>
          </div>

          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">Max Levels</div>
                <div className="text-2xl font-bold text-purple-600">{maxLevel}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Starting Length</div>
                <div className="text-2xl font-bold text-purple-600">{getStartingLength()}</div>
              </div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Start Game
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-center mb-2">{game.name}</h2>

        {/* Stats */}
        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg mb-6">
          <div className="text-center">
            <div className="text-sm text-gray-600">Level</div>
            <div className="text-2xl font-bold text-blue-600">{currentLevel} / {maxLevel}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Sequence Length</div>
            <div className="text-2xl font-bold text-purple-600">{sequence.length}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Mistakes</div>
            <div className="text-2xl font-bold text-red-500">{mistakes} / 3</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Time</div>
            <div className="text-2xl font-bold">
              {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center mb-6">
          {isShowingSequence && (
            <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-4">
              <p className="text-blue-800 font-bold text-xl">👀 Watch carefully!</p>
            </div>
          )}
          {canPlay && !showFeedback && (
            <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4">
              <p className="text-green-800 font-bold text-xl">
                🎯 Your turn! ({userSequence.length}/{sequence.length})
              </p>
            </div>
          )}
          {showFeedback && (
            <div className={`border-2 rounded-lg p-4 ${
              isCorrectRound 
                ? 'bg-green-100 border-green-400 text-green-800' 
                : 'bg-red-100 border-red-400 text-red-800'
            }`}>
              <div className="text-3xl mb-2">{isCorrectRound ? '✅' : '❌'}</div>
              <p className="font-bold text-xl">
                {isCorrectRound ? 'Perfect! Moving to next level!' : 'Oops! Try again!'}
              </p>
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(index)}
              disabled={!canPlay || isShowingSequence || showFeedback}
              className={`
                aspect-square rounded-2xl flex flex-col items-center justify-center
                transition-all duration-200 shadow-lg overflow-hidden
                ${activeItemIndex === index 
                  ? `${item.color} scale-95 shadow-2xl brightness-125` 
                  : 'bg-gray-200 hover:scale-105'
                }
                ${canPlay && !isShowingSequence && !showFeedback ? 'cursor-pointer' : 'cursor-not-allowed'}
                disabled:opacity-50
              `}
            >
              {item.isImage && item.imageUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-2">
                  <img 
                    src={item.imageUrl} 
                    alt={item.value}
                    className={`max-w-[80%] max-h-[80%] object-contain ${activeItemIndex === index ? 'animate-bounce' : ''}`}
                  />
                  <div className="text-sm font-medium mt-2 capitalize text-white">
                    {item.value}
                  </div>
                </div>
              ) : (
                <>
                  <div className={`text-6xl ${activeItemIndex === index ? 'animate-bounce' : ''}`}>
                    {item.emoji}
                  </div>
                  <div className="text-sm font-medium mt-2 capitalize">
                    {item.value}
                  </div>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Progress Indicator */}
        {canPlay && !showFeedback && (
          <div className="mt-6">
            <div className="flex justify-center gap-2">
              {sequence.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index < userSequence.length
                      ? userSequence[index] === sequence[index]
                        ? 'bg-green-500'
                        : 'bg-red-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


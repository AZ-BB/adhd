'use client'

import { useState, useEffect } from 'react'
import { Game, GameConfig } from '@/types/learning-path'
import { recordGameAttempt } from '@/actions/learning-path'

interface SpotTheItemGameProps {
  game: Game
  userId: number
  learningDayId: number
  dayGameId: number
  onComplete: (isCorrect: boolean, score: number) => void
  language?: 'en' | 'ar'
}

interface GameItem {
  id: string
  emoji: string
  isTarget: boolean
  isFound: boolean
  position: { x: number; y: number }
}

export default function SpotTheItemGame({ 
  game, 
  userId, 
  learningDayId, 
  dayGameId, 
  onComplete,
  language = 'en'
}: SpotTheItemGameProps) {
  const config = game.config as GameConfig
  const targetCount = config.targetCount || 3
  const duration = config.duration || 60
  const difficulty = config.difficulty || 'easy'

  const t = {
    en: {
      findThis: 'Find This',
      found: 'Found',
      mistakes: 'Mistakes',
      timeLeft: 'Time Left',
      clickAll: 'Click on all {emoji} items as fast as you can!',
      greatJob: 'Great Job!',
      foundAll: 'You found all {count} items in {time} seconds!',
      timesUp: "Time's Up!",
      foundOut: 'You found {found} out of {target} items.',
      tryAgain: 'Try again to improve!'
    },
    ar: {
      findThis: 'ابحث عن هذا',
      found: 'تم العثور',
      mistakes: 'الأخطاء',
      timeLeft: 'الوقت المتبقي',
      clickAll: 'انقر على جميع العناصر {emoji} بأسرع ما يمكن!',
      greatJob: 'أحسنت!',
      foundAll: 'لقد وجدت جميع {count} العناصر في {time} ثانية!',
      timesUp: 'انتهى الوقت!',
      foundOut: 'لقد وجدت {found} من أصل {target} عنصر.',
      tryAgain: 'حاول مرة أخرى للتحسين!'
    }
  }
  const text = t[language]
  
  const [items, setItems] = useState<GameItem[]>([])
  const [targetEmoji, setTargetEmoji] = useState('')
  const [foundCount, setFoundCount] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showInstruction, setShowInstruction] = useState(true)

  // Initialize game
  useEffect(() => {
    generateItems()
  }, [])

  // Timer
  useEffect(() => {
    if (!gameStarted || gameCompleted) return
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => {
        if (prev >= duration) {
          handleGameEnd(false)
          return prev
        }
        return prev + 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [gameStarted, gameCompleted, duration])

  // Check for completion
  useEffect(() => {
    if (foundCount >= targetCount && foundCount > 0) {
      handleGameEnd(true)
    }
  }, [foundCount, targetCount])

  const generateItems = () => {
    const emojis = getEmojisByDifficulty(difficulty)
    const target = emojis[Math.floor(Math.random() * emojis.length)]
    setTargetEmoji(target)

    const distractors = emojis.filter(e => e !== target)
    const itemCount = getDifficultyItemCount(difficulty)
    
    const newItems: GameItem[] = []
    
    // Add target items
    for (let i = 0; i < targetCount; i++) {
      newItems.push({
        id: `target-${i}`,
        emoji: target,
        isTarget: true,
        isFound: false,
        position: getRandomPosition(newItems)
      })
    }
    
    // Add distractor items
    const distractorCount = itemCount - targetCount
    for (let i = 0; i < distractorCount; i++) {
      const randomDistractor = distractors[Math.floor(Math.random() * distractors.length)]
      newItems.push({
        id: `distractor-${i}`,
        emoji: randomDistractor,
        isTarget: false,
        isFound: false,
        position: getRandomPosition(newItems)
      })
    }

    setItems(shuffleArray(newItems))
  }

  const getEmojisByDifficulty = (diff: string): string[] => {
    const allEmojis = {
      very_easy: ['😀', '😊', '😂', '😍', '🥰', '😎'],
      easy: ['🐕', '🐈', '🐰', '🐻', '🦁', '🐸', '🐷', '🐮'],
      easy_medium: ['🌸', '🌺', '🌻', '🌷', '🌹', '🏵️', '🌼', '💐', '🥀'],
      medium: ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍒', '🥝', '🍑', '🍍'],
      medium_hard: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚'],
      hard: ['⚽', '🏀', '⚾', '🎾', '🏐', '🏈', '🎱', '🏓', '🏸', '🥏', '🎳', '⛳'],
      very_hard: ['🎮', '🎯', '🎲', '🎰', '🎳', '🎪', '🎨', '🎭', '🎬', '🎤', '🎧', '🎸', '🎹', '🎺']
    }
    
    return allEmojis[diff as keyof typeof allEmojis] || allEmojis.easy
  }

  const getDifficultyItemCount = (diff: string): number => {
    const counts = {
      very_easy: 8,
      easy: 12,
      easy_medium: 16,
      medium: 20,
      medium_hard: 25,
      hard: 30,
      very_hard: 40
    }
    return counts[diff as keyof typeof counts] || 12
  }

  const getRandomPosition = (existingItems: GameItem[]): { x: number; y: number } => {
    let position: { x: number; y: number }
    let attempts = 0
    const maxAttempts = 50
    const minDistance = 80 // Minimum distance between items

    do {
      position = {
        x: Math.random() * 90, // percentage
        y: Math.random() * 90
      }
      attempts++
      
      // Check if position is too close to existing items
      const tooClose = existingItems.some(item => {
        const dx = Math.abs(item.position.x - position.x)
        const dy = Math.abs(item.position.y - position.y)
        const distance = Math.sqrt(dx * dx + dy * dy)
        return distance < minDistance / 10 // Adjust for percentage scale
      })
      
      if (!tooClose || attempts >= maxAttempts) {
        break
      }
    } while (attempts < maxAttempts)

    return position
  }

  const handleItemClick = (itemId: string) => {
    if (!gameStarted) {
      setGameStarted(true)
      setShowInstruction(false)
    }
    if (gameCompleted) return

    const item = items.find(i => i.id === itemId)
    if (!item || item.isFound) return

    if (item.isTarget) {
      // Correct click
      setItems(prev => prev.map(i => 
        i.id === itemId ? { ...i, isFound: true } : i
      ))
      setFoundCount(prev => prev + 1)
    } else {
      // Wrong click
      setMistakes(prev => prev + 1)
    }
  }

  const handleGameEnd = async (isCorrect: boolean) => {
    if (gameCompleted) return
    setGameCompleted(true)

    const maxScore = 100
    const mistakePenalty = mistakes * 10
    const timePenalty = isCorrect ? 0 : Math.max(0, (duration - timeElapsed) * 0.5)
    const score = Math.max(0, Math.round(maxScore - mistakePenalty - timePenalty))

    await recordGameAttempt({
      userId,
      gameId: game.id,
      learningDayId,
      dayGameId,
      isCorrect,
      score: isCorrect ? score : 0,
      timeTakenSeconds: timeElapsed,
      mistakesCount: mistakes,
      gameData: {
        foundItems: items.filter(i => i.isFound && i.isTarget).map(i => i.emoji),
        missedItems: items.filter(i => !i.isFound && i.isTarget).map(i => i.emoji),
        clickAccuracy: items.length > 0 ? (foundCount / (foundCount + mistakes)) * 100 : 0
      }
    })

    setTimeout(() => {
      onComplete(isCorrect, isCorrect ? score : 0)
    }, 2000)
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <h2 className="text-2xl font-bold text-center mb-2">{language === 'ar' ? game.name_ar || game.name : game.name}</h2>
        <p className="text-gray-600 text-center mb-6">{language === 'ar' ? game.description_ar || game.description : game.description}</p>

        {/* Stats */}
        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg mb-6">
          <div className="text-center">
            <div className="text-sm text-gray-600">{text.findThis}</div>
            <div className="text-4xl">{targetEmoji}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">{text.found}</div>
            <div className="text-2xl font-bold text-green-600">{foundCount} / {targetCount}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">{text.mistakes}</div>
            <div className="text-2xl font-bold text-red-500">{mistakes}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">{text.timeLeft}</div>
            <div className="text-2xl font-bold">
              {Math.floor((duration - timeElapsed) / 60)}:{((duration - timeElapsed) % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Instruction */}
        {showInstruction && (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6 text-center">
            <p className="text-blue-800 font-medium">
              {text.clickAll.replace('{emoji}', targetEmoji)}
            </p>
          </div>
        )}

        {/* Game Area */}
        <div className="relative bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-lg overflow-hidden" style={{ height: '500px' }}>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              disabled={item.isFound || gameCompleted}
              className={`
                absolute text-4xl transition-all duration-200
                ${item.isFound 
                  ? 'opacity-30 scale-75 cursor-not-allowed' 
                  : 'hover:scale-125 cursor-pointer'
                }
                ${gameCompleted && !item.isFound && item.isTarget 
                  ? 'ring-4 ring-red-500 ring-offset-2' 
                  : ''
                }
              `}
              style={{
                left: `${item.position.x}%`,
                top: `${item.position.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {item.emoji}
            </button>
          ))}
        </div>

        {/* Completion Message */}
        {gameCompleted && (
          <div className={`mt-6 text-center p-6 rounded-lg ${
            foundCount >= targetCount 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {foundCount >= targetCount ? (
              <>
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-2xl font-bold mb-2">{text.greatJob}</h3>
                <p>{text.foundAll.replace('{count}', targetCount.toString()).replace('{time}', timeElapsed.toString())}</p>
                <p className="text-sm mt-2">{text.mistakes}: {mistakes}</p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">⏱️</div>
                <h3 className="text-2xl font-bold mb-2">{text.timesUp}</h3>
                <p>{text.foundOut.replace('{found}', foundCount.toString()).replace('{target}', targetCount.toString())}</p>
                <p className="text-sm mt-2">{text.tryAgain}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}


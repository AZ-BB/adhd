'use client'

import { useState, useEffect } from 'react'
import { Game, GameConfig, MatchingGameState } from '@/types/learning-path'
import { recordGameAttempt } from '@/actions/learning-path'

interface MatchingGameProps {
  game: Game
  userId: number
  learningDayId: number
  dayGameId: number
  onComplete: (isCorrect: boolean, score: number) => void
}

interface MatchItem {
  id: string
  value: string
  matched: boolean
}

export default function MatchingGame({ game, userId, learningDayId, dayGameId, onComplete }: MatchingGameProps) {
  const config = game.config as GameConfig
  const itemCount = config.itemCount || 5
  const category = config.category || 'colors'
  
  const [leftItems, setLeftItems] = useState<MatchItem[]>([])
  const [rightItems, setRightItems] = useState<MatchItem[]>([])
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  const [matches, setMatches] = useState<Array<{ left: string; right: string }>>([])
  const [mistakes, setMistakes] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)

  // Initialize items
  useEffect(() => {
    const items = generateMatchingItems(itemCount, category)
    const shuffledRight = shuffleArray([...items.right])
    
    setLeftItems(items.left.map((value, index) => ({
      id: `left-${index}`,
      value,
      matched: false
    })))
    
    setRightItems(shuffledRight.map((value, index) => ({
      id: `right-${index}`,
      value,
      matched: false
    })))
  }, [itemCount, category])

  // Timer
  useEffect(() => {
    if (!gameStarted || gameCompleted) return
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)
    
    return () => clearInterval(timer)
  }, [gameStarted, gameCompleted])

  // Check for game completion
  useEffect(() => {
    if (matches.length === itemCount && matches.length > 0) {
      handleGameEnd(true)
    }
  }, [matches, itemCount])

  const handleLeftClick = (id: string) => {
    if (!gameStarted) setGameStarted(true)
    if (gameCompleted) return
    
    const item = leftItems.find(i => i.id === id)
    if (item?.matched) return
    
    setSelectedLeft(id)
    
    if (selectedRight) {
      checkMatch(id, selectedRight)
    }
  }

  const handleRightClick = (id: string) => {
    if (!gameStarted) setGameStarted(true)
    if (gameCompleted) return
    
    const item = rightItems.find(i => i.id === id)
    if (item?.matched) return
    
    setSelectedRight(id)
    
    if (selectedLeft) {
      checkMatch(selectedLeft, id)
    }
  }

  const checkMatch = (leftId: string, rightId: string) => {
    const leftItem = leftItems.find(i => i.id === leftId)
    const rightItem = rightItems.find(i => i.id === rightId)
    
    if (!leftItem || !rightItem) return
    
    // Check if values match (implement your matching logic here)
    const isMatch = checkIfMatching(leftItem.value, rightItem.value, category)
    
    if (isMatch) {
      // Correct match
      setMatches(prev => [...prev, { left: leftId, right: rightId }])
      setLeftItems(prev => prev.map(i => 
        i.id === leftId ? { ...i, matched: true } : i
      ))
      setRightItems(prev => prev.map(i => 
        i.id === rightId ? { ...i, matched: true } : i
      ))
    } else {
      // Wrong match
      setMistakes(prev => prev + 1)
    }
    
    setSelectedLeft(null)
    setSelectedRight(null)
  }

  const handleGameEnd = async (isCorrect: boolean) => {
    if (gameCompleted) return
    setGameCompleted(true)
    
    const maxScore = 100
    const mistakePenalty = mistakes * 5
    const timePenalty = Math.max(0, (timeElapsed - 60) * 0.5)
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
        correctMatches: matches.length,
        incorrectMatches: mistakes
      }
    })
    
    onComplete(isCorrect, isCorrect ? score : 0)
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full mb-6">
        <h2 className="text-2xl font-bold text-center mb-2">{game.name}</h2>
        <p className="text-gray-600 text-center mb-4">{game.description}</p>
        
        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-gray-600">Matches</div>
            <div className="text-2xl font-bold">{matches.length} / {itemCount}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Mistakes</div>
            <div className="text-2xl font-bold text-red-500">{mistakes}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Time</div>
            <div className="text-2xl font-bold">
              {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Left Column */}
        <div className="space-y-3">
          {leftItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleLeftClick(item.id)}
              disabled={item.matched || gameCompleted}
              className={`
                w-full p-4 rounded-lg font-medium transition-all
                ${item.matched
                  ? 'bg-green-500 text-white opacity-50'
                  : selectedLeft === item.id
                  ? 'bg-blue-500 text-white scale-105'
                  : 'bg-gray-200 hover:bg-gray-300'
                }
                disabled:cursor-not-allowed
              `}
            >
              {item.value}
            </button>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {rightItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleRightClick(item.id)}
              disabled={item.matched || gameCompleted}
              className={`
                w-full p-4 rounded-lg font-medium transition-all
                ${item.matched
                  ? 'bg-green-500 text-white opacity-50'
                  : selectedRight === item.id
                  ? 'bg-blue-500 text-white scale-105'
                  : 'bg-gray-200 hover:bg-gray-300'
                }
                disabled:cursor-not-allowed
              `}
            >
              {item.value}
            </button>
          ))}
        </div>
      </div>

      {gameCompleted && (
        <div className="mt-6 text-center">
          <div className="text-green-600">
            <div className="text-3xl mb-2">🎉</div>
            <div className="text-xl font-bold">Great Job!</div>
            <div className="text-gray-600">
              You made {matches.length} matches with {mistakes} mistakes!
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper functions
function generateMatchingItems(count: number, category: string): { left: string[]; right: string[] } {
  const categories: Record<string, { left: string[]; right: string[] }> = {
    colors: {
      left: ['Apple 🍎', 'Banana 🍌', 'Leaf 🍃', 'Sky ☁️', 'Orange 🍊'],
      right: ['Red', 'Yellow', 'Green', 'Blue', 'Orange']
    },
    shapes: {
      left: ['Circle', 'Square', 'Triangle', 'Star', 'Heart'],
      right: ['⭕', '⬜', '🔺', '⭐', '❤️']
    },
    animals: {
      left: ['Dog 🐕', 'Cat 🐈', 'Cow 🐄', 'Duck 🦆', 'Lion 🦁'],
      right: ['Bark', 'Meow', 'Moo', 'Quack', 'Roar']
    }
  }
  
  const items = categories[category] || categories.colors
  return {
    left: items.left.slice(0, count),
    right: items.right.slice(0, count)
  }
}

function checkIfMatching(left: string, right: string, category: string): boolean {
  // Implement your matching logic based on category
  // This is a simple example - customize based on your needs
  const matches: Record<string, Record<string, string>> = {
    colors: {
      'Apple 🍎': 'Red',
      'Banana 🍌': 'Yellow',
      'Leaf 🍃': 'Green',
      'Sky ☁️': 'Blue',
      'Orange 🍊': 'Orange'
    },
    shapes: {
      'Circle': '⭕',
      'Square': '⬜',
      'Triangle': '🔺',
      'Star': '⭐',
      'Heart': '❤️'
    },
    animals: {
      'Dog 🐕': 'Bark',
      'Cat 🐈': 'Meow',
      'Cow 🐄': 'Moo',
      'Duck 🦆': 'Quack',
      'Lion 🦁': 'Roar'
    }
  }
  
  return matches[category]?.[left] === right
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}


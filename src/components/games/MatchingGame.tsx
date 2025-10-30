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
  type?: 'text' | 'image'
  imageUrl?: string
  pairId?: string
}

export default function MatchingGame({ game, userId, learningDayId, dayGameId, onComplete }: MatchingGameProps) {
  const config = game.config as GameConfig
  const itemCount = config.itemCount || 5
  const category = config.category || 'colors'
  const customPairs = (config as any).customPairs || []
  
  const [leftItems, setLeftItems] = useState<MatchItem[]>([])
  const [rightItems, setRightItems] = useState<MatchItem[]>([])
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  const [matches, setMatches] = useState<Array<{ left: string; right: string }>>([])
  const [mistakes, setMistakes] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [matchingMap, setMatchingMap] = useState<Record<string, string>>({})

  // Initialize items
  useEffect(() => {
    const items = generateMatchingItems(itemCount, category, customPairs)
    const shuffledRight = shuffleArray([...items.right])
    
    setLeftItems(items.left.map((item, index) => ({
      id: `left-${index}`,
      value: typeof item === 'string' ? item : item.value,
      matched: false,
      type: typeof item === 'string' ? 'text' : item.type,
      imageUrl: typeof item === 'string' ? undefined : item.imageUrl,
      pairId: typeof item === 'string' ? undefined : item.pairId
    })))
    
    setRightItems(shuffledRight.map((item, index) => ({
      id: `right-${index}`,
      value: typeof item === 'string' ? item : item.value,
      matched: false,
      type: typeof item === 'string' ? 'text' : item.type,
      imageUrl: typeof item === 'string' ? undefined : item.imageUrl,
      pairId: typeof item === 'string' ? undefined : item.pairId
    })))

    // Store the matching map for validation
    setMatchingMap(items.matchingMap)
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
    
    // Check if values match using pairId for custom pairs, or matching map for built-in categories
    let isMatch = false
    if (leftItem.pairId && rightItem.pairId) {
      // For custom pairs, match by pairId
      isMatch = leftItem.pairId === rightItem.pairId
    } else {
      // For built-in categories, use matching map
      isMatch = matchingMap[leftItem.value] === rightItem.value
    }
    
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

      <div className="grid grid-cols-2 gap-6 w-full max-w-6xl mx-auto">
        {/* Left Column */}
        <div className="space-y-3">
          {leftItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleLeftClick(item.id)}
              disabled={item.matched || gameCompleted}
              className={`
                w-full p-5 rounded-2xl font-semibold transition-all min-h-[110px] 
                flex items-center justify-center border-2
                ${item.matched
                  ? 'bg-green-500 text-white opacity-60 border-green-600'
                  : selectedLeft === item.id
                  ? 'bg-blue-500 text-white scale-[1.03] shadow-xl border-blue-600'
                  : 'bg-white hover:bg-gray-50 hover:scale-[1.02] border-gray-300 shadow-md hover:shadow-lg'
                }
                disabled:cursor-not-allowed
              `}
            >
              {item.type === 'image' && item.imageUrl ? (
                <div className="flex flex-col items-center gap-2 w-full">
                  <div className="w-24 h-24 flex items-center justify-center">
                    <img 
                      src={item.imageUrl} 
                      alt={item.value || 'Match item'}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  </div>
                  {item.value && item.value.trim() && !item.value.startsWith('Image') && !item.value.startsWith('Match') && (
                    <div className="text-base font-bold mt-1">{item.value}</div>
                  )}
                </div>
              ) : (
                <div className="text-2xl font-bold">{item.value}</div>
              )}
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
                w-full p-5 rounded-2xl font-semibold transition-all min-h-[110px] 
                flex items-center justify-center border-2
                ${item.matched
                  ? 'bg-green-500 text-white opacity-60 border-green-600'
                  : selectedRight === item.id
                  ? 'bg-blue-500 text-white scale-[1.03] shadow-xl border-blue-600'
                  : 'bg-white hover:bg-gray-50 hover:scale-[1.02] border-gray-300 shadow-md hover:shadow-lg'
                }
                disabled:cursor-not-allowed
              `}
            >
              {item.type === 'image' && item.imageUrl ? (
                <div className="flex flex-col items-center gap-2 w-full">
                  <div className="w-24 h-24 flex items-center justify-center">
                    <img 
                      src={item.imageUrl} 
                      alt={item.value || 'Match item'}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  </div>
                  {item.value && item.value.trim() && !item.value.startsWith('Image') && !item.value.startsWith('Match') && (
                    <div className="text-base font-bold mt-1">{item.value}</div>
                  )}
                </div>
              ) : (
                <div className="text-2xl font-bold">{item.value}</div>
              )}
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
function generateMatchingItems(
  count: number, 
  category: string, 
  customPairs: Array<any>
): { left: any[]; right: any[]; matchingMap: Record<string, string> } {
  // If custom pairs are provided, use them
  if (category === 'custom' && customPairs.length > 0) {
    const pairs = customPairs.slice(0, count)
    const matchingMap: Record<string, string> = {}
    
    const leftItems = pairs.map((pair: any, index: number) => {
      const pairId = `pair-${index}`
      const leftValue = pair.leftType === 'image' ? (pair.left || `Image ${index + 1}`) : pair.left
      const rightValue = pair.rightType === 'image' ? (pair.right || `Match ${index + 1}`) : pair.right
      matchingMap[leftValue] = rightValue
      
      return {
        value: leftValue,
        type: pair.leftType || 'text',
        imageUrl: pair.leftImageUrl,
        pairId
      }
    })
    
    const rightItems = pairs.map((pair: any, index: number) => {
      const pairId = `pair-${index}`
      return {
        value: pair.rightType === 'image' ? (pair.right || `Match ${index + 1}`) : pair.right,
        type: pair.rightType || 'text',
        imageUrl: pair.rightImageUrl,
        pairId
      }
    })
    
    return {
      left: leftItems,
      right: rightItems,
      matchingMap
    }
  }

  // Default categories
  const categories: Record<string, { pairs: Array<{ left: string; right: string }> }> = {
    colors: {
      pairs: [
        { left: 'Apple 🍎', right: 'Red' },
        { left: 'Banana 🍌', right: 'Yellow' },
        { left: 'Leaf 🍃', right: 'Green' },
        { left: 'Sky ☁️', right: 'Blue' },
        { left: 'Orange 🍊', right: 'Orange' },
        { left: 'Grape 🍇', right: 'Purple' },
        { left: 'Strawberry 🍓', right: 'Pink' },
        { left: 'Carrot 🥕', right: 'Orange' }
      ]
    },
    shapes: {
      pairs: [
        { left: 'Circle', right: '⭕' },
        { left: 'Square', right: '⬜' },
        { left: 'Triangle', right: '🔺' },
        { left: 'Star', right: '⭐' },
        { left: 'Heart', right: '❤️' },
        { left: 'Diamond', right: '💎' },
        { left: 'Pentagon', right: '⬟' }
      ]
    },
    animals: {
      pairs: [
        { left: 'Dog 🐕', right: 'Bark' },
        { left: 'Cat 🐈', right: 'Meow' },
        { left: 'Cow 🐄', right: 'Moo' },
        { left: 'Duck 🦆', right: 'Quack' },
        { left: 'Lion 🦁', right: 'Roar' },
        { left: 'Sheep 🐑', right: 'Baa' },
        { left: 'Horse 🐴', right: 'Neigh' },
        { left: 'Pig 🐷', right: 'Oink' }
      ]
    }
  }
  
  const categoryData = categories[category] || categories.colors
  const pairs = categoryData.pairs.slice(0, count)
  
  const matchingMap: Record<string, string> = {}
  pairs.forEach(pair => {
    matchingMap[pair.left] = pair.right
  })

  return {
    left: pairs.map(p => p.left),
    right: pairs.map(p => p.right),
    matchingMap
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}



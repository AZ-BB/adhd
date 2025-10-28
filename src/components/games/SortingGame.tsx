'use client'

import { useState, useEffect } from 'react'
import { Game, GameConfig } from '@/types/learning-path'
import { recordGameAttempt } from '@/actions/learning-path'

interface SortingGameProps {
  game: Game
  userId: number
  learningDayId: number
  dayGameId: number
  onComplete: (isCorrect: boolean, score: number) => void
}

interface SortingItem {
  id: string
  value: string
  emoji?: string
  correctCategory: string
  currentCategory: string | null
  imageUrl?: string
  type?: 'emoji' | 'image'
}

interface Category {
  id: string
  name: string
  emoji?: string
  color: string
  imageUrl?: string
  type?: 'emoji' | 'image'
}

export default function SortingGame({ game, userId, learningDayId, dayGameId, onComplete }: SortingGameProps) {
  const config = game.config as GameConfig
  const categoryType = (config as any).categoryType || 'colors'
  const itemCount = (config as any).itemCount || 8
  const customCategories = (config as any).customCategories || []
  const customItems = (config as any).customItems || []
  
  const [items, setItems] = useState<SortingItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [correctSorts, setCorrectSorts] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showFeedback, setShowFeedback] = useState<{ itemId: string; isCorrect: boolean } | null>(null)

  // Initialize game
  useEffect(() => {
    const { generatedCategories, generatedItems } = generateSortingData(
      categoryType,
      itemCount,
      customCategories,
      customItems
    )
    
    setCategories(generatedCategories)
    setItems(shuffleArray(generatedItems))
  }, [categoryType, itemCount])

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
    if (items.length > 0 && items.every(item => item.currentCategory !== null)) {
      handleGameEnd()
    }
  }, [items])

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    if (!gameStarted) setGameStarted(true)
    setDraggedItem(itemId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault()
    
    if (!draggedItem) return

    const item = items.find(i => i.id === draggedItem)
    if (!item || item.currentCategory !== null) return

    const isCorrect = item.correctCategory === categoryId

    if (isCorrect) {
      setCorrectSorts(prev => prev + 1)
    } else {
      setMistakes(prev => prev + 1)
    }

    // Show feedback
    setShowFeedback({ itemId: draggedItem, isCorrect })
    setTimeout(() => setShowFeedback(null), 1000)

    // Update item
    setItems(prev => prev.map(i => 
      i.id === draggedItem 
        ? { ...i, currentCategory: categoryId }
        : i
    ))

    setDraggedItem(null)
  }

  const handleGameEnd = async () => {
    if (gameCompleted) return
    setGameCompleted(true)
    
    const totalItems = items.length
    const isCorrect = correctSorts === totalItems
    
    // Calculate score
    const maxScore = 100
    const mistakePenalty = mistakes * 5
    const timePenalty = Math.max(0, (timeElapsed - 60) * 0.3)
    const score = Math.max(0, Math.round(maxScore - mistakePenalty - timePenalty))
    
    // Record the attempt
    try {
      await recordGameAttempt({
        userId,
        gameId: game.id,
        learningDayId,
        dayGameId,
        isCorrect: true, // Always mark as completed
        score,
        timeTakenSeconds: timeElapsed,
        mistakesCount: mistakes,
        gameData: {
          correctSorts,
          incorrectSorts: mistakes,
          metSuccessCriteria: isCorrect, // Store actual success for analytics
          sortedItems: items.map(item => ({
            item: item.value,
            category: item.currentCategory || 'unsorted'
          }))
        }
      })
      
      // Always mark as complete, score reflects performance
      onComplete(true, score)
    } catch (error) {
      console.error('Error recording game attempt:', error)
    }
  }

  const unsortedItems = items.filter(item => item.currentCategory === null)

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      <div className="w-full mb-6">
        <h2 className="text-2xl font-bold text-center mb-2">{game.name}</h2>
        <p className="text-gray-600 text-center mb-4">{game.description}</p>
        
        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-gray-600">Sorted</div>
            <div className="text-2xl font-bold">{correctSorts} / {items.length}</div>
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

      {/* Unsorted Items Area */}
      <div className="w-full mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">
          Drag items to the correct category
        </h3>
        <div className="min-h-[120px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {unsortedItems.map((item) => (
              <div
                key={item.id}
                draggable={!gameCompleted}
                onDragStart={(e) => handleDragStart(e, item.id)}
                className={`
                  px-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm
                  cursor-move hover:shadow-md transition-all
                  ${draggedItem === item.id ? 'opacity-50' : ''}
                  ${showFeedback?.itemId === item.id 
                    ? showFeedback.isCorrect 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-red-500 bg-red-50 animate-pulse'
                    : ''
                  }
                `}
              >
                <div className="text-center">
                  {item.type === 'image' && item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.value}
                      className="w-16 h-16 object-cover rounded-lg mx-auto mb-1"
                    />
                  ) : (
                    item.emoji && <div className="text-3xl mb-1">{item.emoji}</div>
                  )}
                  <div className="text-sm font-medium text-gray-700">{item.value}</div>
                </div>
              </div>
            ))}
            {unsortedItems.length === 0 && (
              <div className="text-gray-400 text-sm py-6">
                {gameCompleted ? 'All items sorted!' : 'Drag items here'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => {
          const categoryItems = items.filter(item => item.currentCategory === category.id)
          const allCorrect = categoryItems.every(item => item.correctCategory === category.id)
          
          return (
            <div
              key={category.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, category.id)}
              className={`
                min-h-[200px] rounded-lg p-4 border-2 transition-all
                ${draggedItem ? 'border-dashed border-blue-400 bg-blue-50' : 'border-solid'}
              `}
              style={{ 
                borderColor: draggedItem ? undefined : category.color,
                backgroundColor: draggedItem ? undefined : `${category.color}15`
              }}
            >
              <div className="text-center mb-3 pb-2 border-b-2" style={{ borderColor: category.color }}>
                {category.type === 'image' && category.imageUrl ? (
                  <img 
                    src={category.imageUrl} 
                    alt={category.name}
                    className="w-16 h-16 object-cover rounded-lg mx-auto mb-1"
                  />
                ) : (
                  category.emoji && <div className="text-3xl mb-1">{category.emoji}</div>
                )}
                <div className="font-bold text-gray-800">{category.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {categoryItems.length} item{categoryItems.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="space-y-2">
                {categoryItems.map((item) => {
                  const isCorrect = item.correctCategory === category.id
                  
                  return (
                    <div
                      key={item.id}
                      className={`
                        px-3 py-2 rounded-md text-sm font-medium text-center transition-all
                        ${isCorrect 
                          ? 'bg-green-100 border border-green-400 text-green-800' 
                          : 'bg-red-100 border border-red-400 text-red-800'
                        }
                      `}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {item.type === 'image' && item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.value}
                            className="w-8 h-8 object-cover rounded"
                          />
                        ) : (
                          item.emoji && <span>{item.emoji}</span>
                        )}
                        <span>{item.value}</span>
                        {gameCompleted && (
                          <span>{isCorrect ? '✓' : '✗'}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {gameCompleted && (
        <div className="mt-6 text-center">
          {correctSorts === items.length ? (
            <div className="text-green-600">
              <div className="text-3xl mb-2">🎉</div>
              <div className="text-xl font-bold">Perfect Sorting!</div>
              <div className="text-gray-600">
                You sorted all items correctly in {timeElapsed}s with {mistakes} mistake{mistakes !== 1 ? 's' : ''}!
              </div>
            </div>
          ) : (
            <div className="text-orange-600">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-xl font-bold">Game Complete!</div>
              <div className="text-gray-600">
                You sorted {correctSorts} out of {items.length} items correctly.
              </div>
            </div>
          )}
        </div>
      )}

      {!gameStarted && unsortedItems.length > 0 && (
        <div className="text-center text-gray-500 mt-4">
          Drag any item to start!
        </div>
      )}
    </div>
  )
}

// Helper functions
interface GeneratedSortingData {
  generatedCategories: Category[]
  generatedItems: SortingItem[]
}

function generateSortingData(
  categoryType: string,
  itemCount: number,
  customCategories: any[],
  customItems: any[]
): GeneratedSortingData {
  // If custom data is provided, use it
  if (categoryType === 'custom' && customCategories.length > 0 && customItems.length > 0) {
    const generatedCategories = customCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      emoji: cat.emoji,
      color: cat.color,
      imageUrl: cat.imageUrl,
      type: cat.type || 'emoji'
    }))

    const generatedItems = customItems.slice(0, itemCount).map((item, index) => ({
      id: `item-${index}`,
      value: item.value,
      emoji: item.emoji,
      correctCategory: item.category,
      currentCategory: null,
      imageUrl: item.imageUrl,
      type: item.type || 'emoji'
    }))

    return { generatedCategories, generatedItems }
  }

  // Default categories
  const categoryConfigs: Record<string, {
    categories: Array<{ name: string; emoji: string; color: string }>
    items: Array<{ value: string; emoji: string; category: number }>
  }> = {
    colors: {
      categories: [
        { name: 'Red', emoji: '🔴', color: '#ef4444' },
        { name: 'Blue', emoji: '🔵', color: '#3b82f6' },
        { name: 'Yellow', emoji: '🟡', color: '#eab308' },
        { name: 'Green', emoji: '🟢', color: '#22c55e' }
      ],
      items: [
        { value: 'Apple', emoji: '🍎', category: 0 },
        { value: 'Rose', emoji: '🌹', category: 0 },
        { value: 'Heart', emoji: '❤️', category: 0 },
        { value: 'Sky', emoji: '☁️', category: 1 },
        { value: 'Ocean', emoji: '🌊', category: 1 },
        { value: 'Jeans', emoji: '👖', category: 1 },
        { value: 'Sun', emoji: '☀️', category: 2 },
        { value: 'Banana', emoji: '🍌', category: 2 },
        { value: 'Star', emoji: '⭐', category: 2 },
        { value: 'Grass', emoji: '🌱', category: 3 },
        { value: 'Tree', emoji: '🌳', category: 3 },
        { value: 'Frog', emoji: '🐸', category: 3 }
      ]
    },
    animals: {
      categories: [
        { name: 'Farm', emoji: '🚜', color: '#f59e0b' },
        { name: 'Wild', emoji: '🌿', color: '#10b981' },
        { name: 'Pets', emoji: '🏠', color: '#8b5cf6' },
        { name: 'Sea', emoji: '🌊', color: '#06b6d4' }
      ],
      items: [
        { value: 'Cow', emoji: '🐄', category: 0 },
        { value: 'Pig', emoji: '🐷', category: 0 },
        { value: 'Chicken', emoji: '🐔', category: 0 },
        { value: 'Lion', emoji: '🦁', category: 1 },
        { value: 'Elephant', emoji: '🐘', category: 1 },
        { value: 'Monkey', emoji: '🐵', category: 1 },
        { value: 'Dog', emoji: '🐕', category: 2 },
        { value: 'Cat', emoji: '🐈', category: 2 },
        { value: 'Rabbit', emoji: '🐰', category: 2 },
        { value: 'Fish', emoji: '🐠', category: 3 },
        { value: 'Whale', emoji: '🐋', category: 3 },
        { value: 'Dolphin', emoji: '🐬', category: 3 }
      ]
    },
    shapes: {
      categories: [
        { name: '3 Sides', emoji: '3️⃣', color: '#ec4899' },
        { name: '4 Sides', emoji: '4️⃣', color: '#8b5cf6' },
        { name: 'Circles', emoji: '⭕', color: '#06b6d4' },
        { name: 'Stars', emoji: '⭐', color: '#f59e0b' }
      ],
      items: [
        { value: 'Triangle', emoji: '🔺', category: 0 },
        { value: 'Pyramid', emoji: '🔻', category: 0 },
        { value: 'Square', emoji: '⬜', category: 1 },
        { value: 'Rectangle', emoji: '▭', category: 1 },
        { value: 'Diamond', emoji: '💠', category: 1 },
        { value: 'Circle', emoji: '⭕', category: 2 },
        { value: 'Ball', emoji: '⚽', category: 2 },
        { value: 'Ring', emoji: '⭕', category: 2 },
        { value: 'Star', emoji: '⭐', category: 3 },
        { value: 'Sparkle', emoji: '✨', category: 3 }
      ]
    },
    sizes: {
      categories: [
        { name: 'Tiny', emoji: '🔬', color: '#06b6d4' },
        { name: 'Small', emoji: '🐁', color: '#10b981' },
        { name: 'Big', emoji: '🏠', color: '#f59e0b' },
        { name: 'Huge', emoji: '🏔️', color: '#8b5cf6' }
      ],
      items: [
        { value: 'Ant', emoji: '🐜', category: 0 },
        { value: 'Ladybug', emoji: '🐞', category: 0 },
        { value: 'Mouse', emoji: '🐁', category: 1 },
        { value: 'Cat', emoji: '🐈', category: 1 },
        { value: 'Car', emoji: '🚗', category: 2 },
        { value: 'House', emoji: '🏠', category: 2 },
        { value: 'Tree', emoji: '🌳', category: 2 },
        { value: 'Mountain', emoji: '⛰️', category: 3 },
        { value: 'Whale', emoji: '🐋', category: 3 },
        { value: 'Building', emoji: '🏢', category: 3 }
      ]
    }
  }

  const config = categoryConfigs[categoryType] || categoryConfigs.colors
  
  const generatedCategories = config.categories.map((cat, index) => ({
    id: `category-${index}`,
    name: cat.name,
    emoji: cat.emoji,
    color: cat.color
  }))

  const selectedItems = config.items.slice(0, itemCount)
  const generatedItems = selectedItems.map((item, index) => ({
    id: `item-${index}`,
    value: item.value,
    emoji: item.emoji,
    correctCategory: `category-${item.category}`,
    currentCategory: null
  }))

  return { generatedCategories, generatedItems }
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}


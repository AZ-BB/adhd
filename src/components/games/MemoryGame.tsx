'use client'

import { useState, useEffect } from 'react'
import { Game, GameConfig, MemoryGameState } from '@/types/learning-path'
import { recordGameAttempt } from '@/actions/learning-path'

interface MemoryGameProps {
  game: Game
  userId: number
  learningDayId: number
  dayGameId: number
  onComplete: (isCorrect: boolean, score: number) => void
}

interface Card {
  id: number
  value: string
  isFlipped: boolean
  isMatched: boolean
  imageUrl?: string
  type?: 'emoji' | 'image'
  label?: string
}

export default function MemoryGame({ game, userId, learningDayId, dayGameId, onComplete }: MemoryGameProps) {
  const config = game.config as GameConfig
  const pairs = config.pairs || 4
  const timeLimit = config.timeLimit || 60
  const theme = config.theme || 'animals'
  const customCards = (config as any).customCards || []
  
  const [cards, setCards] = useState<Card[]>([])
  const [firstCard, setFirstCard] = useState<number | null>(null)
  const [secondCard, setSecondCard] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const [matchedPairs, setMatchedPairs] = useState<number[]>([])
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize cards - only run once on mount
  useEffect(() => {
    const cardItems = generateCardItems(pairs, theme, customCards)
    const shuffledCards = shuffleArray([...cardItems, ...cardItems])
    
    setCards(shuffledCards.map((item, index) => ({
      id: index,
      value: item.value,
      isFlipped: false,
      isMatched: false,
      imageUrl: item.imageUrl,
      type: item.type,
      label: item.label
    })))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Timer
  useEffect(() => {
    if (!gameStarted || gameCompleted) return
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => {
        if (prev >= timeLimit) {
          handleGameEnd(false)
          return prev
        }
        return prev + 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [gameStarted, gameCompleted, timeLimit])

  // Check for matches
  useEffect(() => {
    if (firstCard === null || secondCard === null || isProcessing) return
    
    setIsProcessing(true)
    const firstCardObj = cards[firstCard]
    const secondCardObj = cards[secondCard]
    
    if (firstCardObj.value === secondCardObj.value) {
      // Match found
      setMatchedPairs(prev => [...prev, firstCard, secondCard])
      setCards(prev => prev.map(card => {
        if (card.id === firstCard || card.id === secondCard) {
          return { ...card, isMatched: true }
        }
        return card
      }))
      resetSelection()
    } else {
      // No match
      setTimeout(() => {
        setCards(prev => prev.map(card => {
          if (card.id === firstCard || card.id === secondCard) {
            return { ...card, isFlipped: false }
          }
          return card
        }))
        resetSelection()
      }, 1000)
    }
  }, [firstCard, secondCard, cards])

  // Check for game completion
  useEffect(() => {
    if (matchedPairs.length === pairs * 2 && matchedPairs.length > 0) {
      handleGameEnd(true)
    }
  }, [matchedPairs, pairs])

  const resetSelection = () => {
    setFirstCard(null)
    setSecondCard(null)
    setIsProcessing(false)
  }

  const handleCardClick = (cardId: number) => {
    if (!gameStarted) setGameStarted(true)
    if (isProcessing || gameCompleted) return
    
    const card = cards[cardId]
    if (card.isFlipped || card.isMatched) return
    
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ))
    
    if (firstCard === null) {
      setFirstCard(cardId)
    } else if (secondCard === null && cardId !== firstCard) {
      setSecondCard(cardId)
      setMoves(prev => prev + 1)
    }
  }

  const handleGameEnd = async (isCorrect: boolean) => {
    if (gameCompleted) return
    setGameCompleted(true)
    
    // Calculate score based on moves and time
    const maxScore = 100
    const movePenalty = Math.max(0, (moves - pairs) * 2)
    const timePenalty = Math.max(0, (timeElapsed - 30) * 0.5)
    const score = Math.max(0, Math.round(maxScore - movePenalty - timePenalty))
    
    // Record the attempt
    try {
      await recordGameAttempt({
        userId,
        gameId: game.id,
        learningDayId,
        dayGameId,
        isCorrect,
        score: isCorrect ? score : 0,
        timeTakenSeconds: timeElapsed,
        mistakesCount: Math.max(0, moves - pairs),
        gameData: {
          moves,
          matchedPairs
        }
      })
      
      onComplete(isCorrect, isCorrect ? score : 0)
    } catch (error) {
      console.error('Error recording game attempt:', error)
    }
  }

  const renderCardContent = (card: Card): string => {
    // For emoji or text - return the emoji/text string
    const emojiMap: Record<string, string> = {
      // Animals
      'dog': '🐕',
      'cat': '🐈',
      'rabbit': '🐰',
      'bear': '🐻',
      'lion': '🦁',
      'tiger': '🐯',
      'elephant': '🐘',
      'monkey': '🐵',
      // Shapes
      'circle': '⭕',
      'square': '⬜',
      'triangle': '🔺',
      'star': '⭐',
      'heart': '❤️',
      'diamond': '💎',
      'pentagon': '⬟',
      'hexagon': '⬢',
      // Colors
      'red': '🔴',
      'blue': '🔵',
      'green': '🟢',
      'yellow': '🟡',
      'purple': '🟣',
      'orange': '🟠',
      'pink': '🌸',
      'brown': '🟤'
    }
    
    return emojiMap[card.value] || card.value || '❓'
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="w-full mb-6">
        <h2 className="text-2xl font-bold text-center mb-2">{game.name}</h2>
        <p className="text-gray-600 text-center mb-4">{game.description}</p>
        
        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-gray-600">Moves</div>
            <div className="text-2xl font-bold">{moves}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Matches</div>
            <div className="text-2xl font-bold">{matchedPairs.length / 2} / {pairs}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Time</div>
            <div className="text-2xl font-bold">
              {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      <div 
        className="grid gap-4 mb-6"
        style={{
          gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(pairs * 2))}, minmax(0, 1fr))`
        }}
      >
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.isFlipped || card.isMatched || isProcessing || gameCompleted}
            className={`
              aspect-square w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden
              transition-all duration-300 transform flex items-center justify-center
              ${card.isFlipped || card.isMatched
                ? 'bg-blue-500 text-white scale-105'
                : 'bg-gray-300 hover:bg-gray-400 hover:scale-105'
              }
              ${card.isMatched ? 'opacity-50' : ''}
              disabled:cursor-not-allowed
              ${!(card.isFlipped || card.isMatched) ? 'text-4xl' : ''}
            `}
          >
            {(card.isFlipped || card.isMatched) ? (
              card.type === 'image' && card.imageUrl ? (
                <img 
                  src={card.imageUrl} 
                  alt={card.label || card.value}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl">{renderCardContent(card)}</span>
              )
            ) : (
              <span className="text-4xl">?</span>
            )}
          </button>
        ))}
      </div>

      {gameCompleted && (
        <div className="text-center">
          {matchedPairs.length === pairs * 2 ? (
            <div className="text-green-600">
              <div className="text-3xl mb-2">🎉</div>
              <div className="text-xl font-bold">Congratulations!</div>
              <div className="text-gray-600">You completed the game in {moves} moves!</div>
            </div>
          ) : (
            <div className="text-red-600">
              <div className="text-3xl mb-2">⏱️</div>
              <div className="text-xl font-bold">Time's Up!</div>
              <div className="text-gray-600">Try again to improve your time!</div>
            </div>
          )}
        </div>
      )}

      {!gameStarted && (
        <div className="text-center text-gray-500">
          Click any card to start!
        </div>
      )}
    </div>
  )
}

// Helper functions
interface CardItem {
  value: string
  imageUrl?: string
  type?: 'emoji' | 'image'
  label?: string
}

function generateCardItems(
  pairs: number, 
  theme: string,
  customCards: any[]
): CardItem[] {
  // If custom cards are provided, use them
  if (theme === 'custom' && customCards.length > 0) {
    return customCards.slice(0, pairs).map(card => ({
      value: card.value,
      imageUrl: card.imageUrl,
      type: card.type || 'emoji',
      label: card.label
    }))
  }

  // Default themes
  const themes: Record<string, string[]> = {
    animals: ['dog', 'cat', 'rabbit', 'bear', 'lion', 'tiger', 'elephant', 'monkey'],
    shapes: ['circle', 'square', 'triangle', 'star', 'heart', 'diamond', 'pentagon', 'hexagon'],
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown']
  }
  
  const values = themes[theme] || themes.animals
  return values.slice(0, pairs).map(value => ({
    value,
    type: 'emoji' as const
  }))
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}


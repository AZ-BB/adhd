'use client'

import { useState, useEffect } from 'react'
import { Game, GameConfig } from '@/types/learning-path'
import { recordGameAttempt } from '@/actions/learning-path'

interface NumberSequenceGameProps {
  game: Game
  userId: number
  learningDayId: number
  dayGameId: number
  onComplete: (isCorrect: boolean, score: number) => void
}

interface SequencePattern {
  sequence: number[]
  correctAnswer: number
  options: number[]
  pattern: string
}

export default function NumberSequenceGame({ 
  game, 
  userId, 
  learningDayId, 
  dayGameId, 
  onComplete 
}: NumberSequenceGameProps) {
  const config = game.config as GameConfig
  const difficulty = config.difficulty || 'easy'
  const sequenceLength = config.sequenceLength || 4
  
  const [currentPattern, setCurrentPattern] = useState<SequencePattern | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [round, setRound] = useState(1)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [roundsCorrect, setRoundsCorrect] = useState(0)
  const totalRounds = 5

  // Initialize pattern
  useEffect(() => {
    if (!currentPattern) {
      generateNewPattern()
    }
  }, [])

  // Timer
  useEffect(() => {
    if (!gameStarted || gameCompleted) return
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)
    
    return () => clearInterval(timer)
  }, [gameStarted, gameCompleted])

  const generateNewPattern = () => {
    let pattern: SequencePattern

    switch (difficulty) {
      case 'easy':
        pattern = generateEasyPattern(sequenceLength)
        break
      case 'medium':
        pattern = generateMediumPattern(sequenceLength)
        break
      case 'hard':
        pattern = generateHardPattern(sequenceLength)
        break
      default:
        pattern = generateEasyPattern(sequenceLength)
    }

    setCurrentPattern(pattern)
    setSelectedAnswer(null)
    setShowFeedback(false)
  }

  const generateEasyPattern = (length: number): SequencePattern => {
    // Simple addition patterns (e.g., +2, +3, +5)
    const start = Math.floor(Math.random() * 20) + 1
    const step = [2, 3, 5][Math.floor(Math.random() * 3)]
    const sequence = Array.from({ length }, (_, i) => start + (i * step))
    const correctAnswer = start + (length * step)
    
    // Generate wrong options
    const options = generateOptions(correctAnswer, step)
    
    return {
      sequence,
      correctAnswer,
      options: shuffleArray(options),
      pattern: `Adding ${step}`
    }
  }

  const generateMediumPattern = (length: number): SequencePattern => {
    const patternType = Math.floor(Math.random() * 3)
    
    if (patternType === 0) {
      // Multiplication pattern (e.g., ×2)
      const start = Math.floor(Math.random() * 5) + 2
      const multiplier = 2
      const sequence = Array.from({ length }, (_, i) => start * Math.pow(multiplier, i))
      const correctAnswer = start * Math.pow(multiplier, length)
      const options = generateOptions(correctAnswer, correctAnswer * 0.2)
      
      return {
        sequence,
        correctAnswer,
        options: shuffleArray(options),
        pattern: `Multiplying by ${multiplier}`
      }
    } else if (patternType === 1) {
      // Skip counting (e.g., +10, +15)
      const start = Math.floor(Math.random() * 20) + 5
      const step = [10, 15, 20][Math.floor(Math.random() * 3)]
      const sequence = Array.from({ length }, (_, i) => start + (i * step))
      const correctAnswer = start + (length * step)
      const options = generateOptions(correctAnswer, step)
      
      return {
        sequence,
        correctAnswer,
        options: shuffleArray(options),
        pattern: `Adding ${step}`
      }
    } else {
      // Subtraction pattern
      const start = Math.floor(Math.random() * 50) + 50
      const step = [3, 4, 5][Math.floor(Math.random() * 3)]
      const sequence = Array.from({ length }, (_, i) => start - (i * step))
      const correctAnswer = start - (length * step)
      const options = generateOptions(correctAnswer, step)
      
      return {
        sequence,
        correctAnswer,
        options: shuffleArray(options),
        pattern: `Subtracting ${step}`
      }
    }
  }

  const generateHardPattern = (length: number): SequencePattern => {
    const patternType = Math.floor(Math.random() * 2)
    
    if (patternType === 0) {
      // Fibonacci-like pattern
      const a = Math.floor(Math.random() * 5) + 1
      const b = Math.floor(Math.random() * 5) + a
      const sequence = [a, b]
      
      for (let i = 2; i < length; i++) {
        sequence.push(sequence[i - 1] + sequence[i - 2])
      }
      
      const correctAnswer = sequence[length - 1] + sequence[length - 2]
      const options = generateOptions(correctAnswer, Math.floor(correctAnswer * 0.3))
      
      return {
        sequence,
        correctAnswer,
        options: shuffleArray(options),
        pattern: 'Fibonacci-like (add previous two)'
      }
    } else {
      // Alternating pattern (e.g., +5, -2, +5, -2)
      const start = Math.floor(Math.random() * 20) + 10
      const add = [5, 8, 10][Math.floor(Math.random() * 3)]
      const subtract = [2, 3, 4][Math.floor(Math.random() * 3)]
      const sequence = [start]
      
      for (let i = 1; i < length; i++) {
        if (i % 2 === 1) {
          sequence.push(sequence[i - 1] + add)
        } else {
          sequence.push(sequence[i - 1] - subtract)
        }
      }
      
      const correctAnswer = length % 2 === 1 
        ? sequence[length - 1] + add 
        : sequence[length - 1] - subtract
      const options = generateOptions(correctAnswer, Math.max(add, subtract))
      
      return {
        sequence,
        correctAnswer,
        options: shuffleArray(options),
        pattern: `Alternating +${add}, -${subtract}`
      }
    }
  }

  const generateOptions = (correct: number, variance: number): number[] => {
    const options = [correct]
    const varianceAmount = Math.max(1, Math.floor(variance))
    
    while (options.length < 4) {
      const offset = (Math.floor(Math.random() * 4) + 1) * varianceAmount * (Math.random() > 0.5 ? 1 : -1)
      const option = correct + offset
      
      if (!options.includes(option) && option > 0) {
        options.push(option)
      }
    }
    
    return options
  }

  const handleAnswerSelect = (answer: number) => {
    if (!gameStarted) setGameStarted(true)
    if (showFeedback || gameCompleted) return
    
    setSelectedAnswer(answer)
    setShowFeedback(true)
    
    const isCorrect = answer === currentPattern?.correctAnswer
    
    if (isCorrect) {
      setRoundsCorrect(prev => prev + 1)
    } else {
      setMistakes(prev => prev + 1)
    }

    // Move to next round or complete game
    setTimeout(() => {
      if (round >= totalRounds) {
        handleGameEnd()
      } else {
        setRound(prev => prev + 1)
        generateNewPattern()
      }
    }, 2000)
  }

  const handleGameEnd = async () => {
    if (gameCompleted) return
    setGameCompleted(true)
    
    const isCorrect = roundsCorrect >= Math.ceil(totalRounds * 0.6) // 60% success rate
    const maxScore = 100
    const mistakePenalty = mistakes * 10
    const timePenalty = Math.max(0, (timeElapsed - 120) * 0.3)
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
        userSequence: [],
        correctSequence: []
      }
    })
    
    setTimeout(() => {
      onComplete(isCorrect, isCorrect ? score : 0)
    }, 2000)
  }

  if (!currentPattern) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (gameCompleted) {
    const isSuccess = roundsCorrect >= Math.ceil(totalRounds * 0.6)
    return (
      <div className="text-center py-12">
        <div className={`text-3xl mb-4 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
          {isSuccess ? '🎉' : '😔'}
        </div>
        <h3 className="text-2xl font-bold mb-2">
          {isSuccess ? 'Excellent Work!' : 'Keep Practicing!'}
        </h3>
        <p className="text-gray-600 mb-4">
          You got {roundsCorrect} out of {totalRounds} correct!
        </p>
        <div className="text-sm text-gray-500">
          Time: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-center mb-2">{game.name}</h2>
        <p className="text-gray-600 text-center mb-6">{game.description}</p>
        
        {/* Stats */}
        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg mb-6">
          <div className="text-center">
            <div className="text-sm text-gray-600">Round</div>
            <div className="text-2xl font-bold">{round} / {totalRounds}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Correct</div>
            <div className="text-2xl font-bold text-green-600">{roundsCorrect}</div>
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

        {/* Sequence Display */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-center text-gray-700">
            What comes next in this sequence?
          </h3>
          
          <div className="flex justify-center items-center gap-4 mb-6 flex-wrap">
            {currentPattern.sequence.map((num, index) => (
              <div
                key={index}
                className="w-16 h-16 bg-blue-500 text-white rounded-lg flex items-center justify-center text-2xl font-bold shadow-md"
              >
                {num}
              </div>
            ))}
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-3xl font-bold">
              ?
            </div>
          </div>

          {/* Hint */}
          <div className="text-center text-sm text-gray-500 mb-6">
            Pattern: {currentPattern.pattern}
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            {currentPattern.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showFeedback}
                className={`
                  p-6 rounded-lg text-2xl font-bold transition-all
                  ${!showFeedback
                    ? 'bg-gray-100 hover:bg-gray-200 hover:scale-105'
                    : option === currentPattern.correctAnswer
                    ? 'bg-green-500 text-white'
                    : option === selectedAnswer
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 opacity-50'
                  }
                  disabled:cursor-not-allowed
                `}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`mt-6 text-center p-4 rounded-lg ${
              selectedAnswer === currentPattern.correctAnswer
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {selectedAnswer === currentPattern.correctAnswer ? (
                <>
                  <div className="text-2xl mb-2">✓</div>
                  <div className="font-bold">Correct!</div>
                </>
              ) : (
                <>
                  <div className="text-2xl mb-2">✗</div>
                  <div className="font-bold">Incorrect</div>
                  <div className="text-sm mt-1">
                    The correct answer was {currentPattern.correctAnswer}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
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


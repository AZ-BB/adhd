'use client'

import { useState, useEffect } from 'react'
import { Game, GameConfig } from '@/types/learning-path'
import { recordGameAttempt } from '@/actions/learning-path'

interface AimingGameProps {
  game: Game
  userId: number
  learningDayId: number
  dayGameId: number
  onComplete: (isCorrect: boolean, score: number) => void
}

interface Circle {
  id: string
  type: 'green' | 'red'
  position: { x: number; y: number }
  size: number
  isClicked: boolean
  appearTime: number
}

export default function AimingGame({ 
  game, 
  userId, 
  learningDayId, 
  dayGameId, 
  onComplete 
}: AimingGameProps) {
  const config = game.config as GameConfig
  const duration = config.duration || 60
  const difficulty = config.difficulty || 'easy'
  const spawnRate = getSpawnRateByDifficulty(difficulty)
  
  const [circles, setCircles] = useState<Circle[]>([])
  const [greenClicked, setGreenClicked] = useState(0)
  const [redClicked, setRedClicked] = useState(0)
  const [missedGreen, setMissedGreen] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showInstruction, setShowInstruction] = useState(true)

  // Timer
  useEffect(() => {
    if (!gameStarted || gameCompleted) return
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => {
        if (prev >= duration) {
          handleGameEnd()
          return prev
        }
        return prev + 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [gameStarted, gameCompleted, duration])

  // Spawn circles
  useEffect(() => {
    if (!gameStarted || gameCompleted) return
    
    const spawnInterval = setInterval(() => {
      spawnNewCircle()
    }, spawnRate)
    
    return () => clearInterval(spawnInterval)
  }, [gameStarted, gameCompleted, spawnRate])

  // Remove old circles
  useEffect(() => {
    if (!gameStarted || gameCompleted) return
    
    const cleanupInterval = setInterval(() => {
      setCircles(prev => {
        const now = Date.now()
        const lifetime = getCircleLifetimeByDifficulty(difficulty)
        
        // Count missed green circles
        const expiredGreen = prev.filter(c => 
          c.type === 'green' && 
          !c.isClicked && 
          now - c.appearTime > lifetime
        ).length
        
        if (expiredGreen > 0) {
          setMissedGreen(m => m + expiredGreen)
        }
        
        return prev.filter(c => {
          const age = now - c.appearTime
          return age <= lifetime && !c.isClicked
        })
      })
    }, 100)
    
    return () => clearInterval(cleanupInterval)
  }, [gameStarted, gameCompleted, difficulty])

  function getSpawnRateByDifficulty(diff: string): number {
    const rates = {
      very_easy: 2000,
      easy: 1500,
      easy_medium: 1200,
      medium: 1000,
      medium_hard: 800,
      hard: 600,
      very_hard: 400
    }
    return rates[diff as keyof typeof rates] || 1500
  }

  function getCircleLifetimeByDifficulty(diff: string): number {
    const lifetimes = {
      very_easy: 4000,
      easy: 3500,
      easy_medium: 3000,
      medium: 2500,
      medium_hard: 2000,
      hard: 1500,
      very_hard: 1000
    }
    return lifetimes[diff as keyof typeof lifetimes] || 3500
  }

  function getCircleSizeByDifficulty(diff: string): number {
    const sizes = {
      very_easy: 80,
      easy: 70,
      easy_medium: 60,
      medium: 50,
      medium_hard: 45,
      hard: 40,
      very_hard: 35
    }
    return sizes[diff as keyof typeof sizes] || 70
  }

  function getGreenRedRatioByDifficulty(diff: string): number {
    // Returns probability of spawning green (0-1)
    const ratios = {
      very_easy: 0.8,    // 80% green
      easy: 0.7,         // 70% green
      easy_medium: 0.65, // 65% green
      medium: 0.6,       // 60% green
      medium_hard: 0.55, // 55% green
      hard: 0.5,         // 50% green
      very_hard: 0.45    // 45% green
    }
    return ratios[diff as keyof typeof ratios] || 0.7
  }

  const spawnNewCircle = () => {
    const greenRatio = getGreenRedRatioByDifficulty(difficulty)
    const type = Math.random() < greenRatio ? 'green' : 'red'
    const size = getCircleSizeByDifficulty(difficulty)
    
    const newCircle: Circle = {
      id: `circle-${Date.now()}-${Math.random()}`,
      type,
      position: {
        x: Math.random() * (100 - (size / 10)) + (size / 20),
        y: Math.random() * (100 - (size / 10)) + (size / 20)
      },
      size,
      isClicked: false,
      appearTime: Date.now()
    }
    
    setCircles(prev => [...prev, newCircle])
  }

  const handleCircleClick = (circleId: string) => {
    if (!gameStarted) {
      setGameStarted(true)
      setShowInstruction(false)
    }
    if (gameCompleted) return

    const circle = circles.find(c => c.id === circleId)
    if (!circle || circle.isClicked) return

    // Mark as clicked
    setCircles(prev => prev.map(c => 
      c.id === circleId ? { ...c, isClicked: true } : c
    ))

    if (circle.type === 'green') {
      setGreenClicked(prev => prev + 1)
    } else {
      setRedClicked(prev => prev + 1)
    }
  }

  const handleGameEnd = async () => {
    if (gameCompleted) return
    setGameCompleted(true)

    const totalClicks = greenClicked + redClicked
    const accuracy = totalClicks > 0 ? (greenClicked / totalClicks) * 100 : 0
    
    // Calculate score
    const maxScore = 100
    const redPenalty = redClicked * 5
    const missedPenalty = missedGreen * 3
    const accuracyBonus = accuracy > 90 ? 10 : accuracy > 80 ? 5 : 0
    const score = Math.max(0, Math.round(maxScore - redPenalty - missedPenalty + accuracyBonus))
    
    // Game is considered correct if accuracy is >= 70% and score > 50
    const isCorrect = accuracy >= 70 && score > 50

    await recordGameAttempt({
      userId,
      gameId: game.id,
      learningDayId,
      dayGameId,
      isCorrect: true, // Always mark as completed
      score,
      timeTakenSeconds: timeElapsed,
      mistakesCount: redClicked + missedGreen,
      gameData: {
        clickAccuracy: accuracy,
        foundItems: [`${greenClicked} green circles`],
        missedItems: [`${missedGreen} missed`, `${redClicked} red clicked`],
        metSuccessCriteria: isCorrect, // Store actual success for analytics
        greenClicked,
        redClicked,
        missedGreen
      }
    })

    setTimeout(() => {
      // Always mark as complete, score reflects performance
      onComplete(true, score)
    }, 2000)
  }

  const getCircleOpacity = (circle: Circle): number => {
    const now = Date.now()
    const age = now - circle.appearTime
    const lifetime = getCircleLifetimeByDifficulty(difficulty)
    const fadeStart = lifetime * 0.6 // Start fading at 60% of lifetime
    
    if (age < fadeStart) return 1
    return 1 - ((age - fadeStart) / (lifetime - fadeStart)) * 0.5
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <h2 className="text-2xl font-bold text-center mb-2">{game.name}</h2>
        <p className="text-gray-600 text-center mb-6">{game.description}</p>

        {/* Stats */}
        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg mb-6">
          <div className="text-center">
            <div className="text-sm text-gray-600">Green Clicked</div>
            <div className="text-2xl font-bold text-green-600">✓ {greenClicked}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Red Clicked</div>
            <div className="text-2xl font-bold text-red-500">✗ {redClicked}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Missed Green</div>
            <div className="text-2xl font-bold text-orange-500">{missedGreen}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Time Left</div>
            <div className="text-2xl font-bold">
              {Math.floor((duration - timeElapsed) / 60)}:{((duration - timeElapsed) % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Instruction */}
        {showInstruction && (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6 text-center">
            <p className="text-blue-800 font-medium">
              Click on the <span className="text-green-600 font-bold">GREEN</span> circles quickly!<br />
              Avoid clicking the <span className="text-red-600 font-bold">RED</span> circles!
            </p>
          </div>
        )}

        {/* Game Area */}
        <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-lg shadow-lg overflow-hidden" style={{ height: '500px' }}>
          {!gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5">
              <button
                onClick={() => {
                  setGameStarted(true)
                  setShowInstruction(false)
                }}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-xl font-bold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Start Game
              </button>
            </div>
          )}
          
          {circles.map((circle) => (
            <button
              key={circle.id}
              onClick={() => handleCircleClick(circle.id)}
              disabled={circle.isClicked || gameCompleted}
              className={`
                absolute rounded-full transition-all duration-200
                ${circle.isClicked 
                  ? 'scale-0 opacity-0' 
                  : 'hover:scale-110 cursor-pointer animate-pulse'
                }
                ${circle.type === 'green' 
                  ? 'bg-green-500 shadow-green-300' 
                  : 'bg-red-500 shadow-red-300'
                }
                shadow-lg
              `}
              style={{
                left: `${circle.position.x}%`,
                top: `${circle.position.y}%`,
                width: `${circle.size}px`,
                height: `${circle.size}px`,
                transform: 'translate(-50%, -50%)',
                opacity: circle.isClicked ? 0 : getCircleOpacity(circle)
              }}
              aria-label={`${circle.type} circle`}
            />
          ))}
        </div>

        {/* Completion Message */}
        {gameCompleted && (
          <div className={`mt-6 text-center p-6 rounded-lg ${
            (greenClicked / (greenClicked + redClicked)) >= 0.7
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {(greenClicked / (greenClicked + redClicked)) >= 0.7 ? (
              <>
                <div className="text-4xl mb-2">🎯</div>
                <h3 className="text-2xl font-bold mb-2">Great Aim!</h3>
                <p>You clicked {greenClicked} green circles!</p>
                <p className="text-sm mt-2">
                  Accuracy: {((greenClicked / (greenClicked + redClicked)) * 100).toFixed(0)}%
                </p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">⏱️</div>
                <h3 className="text-2xl font-bold mb-2">Time's Up!</h3>
                <p>Keep practicing to improve your aim!</p>
                <p className="text-sm mt-2">
                  Green: {greenClicked} | Red: {redClicked} | Missed: {missedGreen}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


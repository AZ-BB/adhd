'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DayProgressResponse } from '@/types/learning-path'
import MemoryGame from '@/components/games/MemoryGame'
import MatchingGame from '@/components/games/MatchingGame'
import NumberSequenceGame from '@/components/games/NumberSequenceGame'
import SpotTheItemGame from '@/components/games/SpotTheItemGame'
import SortingGame from '@/components/games/SortingGame'
import AimingGame from '@/components/games/AimingGame'

interface LearningDayClientProps {
  dayDetails: DayProgressResponse
  userId: number
}

export default function LearningDayClientAr({ dayDetails, userId }: LearningDayClientProps) {
  const router = useRouter()
  const [currentGameIndex, setCurrentGameIndex] = useState(0)
  const [completedGames, setCompletedGames] = useState<Set<number>>(new Set())
  const [showCelebration, setShowCelebration] = useState(false)

  const { day, progress, games } = dayDetails
  const currentGame = games[currentGameIndex]
  const totalGames = games.length
  const isLastGame = currentGameIndex === totalGames - 1

  // Initialize completed games from progress
  useEffect(() => {
    const completed = new Set<number>()
    games.forEach((game, index) => {
      if (game.isCompleted) {
        completed.add(index)
      }
    })
    setCompletedGames(completed)
    
    // Find first incomplete game
    const firstIncomplete = games.findIndex(g => !g.isCompleted)
    if (firstIncomplete !== -1) {
      setCurrentGameIndex(firstIncomplete)
    }
  }, [games])

  const handleGameComplete = (isCorrect: boolean, score: number) => {
    if (!isCorrect) {
      // Show try again message
      alert('حاول مرة أخرى! يمكنك فعلها!')
      return
    }

    // Mark game as completed
    const newCompleted = new Set(completedGames)
    newCompleted.add(currentGameIndex)
    setCompletedGames(newCompleted)

    // Check if all games are completed
    if (newCompleted.size >= totalGames) {
      setShowCelebration(true)
      setTimeout(() => {
        router.push('/learning-path')
        router.refresh()
      }, 3000)
    } else if (!isLastGame) {
      // Move to next game after a short delay
      setTimeout(() => {
        setCurrentGameIndex(prev => prev + 1)
      }, 1500)
    }
  }

  const handleGameSelect = (index: number) => {
    if (completedGames.has(index)) {
      // Allow revisiting completed games
      setCurrentGameIndex(index)
    }
  }

  const handleNextGame = () => {
    if (currentGameIndex < totalGames - 1) {
      setCurrentGameIndex(prev => prev + 1)
    }
  }

  const handlePreviousGame = () => {
    if (currentGameIndex > 0) {
      setCurrentGameIndex(prev => prev - 1)
    }
  }

  if (showCelebration) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🎉</div>
          <h1 className="text-4xl font-bold mb-4 text-purple-600">
            مبروك!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            لقد أكملت اليوم {day.day_number}!
          </p>
          <p className="text-lg text-gray-500">
            {day.title_ar || day.title}
          </p>
          <div className="mt-8 text-gray-400">
            جاري التحويل إلى مسار التعلم...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              اليوم {day.day_number}: {day.title_ar || day.title}
            </h1>
            <p className="text-gray-600 mt-2">{day.description_ar || day.description}</p>
          </div>
          <button
            onClick={() => router.push('/learning-path')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
          >
            → العودة إلى المسار
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              التقدم: {completedGames.size}/{totalGames} ألعاب مكتملة
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((completedGames.size / totalGames) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(completedGames.size / totalGames) * 100}%` }}
            />
          </div>
        </div>

        {/* Game Navigation */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {games.map((game, index) => (
            <button
              key={game.game.id}
              onClick={() => handleGameSelect(index)}
              disabled={!completedGames.has(index) && index !== currentGameIndex}
              className={`
                flex-shrink-0 px-4 py-2 rounded-lg font-medium transition
                ${index === currentGameIndex
                  ? 'bg-blue-500 text-white'
                  : completedGames.has(index)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }
                ${completedGames.has(index) && index !== currentGameIndex
                  ? 'hover:bg-green-600 cursor-pointer'
                  : ''
                }
              `}
            >
              <div className="text-xs">اللعبة {index + 1}</div>
              <div className="text-sm">{game.game.name_ar || game.game.name}</div>
              {completedGames.has(index) && <div className="text-xs">✓</div>}
            </button>
          ))}
        </div>
      </div>

      {/* Current Game */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            اللعبة {currentGameIndex + 1} من {totalGames}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousGame}
              disabled={currentGameIndex === 0}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
            >
              → السابق
            </button>
            <button
              onClick={handleNextGame}
              disabled={currentGameIndex === totalGames - 1}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
            >
              ← التالي
            </button>
          </div>
        </div>

        {/* Game Component */}
        {currentGame?.game?.type === 'memory' && (
          <MemoryGame
            key={currentGame.dayGame.id}
            game={currentGame.game}
            userId={userId}
            learningDayId={day.id}
            dayGameId={currentGame.dayGame.id}
            onComplete={handleGameComplete}
          />
        )}
        
        {currentGame?.game?.type === 'matching' && (
          <MatchingGame
            key={currentGame.dayGame.id}
            game={currentGame.game}
            userId={userId}
            learningDayId={day.id}
            dayGameId={currentGame.dayGame.id}
            onComplete={handleGameComplete}
          />
        )}
        
        {currentGame?.game?.type === 'sequence' && (
          <NumberSequenceGame
            key={currentGame.dayGame.id}
            game={currentGame.game}
            userId={userId}
            learningDayId={day.id}
            dayGameId={currentGame.dayGame.id}
            onComplete={handleGameComplete}
          />
        )}
        
        {currentGame?.game?.type === 'attention' && (
          <SpotTheItemGame
            key={currentGame.dayGame.id}
            game={currentGame.game}
            userId={userId}
            learningDayId={day.id}
            dayGameId={currentGame.dayGame.id}
            onComplete={handleGameComplete}
          />
        )}
        
        {currentGame?.game?.type === 'sorting' && (
          <SortingGame
            key={currentGame.dayGame.id}
            game={currentGame.game}
            userId={userId}
            learningDayId={day.id}
            dayGameId={currentGame.dayGame.id}
            onComplete={handleGameComplete}
          />
        )}
        
        {currentGame?.game?.type === 'aiming' && (
          <AimingGame
            key={currentGame.dayGame.id}
            game={currentGame.game}
            userId={userId}
            learningDayId={day.id}
            dayGameId={currentGame.dayGame.id}
            onComplete={handleGameComplete}
          />
        )}
        
        {/* Placeholder for other game types */}
        {!['memory', 'matching', 'sequence', 'attention', 'sorting', 'aiming'].includes(currentGame?.game?.type || '') && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {currentGame?.game?.name_ar || currentGame?.game?.name || ''} - {currentGame?.game?.type || ''}
            </p>
            <p className="text-sm text-gray-400">
              مكون اللعبة غير متاح حتى الآن
            </p>
            <button
              onClick={() => handleGameComplete(true, 100)}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              وضع علامة مكتمل (تجريبي)
            </button>
          </div>
        )}
      </div>

      {/* Game Attempts History */}
      {currentGame?.attempts?.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">المحاولات السابقة</h3>
          <div className="space-y-2">
            {currentGame?.attempts?.map((attempt) => (
              <div
                key={attempt.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  attempt.is_correct ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div>
                  <span className="font-medium">
                    المحاولة #{attempt.attempt_number}
                  </span>
                  {attempt.is_correct && (
                    <span className="mr-2 text-green-600">✓ صحيح</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  النقاط: {attempt.score} | الوقت: {attempt.time_taken_seconds}ث
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


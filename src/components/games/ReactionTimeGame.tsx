'use client'

import { useState, useEffect, useRef } from 'react'
import { recordGameAttempt } from '@/actions/learning-path'

interface ReactionTimeGameProps {
  game: {
    id: string
    name: string
    name_ar: string
    description?: string
    description_ar?: string
    type: string
    config: Record<string, any>
  }
  userId: string
  learningDayId: string
  dayGameId: string
  onComplete: (success: boolean, score: number) => void
  language?: 'en' | 'ar'
}

interface Round {
  roundNumber: number
  reactionTime: number | null
  falseStart: boolean
}

type GameState = 'instructions' | 'ready' | 'waiting' | 'react' | 'result' | 'complete'

export default function ReactionTimeGame({ game, userId, learningDayId, dayGameId, onComplete, language = 'en' }: ReactionTimeGameProps) {
  const config = game.config || {}
  const difficulty = config.difficulty || 'easy'
  const stimulusType = config.stimulusType || 'color'
  const rounds = config.rounds || 5
  const minDelay = config.minDelay || 1000
  const maxDelay = config.maxDelay || 3000
  const includeDistracters = config.includeDistracters !== false // Default true
  const distractorRatio = config.distractorRatio || 0.3 // 30% of rounds show distractors

  const [gameState, setGameState] = useState<GameState>('instructions')
  const [currentRound, setCurrentRound] = useState(0)
  const [roundResults, setRoundResults] = useState<Round[]>([])
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [averageTime, setAverageTime] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [isCurrentCorrectStimulus, setIsCurrentCorrectStimulus] = useState(true)

  const stimulusTimeRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isWaitingRef = useRef(false)
  const stimulusTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Translations
  const t = {
    en: {
      testReaction: 'Test your reaction time!',
      waitFor: 'Wait for the screen to turn',
      green: 'GREEN',
      thenClick: 'Then click as',
      fast: 'FAST',
      asYouCan: 'as you can!',
      dontClickEarly: "⚠️ Don't click too early or it's a false start!",
      roundsDifficulty: '{rounds} rounds • {difficulty} difficulty',
      clickToStart: 'Click anywhere to start',
      getRound: 'Round {round} of {total}',
      getReady: 'Get ready...',
      wait: 'Wait...',
      dontClick: "Don't click yet!",
      clickNow: 'CLICK NOW!',
      falseStart: 'False Start!',
      clickedEarly: 'You clicked too early. Wait for the green signal!',
      excellent: 'Excellent!',
      great: 'Great!',
      good: 'Good!',
      keepPracticing: 'Keep Practicing!',
      correct: 'Correct!',
      wrong: 'Wrong!',
      correctAnswer: 'Correct answer: {answer}',
      gameComplete: 'Game Complete!',
      averageReaction: 'Average Reaction Time',
      validRounds: 'Valid Rounds',
      bestTime: 'Best Time',
      falseStarts: 'False Starts',
      finalScore: 'Final Score:',
      noValidRounds: 'No valid rounds completed. Try again!',
      continue: 'Continue',
      nextRound: 'Next Round',
      seeResults: 'See Results'
    },
    ar: {
      testReaction: 'اختبر سرعة رد فعلك!',
      waitFor: 'انتظر حتى تتحول الشاشة إلى',
      green: 'الأخضر',
      thenClick: 'ثم انقر بأسرع',
      fast: 'سرعة',
      asYouCan: 'ممكنة!',
      dontClickEarly: '⚠️ لا تضغط مبكرًا وإلا ستكون بداية خاطئة!',
      roundsDifficulty: '{rounds} جولات • صعوبة {difficulty}',
      clickToStart: 'انقر في أي مكان للبدء',
      getRound: 'الجولة {round} من {total}',
      getReady: 'استعد...',
      wait: 'انتظر...',
      dontClick: 'لا تضغط بعد!',
      clickNow: 'اضغط الآن!',
      falseStart: 'بداية خاطئة!',
      clickedEarly: 'لقد ضغطت مبكرًا جدًا. انتظر الإشارة الخضراء!',
      excellent: 'ممتاز!',
      great: 'رائع!',
      good: 'جيد!',
      keepPracticing: 'استمر في التدريب!',
      correct: 'صحيح!',
      wrong: 'خطأ!',
      correctAnswer: 'الإجابة الصحيحة: {answer}',
      gameComplete: 'انتهت اللعبة!',
      averageReaction: 'متوسط وقت رد الفعل',
      validRounds: 'الجولات الصحيحة',
      bestTime: 'أفضل وقت',
      falseStarts: 'البدايات الخاطئة',
      finalScore: 'النتيجة النهائية:',
      noValidRounds: 'لم تكتمل أي جولات صحيحة. حاول مرة أخرى!',
      continue: 'متابعة',
      nextRound: 'الجولة التالية',
      seeResults: 'رؤية النتائج'
    }
  }
  const text = t[language]

  // Get difficulty settings
  const getDifficultySettings = (diff: string) => {
    const settings: Record<string, { targetTime: number; excellentTime: number; goodTime: number }> = {
      very_easy: { targetTime: 800, excellentTime: 500, goodTime: 650 },
      easy: { targetTime: 700, excellentTime: 450, goodTime: 575 },
      easy_medium: { targetTime: 600, excellentTime: 400, goodTime: 500 },
      medium: { targetTime: 500, excellentTime: 350, goodTime: 425 },
      medium_hard: { targetTime: 400, excellentTime: 300, goodTime: 350 },
      hard: { targetTime: 350, excellentTime: 250, goodTime: 300 },
      very_hard: { targetTime: 300, excellentTime: 200, goodTime: 250 }
    }
    return settings[diff] || settings.easy
  }

  const difficultySettings = getDifficultySettings(difficulty)

  // Get stimulus display
  const getStimulusDisplay = () => {
    const customStimulus = config.customStimulus
    
    if (stimulusType === 'custom' && customStimulus) {
      if (customStimulus.type === 'image' && customStimulus.imageUrl) {
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="w-48 h-48 flex items-center justify-center bg-white/10 rounded-2xl p-4">
              <img 
                src={customStimulus.imageUrl} 
                alt={customStimulus.label || 'React!'}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            {customStimulus.label && (
              <div className="text-3xl font-bold text-white">{customStimulus.label}</div>
            )}
          </div>
        )
      } else if (customStimulus.emoji) {
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="text-9xl">{customStimulus.emoji}</div>
            {customStimulus.label && (
              <div className="text-3xl font-bold text-white">{customStimulus.label}</div>
            )}
          </div>
        )
      }
    }

    // Default stimulus types
    const stimuli: Record<string, React.JSX.Element> = {
      color: <div className="text-6xl font-bold text-white">CLICK NOW!</div>,
      emoji: <div className="text-9xl">⚡</div>,
      shape: (
        <div className="w-48 h-48 bg-yellow-400 rounded-full border-8 border-white shadow-2xl"></div>
      ),
      target: <div className="text-9xl">🎯</div>,
      star: <div className="text-9xl">⭐</div>
    }

    return stimuli[stimulusType] || stimuli.color
  }

  // Start a new round
  const startRound = () => {
    if (currentRound >= rounds) {
      finishGame()
      return
    }

    setGameState('ready')
    setReactionTime(null)
    
    setTimeout(() => {
      setGameState('waiting')
      isWaitingRef.current = true

      const delay = Math.random() * (maxDelay - minDelay) + minDelay
      
      timeoutRef.current = setTimeout(() => {
        stimulusTimeRef.current = Date.now()
        setGameState('react')
        isWaitingRef.current = false
      }, delay)
    }, 1000)
  }

  // Handle screen click
  const handleClick = () => {
    if (gameState === 'instructions') {
      setGameState('ready')
      startRound()
      return
    }

    if (gameState === 'waiting' && isWaitingRef.current) {
      // False start
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      isWaitingRef.current = false
      
      const newRound: Round = {
        roundNumber: currentRound + 1,
        reactionTime: null,
        falseStart: true
      }
      
      setRoundResults([...roundResults, newRound])
      setCurrentRound(currentRound + 1)
      setReactionTime(-1) // Indicates false start
      setGameState('result')
      return
    }

    if (gameState === 'react') {
      const time = Date.now() - stimulusTimeRef.current
      setReactionTime(time)
      
      const newRound: Round = {
        roundNumber: currentRound + 1,
        reactionTime: time,
        falseStart: false
      }
      
      setRoundResults([...roundResults, newRound])
      setCurrentRound(currentRound + 1)
      setGameState('result')
    }
  }

  // Continue to next round
  const continueToNextRound = () => {
    if (currentRound >= rounds) {
      finishGame()
    } else {
      startRound()
    }
  }

  // Finish game and calculate results
  const finishGame = () => {
    const validRounds = roundResults.filter(r => !r.falseStart && r.reactionTime !== null)
    
    if (validRounds.length === 0) {
      setAverageTime(null)
      setScore(0)
      setGameState('complete')
      return
    }

    const totalTime = validRounds.reduce((sum, r) => sum + (r.reactionTime || 0), 0)
    const avg = totalTime / validRounds.length
    setAverageTime(avg)

    // Calculate score based on average reaction time
    let calculatedScore = 0
    if (avg <= difficultySettings.excellentTime) {
      calculatedScore = 100
    } else if (avg <= difficultySettings.goodTime) {
      calculatedScore = 85
    } else if (avg <= difficultySettings.targetTime) {
      calculatedScore = 70
    } else {
      calculatedScore = Math.max(50, 70 - Math.floor((avg - difficultySettings.targetTime) / 50) * 5)
    }

    setScore(calculatedScore)
    setGameState('complete')
  }

  // Handle game completion
  const handleComplete = async () => {
    const validRounds = roundResults.filter(r => !r.falseStart && r.reactionTime !== null)
    const metCriteria = averageTime !== null && averageTime <= difficultySettings.targetTime

    const gameData = {
      averageReactionTime: averageTime ?? undefined,
      validRounds: validRounds.length,
      totalRounds: rounds,
      falseStarts: roundResults.filter(r => r.falseStart).length,
      bestTime: validRounds.length > 0 ? Math.min(...validRounds.map(r => r.reactionTime || Infinity)) : undefined,
      worstTime: validRounds.length > 0 ? Math.max(...validRounds.map(r => r.reactionTime || -Infinity)) : undefined,
      metSuccessCriteria: metCriteria,
      targetTime: difficultySettings.targetTime
    }

    try {
      await recordGameAttempt({
        userId: parseInt(userId),
        gameId: parseInt(game.id),
        learningDayId: parseInt(learningDayId),
        dayGameId: parseInt(dayGameId),
        score,
        isCorrect: true, // Always complete
        gameData
      })
      onComplete(true, score)
    } catch (error) {
      console.error('Error recording game attempt:', error)
      onComplete(true, score)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Get rating text
  const getRatingText = (time: number) => {
    if (time <= difficultySettings.excellentTime) return { text: text.excellent, emoji: '🚀', color: 'text-yellow-400' }
    if (time <= difficultySettings.goodTime) return { text: text.great, emoji: '⭐', color: 'text-green-400' }
    if (time <= difficultySettings.targetTime) return { text: text.good, emoji: '👍', color: 'text-blue-400' }
    return { text: text.keepPracticing, emoji: '💪', color: 'text-orange-400' }
  }

  return (
    <div className="w-full h-full min-h-[600px] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Instructions */}
        {gameState === 'instructions' && (
          <div 
            className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 text-center cursor-pointer hover:scale-105 transition-transform shadow-2xl"
            onClick={handleClick}
          >
            <div className="text-6xl mb-6">⚡</div>
            <h2 className="text-4xl font-bold text-white mb-6">{language === 'ar' ? game.name_ar || game.name : game.name}</h2>
            <div className="text-xl text-white/90 mb-8 space-y-3">
              <p>{text.testReaction}</p>
              <p className="text-lg">{text.waitFor} <span className="font-bold text-green-300">{text.green}</span></p>
              <p className="text-lg">{text.thenClick} <span className="font-bold">{text.fast}</span> {text.asYouCan}</p>
              <p className="text-base text-white/70 mt-4">{text.dontClickEarly}</p>
            </div>
            <div className="text-white/80 text-lg">
              {text.roundsDifficulty.replace('{rounds}', rounds.toString()).replace('{difficulty}', difficulty.replace('_', ' '))}
            </div>
            <div className="mt-8 text-2xl font-bold text-white animate-pulse">
              {text.clickToStart}
            </div>
          </div>
        )}

        {/* Ready state */}
        {gameState === 'ready' && (
          <div className="bg-blue-500 rounded-3xl p-12 text-center shadow-2xl">
            <div className="text-6xl mb-4">🏁</div>
            <div className="text-4xl font-bold text-white mb-4">{text.getRound.replace('{round}', (currentRound + 1).toString()).replace('{total}', rounds.toString())}</div>
            <div className="text-2xl text-white/90">{text.getReady}</div>
          </div>
        )}

        {/* Waiting state */}
        {gameState === 'waiting' && (
          <div 
            className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-12 text-center cursor-pointer shadow-2xl min-h-[400px] flex items-center justify-center"
            onClick={handleClick}
          >
            <div>
              <div className="text-6xl mb-6">⏳</div>
              <div className="text-5xl font-bold text-white">{text.wait}</div>
              <div className="text-xl text-white/70 mt-4">{text.dontClick}</div>
            </div>
          </div>
        )}

        {/* React state */}
        {gameState === 'react' && (
          <div 
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-12 text-center cursor-pointer shadow-2xl min-h-[400px] flex items-center justify-center animate-pulse"
            onClick={handleClick}
          >
            {getStimulusDisplay()}
          </div>
        )}

        {/* Result state */}
        {gameState === 'result' && (
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-12 text-center shadow-2xl">
            <div className="text-6xl mb-6">
              {reactionTime === -1 ? '❌' : getRatingText(reactionTime || 0).emoji}
            </div>
            
            {reactionTime === -1 ? (
              <>
                <div className="text-4xl font-bold text-white mb-4">{text.falseStart}</div>
                <div className="text-xl text-white/80 mb-8">{text.clickedEarly}</div>
              </>
            ) : (
              <>
                <div className={`text-5xl font-bold ${getRatingText(reactionTime || 0).color} mb-4`}>
                  {reactionTime}ms
                </div>
                <div className="text-2xl text-white mb-8">
                  {getRatingText(reactionTime || 0).text}
                </div>
              </>
            )}

            <div className="text-white/70 mb-8">
              {text.getRound.replace('{round}', currentRound.toString()).replace('{total}', rounds.toString())}
            </div>

            <button
              onClick={continueToNextRound}
              className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              {currentRound >= rounds ? text.seeResults : text.nextRound}
            </button>
          </div>
        )}

        {/* Complete state */}
        {gameState === 'complete' && (
          <div className="bg-gradient-to-br from-green-600 to-blue-600 rounded-3xl p-12 text-center shadow-2xl">
            <div className="text-6xl mb-6">🏆</div>
            <h2 className="text-4xl font-bold text-white mb-8">{text.gameComplete}</h2>

            {averageTime !== null ? (
              <>
                <div className="bg-white/10 rounded-2xl p-6 mb-6">
                  <div className="text-white/80 text-lg mb-2">{text.averageReaction}</div>
                  <div className={`text-6xl font-bold ${getRatingText(averageTime).color} mb-2`}>
                    {Math.round(averageTime)}ms
                  </div>
                  <div className="text-2xl text-white">
                    {getRatingText(averageTime).text}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-white/70 text-sm mb-1">{text.validRounds}</div>
                    <div className="text-3xl font-bold text-white">
                      {roundResults.filter(r => !r.falseStart).length}/{rounds}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-white/70 text-sm mb-1">{text.bestTime}</div>
                    <div className="text-3xl font-bold text-green-300">
                      {roundResults.filter(r => !r.falseStart && r.reactionTime).length > 0
                        ? Math.min(...roundResults.filter(r => !r.falseStart && r.reactionTime).map(r => r.reactionTime!))
                        : 0}ms
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-white/70 text-sm mb-1">{text.falseStarts}</div>
                    <div className="text-3xl font-bold text-red-300">
                      {roundResults.filter(r => r.falseStart).length}
                    </div>
                  </div>
                </div>

                <div className="text-white/80 text-lg mb-8">
                  {text.finalScore} <span className="font-bold text-2xl text-yellow-300">{score}</span>
                </div>
              </>
            ) : (
              <div className="text-white/80 text-xl mb-8">
                {text.noValidRounds}
              </div>
            )}

            <button
              onClick={handleComplete}
              className="px-8 py-4 bg-white text-green-600 rounded-xl font-bold text-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              {text.continue}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


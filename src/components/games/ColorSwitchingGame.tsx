'use client'

import { useState, useEffect, useRef } from 'react'
import { recordGameAttempt } from '@/actions/learning-path'

interface ColorSwitchingGameProps {
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

interface ColorItem {
  word: string
  color: string
  isCongruent: boolean
}

interface Round {
  item: ColorItem
  correctAnswer: string
  userAnswer: string | null
  isCorrect: boolean
  responseTime: number
}

type GameMode = 'word' | 'color' | 'mixed'
type GameState = 'instructions' | 'countdown' | 'playing' | 'result' | 'complete'

export default function ColorSwitchingGame({ game, userId, learningDayId, dayGameId, onComplete, language = 'en' }: ColorSwitchingGameProps) {
  const config = game.config || {}
  const difficulty = config.difficulty || 'easy'
  const gameMode = (config.gameMode || 'mixed') as GameMode
  const rounds = config.rounds || 15
  const timePerRound = config.timePerRound || 3000
  const showTimer = config.showTimer !== false
  const congruentRatio = config.congruentRatio || 0.5

  // Custom colors or default
  const defaultColors = [
    { name: 'Red', value: '#EF4444', word: 'RED' },
    { name: 'Blue', value: '#3B82F6', word: 'BLUE' },
    { name: 'Green', value: '#10B981', word: 'GREEN' },
    { name: 'Yellow', value: '#EAB308', word: 'YELLOW' },
    { name: 'Purple', value: '#A855F7', word: 'PURPLE' },
    { name: 'Orange', value: '#F97316', word: 'ORANGE' }
  ]

  const colors = config.customColors && config.customColors.length > 0 
    ? config.customColors 
    : defaultColors

  const [gameState, setGameState] = useState<GameState>('instructions')
  const [currentRound, setCurrentRound] = useState(0)
  const [currentItem, setCurrentItem] = useState<ColorItem | null>(null)
  const [currentMode, setCurrentMode] = useState<'word' | 'color'>('word')
  const [rounds_data, setRoundsData] = useState<Round[]>([])
  const [timeLeft, setTimeLeft] = useState(timePerRound)
  const [score, setScore] = useState(0)
  const [countdown, setCountdown] = useState(3)

  const roundStartTime = useRef<number>(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Translations
  const t = {
    en: {
      howToPlay: 'How to Play:',
      readWord: 'Read the',
      word: 'WORD',
      selectWord: 'and select the matching color below.',
      ignoreColor: '(Ignore the color of the text)',
      lookColor: 'Look at the',
      color: 'COLOR',
      selectColor: 'of the text and select it below.',
      ignoreWord: '(Ignore what the word says)',
      gameTellYou: 'The game will tell you what to do:',
      selectTheWord: 'Select the WORD',
      chooseWord: 'Choose based on what the word says',
      selectTheColor: 'Select the COLOR',
      chooseColor: 'Choose based on the text color',
      roundsDuration: '{rounds} rounds • {time} seconds per round',
      startGame: 'Start Game',
      getReady: 'Get Ready!',
      round: 'Round',
      of: 'of',
      score: 'Score',
      selectWord2: 'Select the WORD',
      selectColor2: 'Select the COLOR',
      correct: 'Correct!',
      wrong: 'Wrong!',
      correctAnswer: 'Correct answer: {answer}',
      gameComplete: 'Game Complete!',
      accuracy: 'Accuracy',
      correct2: 'correct',
      avgResponse: 'Avg Response',
      finalScore: 'Final Score',
      matchingEasy: 'Matching (Easy)',
      conflictingHard: 'Conflicting (Hard)',
      continue: 'Continue'
    },
    ar: {
      howToPlay: 'كيف تلعب:',
      readWord: 'اقرأ',
      word: 'الكلمة',
      selectWord: 'واختر اللون المطابق أدناه.',
      ignoreColor: '(تجاهل لون النص)',
      lookColor: 'انظر إلى',
      color: 'اللون',
      selectColor: 'للنص واختره أدناه.',
      ignoreWord: '(تجاهل ما تقوله الكلمة)',
      gameTellYou: 'ستخبرك اللعبة بما يجب فعله:',
      selectTheWord: 'اختر الكلمة',
      chooseWord: 'اختر بناءً على ما تقوله الكلمة',
      selectTheColor: 'اختر اللون',
      chooseColor: 'اختر بناءً على لون النص',
      roundsDuration: '{rounds} جولات • {time} ثانية لكل جولة',
      startGame: 'ابدأ اللعبة',
      getReady: 'استعد!',
      round: 'الجولة',
      of: 'من',
      score: 'النتيجة',
      selectWord2: 'اختر الكلمة',
      selectColor2: 'اختر اللون',
      correct: 'صحيح!',
      wrong: 'خطأ!',
      correctAnswer: 'الإجابة الصحيحة: {answer}',
      gameComplete: 'انتهت اللعبة!',
      accuracy: 'الدقة',
      correct2: 'صحيح',
      avgResponse: 'متوسط الاستجابة',
      finalScore: 'النتيجة النهائية',
      matchingEasy: 'متطابق (سهل)',
      conflictingHard: 'متضارب (صعب)',
      continue: 'متابعة'
    }
  }
  const text = t[language]

  // Generate a random color item
  const generateColorItem = (): ColorItem => {
    const isCongruent = Math.random() < congruentRatio
    
    if (isCongruent) {
      // Word and color match
      const color = colors[Math.floor(Math.random() * colors.length)]
      return {
        word: color.word,
        color: color.value,
        isCongruent: true
      }
    } else {
      // Word and color don't match
      const wordColor = colors[Math.floor(Math.random() * colors.length)]
      let displayColor = colors[Math.floor(Math.random() * colors.length)]
      
      // Ensure they're different
      while (displayColor.value === wordColor.value) {
        displayColor = colors[Math.floor(Math.random() * colors.length)]
      }
      
      return {
        word: wordColor.word,
        color: displayColor.value,
        isCongruent: false
      }
    }
  }

  // Start countdown before game
  const startCountdown = () => {
    setGameState('countdown')
    setCountdown(3)
    
    const countInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countInterval)
          startRound()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Start a new round
  const startRound = () => {
    if (currentRound >= rounds) {
      finishGame()
      return
    }

    // Clear any existing timers first
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current)
      timeoutTimerRef.current = null
    }

    // Determine mode for this round
    let mode: 'word' | 'color' = 'word'
    if (gameMode === 'mixed') {
      mode = Math.random() < 0.5 ? 'word' : 'color'
    } else {
      mode = gameMode as 'word' | 'color'
    }

    setCurrentMode(mode)
    setCurrentItem(generateColorItem())
    setTimeLeft(timePerRound)
    setGameState('playing')
    roundStartTime.current = Date.now()

    // Start visual timer (updates display only)
    timerRef.current = setInterval(() => {
      setTimeLeft((prev: number) => Math.max(0, prev - 100))
    }, 100)

    // Separate timeout handler
    timeoutTimerRef.current = setTimeout(() => {
      handleTimeout()
    }, timePerRound)
  }

  // Handle answer selection
  const handleAnswer = (selectedColor: { name: string; value: string; word: string }) => {
    if (gameState !== 'playing' || !currentItem) return

    // Immediately change state to prevent multiple clicks
    setGameState('result')

    const responseTime = Date.now() - roundStartTime.current
    
    // Determine correct answer
    let correctAnswer = ''
    if (currentMode === 'word') {
      // Should select based on the word
      correctAnswer = currentItem.word
    } else {
      // Should select based on the color
      const colorMatch = colors.find((c: { name: string; value: string; word: string }) => c.value === currentItem.color)
      correctAnswer = colorMatch?.word || ''
    }

    const isCorrect = selectedColor.word === correctAnswer
    
    // Record round
    const round: Round = {
      item: currentItem,
      correctAnswer,
      userAnswer: selectedColor.word,
      isCorrect,
      responseTime
    }

    // Use functional updates to avoid stale state
    setRoundsData(prev => [...prev, round])
    
    if (isCorrect) {
      setScore(prev => prev + 1)
    }

    // Clear timers
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current)
      timeoutTimerRef.current = null
    }

    // Move to next round using functional update
    setCurrentRound(prev => {
      const nextRound = prev + 1
      
      setTimeout(() => {
        if (nextRound >= rounds) {
          finishGame()
        } else {
          startRound()
        }
      }, 1000)
      
      return nextRound
    })
  }

  // Handle timeout
  const handleTimeout = () => {
    if (gameState !== 'playing' || !currentItem) return

    // Immediately change state to prevent multiple timeouts
    setGameState('result')

    // Clear timers
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current)
      timeoutTimerRef.current = null
    }

    const correctAnswer = currentMode === 'word' 
      ? currentItem.word 
      : colors.find((c: { name: string; value: string; word: string }) => c.value === currentItem.color)?.word || ''

    const round: Round = {
      item: currentItem,
      correctAnswer,
      userAnswer: null,
      isCorrect: false,
      responseTime: timePerRound
    }

    // Use functional updates to avoid stale state
    setRoundsData(prev => [...prev, round])
    
    setCurrentRound(prev => {
      const nextRound = prev + 1
      
      setTimeout(() => {
        if (nextRound >= rounds) {
          finishGame()
        } else {
          startRound()
        }
      }, 1000)
      
      return nextRound
    })
  }

  // Finish game
  const finishGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current)
      timeoutTimerRef.current = null
    }
    setGameState('complete')
  }

  // Calculate final score
  const calculateScore = () => {
    const correctRounds = rounds_data.filter(r => r.isCorrect).length
    const accuracy = rounds_data.length > 0 ? (correctRounds / rounds_data.length) * 100 : 0
    const avgResponseTime = rounds_data.length > 0 
      ? rounds_data.reduce((sum, r) => sum + r.responseTime, 0) / rounds_data.length 
      : 0

    // Score based on accuracy and speed
    let finalScore = Math.round(accuracy)
    
    // Bonus for fast responses
    if (avgResponseTime < timePerRound * 0.5) {
      finalScore = Math.min(100, finalScore + 10)
    }

    return { finalScore, correctRounds, accuracy, avgResponseTime }
  }

  // Handle game completion
  const handleComplete = async () => {
    const { finalScore, correctRounds, accuracy, avgResponseTime } = calculateScore()
    
    const congruentRounds = rounds_data.filter(r => r.item.isCongruent)
    const incongruentRounds = rounds_data.filter(r => !r.item.isCongruent)
    
    const gameData = {
      totalRounds: rounds_data.length,
      correctRounds,
      incorrectRounds: rounds_data.length - correctRounds,
      accuracy,
      averageResponseTime: avgResponseTime,
      congruentAccuracy: congruentRounds.length > 0 
        ? (congruentRounds.filter(r => r.isCorrect).length / congruentRounds.length) * 100 
        : 0,
      incongruentAccuracy: incongruentRounds.length > 0 
        ? (incongruentRounds.filter(r => r.isCorrect).length / incongruentRounds.length) * 100 
        : 0,
      metSuccessCriteria: accuracy >= 70,
      gameMode,
      difficulty
    }

    try {
      await recordGameAttempt({
        userId: parseInt(userId),
        gameId: parseInt(game.id),
        learningDayId: parseInt(learningDayId),
        dayGameId: parseInt(dayGameId),
        score: finalScore,
        isCorrect: true,
        gameData
      })
      onComplete(true, finalScore)
    } catch (error) {
      console.error('Error recording game attempt:', error)
      onComplete(true, finalScore)
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="w-full h-full min-h-[600px] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Instructions */}
        {gameState === 'instructions' && (
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-12 text-center shadow-2xl">
            <div className="text-6xl mb-6">🎨</div>
            <h2 className="text-4xl font-bold text-white mb-6">{language === 'ar' ? game.name_ar || game.name : game.name}</h2>
            
            <div className="text-xl text-white/90 mb-8 space-y-4">
              <p className="text-2xl font-bold">{text.howToPlay}</p>
              
              {gameMode === 'word' && (
                <p className="text-lg">
                  {text.readWord} <span className="font-bold underline">{text.word}</span> {text.selectWord}<br/>
                  <span className="text-sm text-white/70">{text.ignoreColor}</span>
                </p>
              )}
              
              {gameMode === 'color' && (
                <p className="text-lg">
                  {text.lookColor} <span className="font-bold underline">{text.color}</span> {text.selectColor}<br/>
                  <span className="text-sm text-white/70">{text.ignoreWord}</span>
                </p>
              )}
              
              {gameMode === 'mixed' && (
                <div className="space-y-3">
                  <p className="text-lg">{text.gameTellYou}</p>
                  <div className="bg-white/20 rounded-lg p-4 text-base">
                    <p className="mb-2">📖 <span className="font-bold">"{text.selectTheWord}"</span> - {text.chooseWord}</p>
                    <p>🎨 <span className="font-bold">"{text.selectTheColor}"</span> - {text.chooseColor}</p>
                  </div>
                </div>
              )}

              <p className="text-sm text-white/70 mt-4">
                {text.roundsDuration.replace('{rounds}', rounds.toString()).replace('{time}', (timePerRound / 1000).toString())}
              </p>
            </div>

            <button
              onClick={startCountdown}
              className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              {text.startGame}
            </button>
          </div>
        )}

        {/* Countdown */}
        {gameState === 'countdown' && (
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 text-center shadow-2xl">
            <div className="text-9xl font-bold text-white animate-bounce">
              {countdown}
            </div>
            <div className="text-2xl text-white/80 mt-6">{text.getReady}</div>
          </div>
        )}

        {/* Playing */}
        {gameState === 'playing' && currentItem && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-gray-800">
                {text.round} {currentRound + 1} {text.of} {rounds}
              </div>
              <div className="text-xl font-semibold text-gray-600">
                {text.score}: {score} / {currentRound}
              </div>
            </div>

            {/* Instruction */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-white">
                {currentMode === 'word' ? `📖 ${text.selectWord2}` : `🎨 ${text.selectColor2}`}
              </div>
            </div>

            {/* Timer */}
            {showTimer && (
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-100"
                  style={{ width: `${(timeLeft / timePerRound) * 100}%` }}
                />
              </div>
            )}

            {/* Color Word Display */}
            <div className="bg-white rounded-3xl p-16 text-center shadow-2xl border-4 border-gray-200">
              <div 
                className="text-8xl font-black tracking-wider"
                style={{ color: currentItem.color }}
              >
                {currentItem.word}
              </div>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {colors.map((color: { name: string; value: string; word: string }) => (
                <button
                  key={color.word}
                  onClick={() => handleAnswer(color)}
                  className="p-6 rounded-2xl font-bold text-xl text-white hover:scale-105 transition-transform shadow-lg border-4 border-white/50"
                  style={{ backgroundColor: color.value }}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result Feedback */}
        {gameState === 'result' && (
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 text-center shadow-2xl">
            <div className="text-6xl mb-4">
              {rounds_data[rounds_data.length - 1]?.isCorrect ? '✅' : '❌'}
            </div>
            <div className="text-3xl font-bold text-white">
              {rounds_data[rounds_data.length - 1]?.isCorrect ? text.correct : text.wrong}
            </div>
            {!rounds_data[rounds_data.length - 1]?.isCorrect && (
              <div className="text-lg text-white/80 mt-4">
                {text.correctAnswer.replace('{answer}', rounds_data[rounds_data.length - 1]?.correctAnswer || '')}
              </div>
            )}
          </div>
        )}

        {/* Complete */}
        {gameState === 'complete' && (
          <div className="bg-gradient-to-br from-green-600 to-blue-600 rounded-3xl p-12 text-center shadow-2xl">
            <div className="text-6xl mb-6">🏆</div>
            <h2 className="text-4xl font-bold text-white mb-8">{text.gameComplete}</h2>

            {(() => {
              const { finalScore, correctRounds, accuracy, avgResponseTime } = calculateScore()
              const congruentRounds = rounds_data.filter(r => r.item.isCongruent)
              const incongruentRounds = rounds_data.filter(r => !r.item.isCongruent)

              return (
                <>
                  <div className="bg-white/10 rounded-2xl p-6 mb-6">
                    <div className="text-white/80 text-lg mb-2">{text.accuracy}</div>
                    <div className="text-6xl font-bold text-yellow-300 mb-2">
                      {Math.round(accuracy)}%
                    </div>
                    <div className="text-xl text-white">
                      {correctRounds} / {rounds_data.length} {text.correct2}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-white/70 text-sm mb-1">{text.avgResponse}</div>
                      <div className="text-2xl font-bold text-white">
                        {Math.round(avgResponseTime)}ms
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-white/70 text-sm mb-1">{text.finalScore}</div>
                      <div className="text-2xl font-bold text-yellow-300">
                        {finalScore}
                      </div>
                    </div>
                  </div>

                  {congruentRounds.length > 0 && incongruentRounds.length > 0 && (
                    <div className="bg-white/10 rounded-xl p-4 mb-6 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-white/70 mb-1">{text.matchingEasy}</div>
                          <div className="text-xl font-bold text-green-300">
                            {Math.round((congruentRounds.filter(r => r.isCorrect).length / congruentRounds.length) * 100)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-white/70 mb-1">{text.conflictingHard}</div>
                          <div className="text-xl font-bold text-red-300">
                            {Math.round((incongruentRounds.filter(r => r.isCorrect).length / incongruentRounds.length) * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleComplete}
                    className="px-8 py-4 bg-white text-green-600 rounded-xl font-bold text-xl hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    {text.continue}
                  </button>
                </>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

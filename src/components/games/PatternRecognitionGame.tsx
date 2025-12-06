'use client'

import { useState, useEffect } from 'react'
import { Game, GameConfig } from '@/types/learning-path'
import { recordGameAttempt } from '@/actions/learning-path'

interface PatternRecognitionGameProps {
  game: Game
  userId: number
  learningDayId: number
  dayGameId: number
  onComplete: (isCorrect: boolean, score: number) => void
  language?: 'en' | 'ar'
}

interface PatternCell {
  id: string
  value: string
  color?: string
  emoji?: string
  imageUrl?: string
  isImage?: boolean
}

export default function PatternRecognitionGame({ 
  game, 
  userId, 
  learningDayId, 
  dayGameId, 
  onComplete,
  language = 'en'
}: PatternRecognitionGameProps) {
  const config = game.config as GameConfig
  const difficulty = config.difficulty || 'easy'
  const patternType = config.patternType || 'colors'
  const totalRounds = config.rounds || 5

  const t = {
    en: {
      howToPlay: '📝 How to Play:',
      patternAppear: 'A pattern will appear for a few seconds -',
      memorize: 'memorize it!',
      patternDisappear: 'The pattern will disappear and you\'ll get a countdown',
      recreatePattern: 'Recreate the pattern by clicking on the cells and selecting items',
      submitAnswer: 'Submit your answer and see if you got it right!',
      rounds: 'Rounds',
      gridSize: 'Grid Size',
      startGame: 'Start Game',
      round: 'Round',
      correct: 'Correct',
      mistakes: 'Mistakes',
      time: 'Time',
      memorizePattern: '👀 Memorize this pattern!',
      getReady: 'Get ready to recreate the pattern...',
      recreate: '🧩 Recreate the pattern!',
      clear: 'Clear',
      fillAllCells: 'Please fill all cells before submitting!',
      clickCellsInstruction: 'Click on cells above to cycle through items, or click items below:',
      perfectRight: 'Perfect! You got it right!',
      notQuite: 'Not quite! Try to focus more next time.',
      excellentMemory: 'Excellent Memory!',
      keepPracticing: 'Keep Practicing!',
      gotCorrect: 'You got {correct} out of {total} patterns correct!',
      accuracy2: 'Accuracy:',
    },
    ar: {
      howToPlay: '📝 كيف تلعب:',
      patternAppear: 'سيظهر نمط لبضع ثوان -',
      memorize: 'احفظه!',
      patternDisappear: 'سيختفي النمط وستحصل على عد تنازلي',
      recreatePattern: 'أعد إنشاء النمط بالنقر على الخلايا واختيار العناصر',
      rounds: 'الجولات',
      gridSize: 'حجم الشبكة',
      startGame: 'ابدأ اللعبة',
      round: 'الجولة',
      correct: 'صحيح',
      mistakes: 'الأخطاء',
      time: 'الوقت',
      memorizePattern: '👀 احفظ هذا النمط!',
      getReady: 'استعد لإعادة إنشاء النمط...',
      recreate: '🧩 أعد إنشاء النمط!',
      clear: 'مسح',
      submitAnswer: 'إرسال الإجابة',
      fillAllCells: 'يرجى ملء جميع الخلايا قبل الإرسال!',
      clickCellsInstruction: 'انقر على الخلايا أعلاه للتنقل بين العناصر، أو انقر على العناصر أدناه:',
      perfectRight: 'رائع! لقد حصلت عليه بشكل صحيح!',
      notQuite: 'ليس تمامًا! حاول التركيز أكثر في المرة القادمة.',
      excellentMemory: 'ذاكرة ممتازة!',
      keepPracticing: 'استمر في التدريب!',
      gotCorrect: 'لقد حصلت على {correct} من أصل {total} أنماط بشكل صحيح!',
      accuracy2: 'الدقة:',
    }
  }
  const text = t[language]
  
  const [currentRound, setCurrentRound] = useState(1)
  const [pattern, setPattern] = useState<PatternCell[]>([])
  const [userPattern, setUserPattern] = useState<PatternCell[]>([])
  const [showPattern, setShowPattern] = useState(false)
  const [showRecreate, setShowRecreate] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [countdown, setCountdown] = useState(3)

  // Timer
  useEffect(() => {
    if (!gameStarted || gameCompleted) return
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)
    
    return () => clearInterval(timer)
  }, [gameStarted, gameCompleted])

  // Initialize first round
  useEffect(() => {
    if (gameStarted && !showPattern && !showRecreate && !showFeedback) {
      startNewRound()
    }
  }, [gameStarted])

  function getGridSize(): { rows: number; cols: number; cells: number } {
    const sizes = {
      very_easy: { rows: 2, cols: 2, cells: 4 },
      easy: { rows: 2, cols: 2, cells: 4 },
      easy_medium: { rows: 2, cols: 3, cells: 6 },
      medium: { rows: 3, cols: 3, cells: 9 },
      medium_hard: { rows: 3, cols: 3, cells: 9 },
      hard: { rows: 3, cols: 4, cells: 12 },
      very_hard: { rows: 4, cols: 4, cells: 16 }
    }
    return sizes[difficulty as keyof typeof sizes] || sizes.easy
  }

  function getDisplayTime(): number {
    const times = {
      very_easy: 5000,
      easy: 4000,
      easy_medium: 3500,
      medium: 3000,
      medium_hard: 2500,
      hard: 2000,
      very_hard: 1500
    }
    return times[difficulty as keyof typeof times] || 4000
  }

  function getPatternItems(): Array<{ value: string; imageUrl?: string; type: 'emoji' | 'image' }> {
    // Check if custom items exist
    const customItems = (config as any).customPatternItems
    if (patternType === 'custom' && customItems && customItems.length > 0) {
      return customItems.map((item: any) => ({
        value: item.type === 'image' ? item.label : item.value,
        imageUrl: item.imageUrl,
        type: item.type
      }))
    }

    // Default built-in items
    const items = {
      colors: ['🟥', '🟦', '🟩', '🟨', '🟪', '🟧', '⬜', '⬛'],
      shapes: ['⭕', '⬜', '🔺', '⬛', '💠', '🔶', '💎', '⭐'],
      emojis: ['😀', '😎', '🥳', '😊', '🤔', '😴', '🤗', '😇'],
      animals: ['🐕', '🐈', '🐰', '🐻', '🦁', '🐸', '🐷', '🐮'],
      food: ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🥝', '🍒'],
      numbers: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
    }
    const emojiArray = items[patternType as keyof typeof items] || items.colors
    return emojiArray.map(emoji => ({ value: emoji, type: 'emoji' }))
  }

  function generatePattern(): PatternCell[] {
    const gridSize = getGridSize()
    const items = getPatternItems()
    const pattern: PatternCell[] = []

    for (let i = 0; i < gridSize.cells; i++) {
      const randomItem = items[Math.floor(Math.random() * items.length)]
      pattern.push({
        id: `cell-${i}`,
        value: randomItem.value,
        emoji: randomItem.value,
        imageUrl: randomItem.imageUrl,
        isImage: randomItem.type === 'image'
      })
    }

    return pattern
  }

  function startNewRound() {
    const newPattern = generatePattern()
    setPattern(newPattern)
    setUserPattern(newPattern.map(cell => ({ 
      ...cell, 
      value: '', 
      emoji: '❓',
      imageUrl: undefined,
      isImage: false
    })))
    setShowPattern(true)
    setShowRecreate(false)
    setShowFeedback(false)
    setCountdown(3)

    // Show pattern for configured time
    setTimeout(() => {
      setShowPattern(false)
      // Start countdown
      let count = 3
      const countdownInterval = setInterval(() => {
        count--
        setCountdown(count)
        if (count <= 0) {
          clearInterval(countdownInterval)
          setShowRecreate(true)
        }
      }, 1000)
    }, getDisplayTime())
  }

  function handleCellClick(index: number, itemData: { value: string; imageUrl?: string; type: 'emoji' | 'image' }) {
    if (!showRecreate || showFeedback) return

    const newUserPattern = [...userPattern]
    newUserPattern[index] = {
      ...newUserPattern[index],
      value: itemData.value,
      emoji: itemData.value,
      imageUrl: itemData.imageUrl,
      isImage: itemData.type === 'image'
    }
    setUserPattern(newUserPattern)
  }

  function handleSubmit() {
    if (!showRecreate || showFeedback) return

    // Check if all cells are filled
    const allFilled = userPattern.every(cell => cell.value !== '' && cell.value !== '❓')
    if (!allFilled) {
      alert(text.fillAllCells)
      return
    }

    // Check if pattern matches
    const matches = userPattern.every((cell, index) => cell.value === pattern[index].value)
    setIsCorrect(matches)
    setShowFeedback(true)

    if (matches) {
      setCorrectCount(prev => prev + 1)
    } else {
      setMistakes(prev => prev + 1)
    }

    // Move to next round or end game
    setTimeout(() => {
      if (currentRound >= totalRounds) {
        handleGameEnd()
      } else {
        setCurrentRound(prev => prev + 1)
        startNewRound()
      }
    }, 2000)
  }

  function handleClearPattern() {
    setUserPattern(pattern.map(cell => ({ 
      ...cell, 
      value: '', 
      emoji: '❓',
      imageUrl: undefined,
      isImage: false
    })))
  }

  const handleGameEnd = async () => {
    if (gameCompleted) return
    setGameCompleted(true)

    const accuracy = (correctCount / totalRounds) * 100
    const isSuccess = correctCount >= Math.ceil(totalRounds * 0.6) // 60% success rate
    
    // Calculate score
    const maxScore = 100
    const mistakePenalty = mistakes * 10
    const timeBonus = timeElapsed < 60 ? 10 : timeElapsed < 120 ? 5 : 0
    const accuracyBonus = accuracy >= 90 ? 15 : accuracy >= 80 ? 10 : accuracy >= 70 ? 5 : 0
    const score = Math.max(0, Math.round(maxScore - mistakePenalty + timeBonus + accuracyBonus))

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
        correctSequence: pattern.map(c => c.value),
        userSequence: userPattern.map(c => c.value),
        metSuccessCriteria: isSuccess, // Store actual success for analytics
        accuracy: accuracy
      }
    })

    setTimeout(() => {
      // Always mark as complete, score reflects performance
      onComplete(true, score)
    }, 2000)
  }

  const gridSize = getGridSize()
  const patternItems = getPatternItems()

  if (gameCompleted) {
    const accuracy = (correctCount / totalRounds) * 100
    const isSuccess = correctCount >= Math.ceil(totalRounds * 0.6)
    
    return (
      <div className="text-center py-12">
        <div className={`text-6xl mb-4 ${isSuccess ? 'text-green-600' : 'text-yellow-600'}`}>
          {isSuccess ? '🎉' : '💪'}
        </div>
        <h3 className="text-3xl font-bold mb-2">
          {isSuccess ? text.excellentMemory : text.keepPracticing}
        </h3>
        <p className="text-gray-600 mb-4 text-xl">
          {text.gotCorrect.replace('{correct}', correctCount.toString()).replace('{total}', totalRounds.toString())}
        </p>
        <p className="text-gray-500">
          {text.accuracy2} {accuracy.toFixed(0)}% | {text.time}: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
        </p>
      </div>
    )
  }

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-4">{language === 'ar' ? game.name_ar || game.name : game.name}</h2>
          <p className="text-gray-600 text-center mb-6 text-lg">{language === 'ar' ? game.description_ar || game.description : game.description}</p>

          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-blue-800 mb-3">{text.howToPlay}</h3>
            <ol className="space-y-2 text-blue-900">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>{text.patternAppear} <strong>{text.memorize}</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>{text.patternDisappear}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>{text.recreatePattern}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">4.</span>
                <span>{text.submitAnswer}</span>
              </li>
            </ol>
          </div>

          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">{text.rounds}</div>
                <div className="text-2xl font-bold text-purple-600">{totalRounds}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">{text.gridSize}</div>
                <div className="text-2xl font-bold text-purple-600">{gridSize.rows}×{gridSize.cols}</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setGameStarted(true)}
            className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            {text.startGame}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-center mb-2">{language === 'ar' ? game.name_ar || game.name : game.name}</h2>

        {/* Stats */}
        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg mb-6">
          <div className="text-center">
            <div className="text-sm text-gray-600">{text.round}</div>
            <div className="text-2xl font-bold text-blue-600">{currentRound} / {totalRounds}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">{text.correct}</div>
            <div className="text-2xl font-bold text-green-600">✓ {correctCount}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">{text.mistakes}</div>
            <div className="text-2xl font-bold text-red-500">✗ {mistakes}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">{text.time}</div>
            <div className="text-2xl font-bold">
              {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Pattern Display Phase */}
        {showPattern && (
          <div className="text-center mb-6">
            <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-4 mb-4">
              <p className="text-blue-800 font-bold text-xl">{text.memorizePattern}</p>
            </div>
            
            <div 
              className="inline-grid gap-3 p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl shadow-lg"
              style={{
                gridTemplateColumns: `repeat(${gridSize.cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${gridSize.rows}, minmax(0, 1fr))`
              }}
            >
               {pattern.map((cell, index) => (
                 <div
                   key={cell.id}
                   className="w-20 h-20 bg-white rounded-lg flex items-center justify-center text-4xl shadow-md border-2 border-purple-300 overflow-hidden"
                 >
                   {cell.isImage && cell.imageUrl ? (
                     <img 
                       src={cell.imageUrl} 
                       alt={cell.value}
                       className="w-full h-full object-cover"
                     />
                   ) : (
                     <span>{cell.emoji}</span>
                   )}
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* Countdown Phase */}
        {!showPattern && !showRecreate && countdown > 0 && (
          <div className="text-center py-20">
            <div className="text-8xl font-bold text-purple-600 animate-pulse mb-4">
              {countdown}
            </div>
            <p className="text-xl text-gray-600">{text.getReady}</p>
          </div>
        )}

        {/* Recreation Phase */}
        {showRecreate && (
          <div className="text-center">
            <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4 mb-4">
              <p className="text-green-800 font-bold text-xl">{text.recreate}</p>
            </div>

            {/* User Pattern Grid */}
            <div 
              className="inline-grid gap-3 p-6 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl shadow-lg mb-6"
              style={{
                gridTemplateColumns: `repeat(${gridSize.cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${gridSize.rows}, minmax(0, 1fr))`
              }}
            >
               {userPattern.map((cell, index) => (
                 <div key={cell.id} className="relative">
                   <button
                     className={`w-20 h-20 rounded-lg flex items-center justify-center text-4xl shadow-md border-2 transition-all overflow-hidden ${
                       cell.value === '' || cell.value === '❓'
                         ? 'bg-gray-200 border-gray-400 hover:bg-gray-300'
                         : 'bg-white border-green-400'
                     } ${showFeedback ? (cell.value === pattern[index].value ? 'border-green-500 bg-green-100' : 'border-red-500 bg-red-100') : ''}`}
                     onClick={() => {
                       // Cycle through available items
                       const currentIndex = patternItems.findIndex(item => item.value === cell.value)
                       const nextIndex = (currentIndex + 1) % patternItems.length
                       handleCellClick(index, patternItems[nextIndex])
                     }}
                     disabled={showFeedback}
                   >
                     {cell.isImage && cell.imageUrl ? (
                       <img 
                         src={cell.imageUrl} 
                         alt={cell.value}
                         className="w-full h-full object-cover"
                       />
                     ) : (
                       <span>{cell.emoji}</span>
                     )}
                   </button>
                 </div>
               ))}
            </div>

             {/* Item Selector */}
             <div className="mb-6">
               <p className="text-sm text-gray-600 mb-3">{text.clickCellsInstruction}</p>
               <div className="flex flex-wrap justify-center gap-2">
                 {patternItems.map((item, index) => (
                   <button
                     key={index}
                     className="w-14 h-14 bg-white rounded-lg flex items-center justify-center text-3xl shadow hover:shadow-md hover:scale-110 transition-all border-2 border-gray-300 hover:border-purple-500 overflow-hidden"
                     disabled={showFeedback}
                     onClick={() => {
                       // Find first empty cell and fill it
                       const emptyIndex = userPattern.findIndex(c => c.value === '' || c.value === '❓')
                       if (emptyIndex !== -1) {
                         handleCellClick(emptyIndex, item)
                       }
                     }}
                   >
                     {item.type === 'image' && item.imageUrl ? (
                       <img 
                         src={item.imageUrl} 
                         alt={item.value}
                         className="w-full h-full object-cover"
                       />
                     ) : (
                       <span>{item.value}</span>
                     )}
                   </button>
                 ))}
               </div>
             </div>

            {/* Action Buttons */}
            {!showFeedback && (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleClearPattern}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-all"
                >
                  {text.clear}
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:shadow-lg transition-all hover:scale-105"
                >
                  {text.submitAnswer}
                </button>
              </div>
            )}

            {/* Feedback */}
            {showFeedback && (
              <div className={`mt-4 p-4 rounded-lg ${
                isCorrect 
                  ? 'bg-green-100 border-2 border-green-400 text-green-800' 
                  : 'bg-red-100 border-2 border-red-400 text-red-800'
              }`}>
                <div className="text-3xl mb-2">{isCorrect ? '✅' : '❌'}</div>
                <p className="font-bold text-xl">
                  {isCorrect ? text.perfectRight : text.notQuite}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


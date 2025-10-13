"use client"
import { useState, useEffect } from "react"
import QuizProgress from "./QuizProgress"
import QuestionCard from "./QuestionCard"
import { QuizQuestion } from "@/types/quiz"

export default function InitialQuiz({
  quizQuestions,
  language = "en",
}: {
  quizQuestions: QuizQuestion[]
  language?: "en" | "ar"
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canProceed, setCanProceed] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [finalScore, setFinalScore] = useState<number | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // Load saved progress from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProgress = localStorage.getItem('quiz_progress')
      const savedAnswers = localStorage.getItem('quiz_answers')
      
      if (savedProgress) {
        const progressData = JSON.parse(savedProgress)
        setCurrentQuestion(progressData.currentQuestion || 0)
      }
      
      if (savedAnswers) {
        const parsedAnswers = JSON.parse(savedAnswers)
        setAnswers(parsedAnswers)
        
        // If there are saved answers, set quiz_started cookie
        if (Object.keys(parsedAnswers).length > 0) {
          document.cookie = "quiz_started=true; path=/; max-age=2592000" // 30 days
        }
        
        // Check if current question has an answer to enable proceed button
        const savedProgress = localStorage.getItem('quiz_progress')
        if (savedProgress) {
          const progressData = JSON.parse(savedProgress)
          const currentQ = quizQuestions?.[progressData.currentQuestion || 0]
          if (currentQ && parsedAnswers[currentQ.id] !== undefined) {
            setCanProceed(true)
          }
        }
      }
    }
    setIsLoaded(true)
  }, [quizQuestions])

  // Save progress to localStorage whenever currentQuestion or answers change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('quiz_progress', JSON.stringify({
        currentQuestion,
        timestamp: Date.now()
      }))
    }
  }, [currentQuestion, isLoaded])

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('quiz_answers', JSON.stringify(answers))
    }
  }, [answers, isLoaded])

  const currentQ = quizQuestions?.[currentQuestion]
  
  // Calculate progress based on current question and total questions
  const progress = isCompleted
    ? 100
    : (quizQuestions?.length ? ((currentQuestion + 1) / quizQuestions.length) * 100 : 0)

  const computeScore = () => {
    // Map indices to weights: Always=3, Often=2, Sometimes=1, Never=0
    const weights = [3, 2, 1, 0]
    return Object.values(answers).reduce((sum, index) => sum + (weights[index] ?? 0), 0)
  }

  const handleAnswer = (id: number, answer: number) => {
    setAnswers({ ...answers, [id]: answer })
    setCanProceed(true)
    
    // Set quiz_started cookie on first answer
    if (Object.keys(answers).length === 0 && typeof window !== 'undefined') {
      document.cookie = "quiz_started=true; path=/; max-age=2592000" // 30 days
    }
  }

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setCanProceed(false)
    } else {
      // Reached end: show calculating state then reveal score
      setIsCompleted(true)
      setIsCalculating(true)
      setTimeout(() => {
        const score = computeScore()
        setFinalScore(score)
        setIsCalculating(false)
      }, 10000) // 10 seconds fake calculation
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setCanProceed(false)
    }
  }

  const handleStartOver = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('quiz_progress')
      localStorage.removeItem('quiz_answers')
      // Clear quiz_started cookie
      document.cookie = "quiz_started=; path=/; max-age=0"
    }
    setCurrentQuestion(0)
    setAnswers({})
    setCanProceed(false)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const score = finalScore ?? computeScore()
      
      
      localStorage.removeItem('quiz_progress')
      localStorage.removeItem('quiz_answers')
      // Set quiz completion cookie and clear quiz_started
      document.cookie = "quiz_completed=true; path=/; max-age=2592000" // 30 days
      document.cookie = "quiz_started=; path=/; max-age=0"

      // Stay on page and show saved results instead of redirecting
      setHasSubmitted(true)
    } catch (error) {
      console.error('Error submitting quiz:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGetStarted = () => {
    try {
      const score = finalScore ?? computeScore()
      const maxScore = (quizQuestions?.length || 0) * 3
      if (typeof window !== 'undefined') {
        // Persist final score and answers for post-signup user creation
        localStorage.setItem('pending_signup_quiz', JSON.stringify({
          score,
          maxScore,
          answers,
          type: 'INITIAL',
          timestamp: Date.now()
        }))

        // Clear transient progress keys
        localStorage.removeItem('quiz_progress')
        localStorage.removeItem('quiz_answers')

        // Optional cookie to mark completion and clear quiz_started
        document.cookie = "quiz_completed=true; path=/; max-age=2592000"
        document.cookie = "quiz_started=; path=/; max-age=0"
      }
    } catch (e) {
      // no-op; redirect regardless so the flow continues
    } finally {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signup'
      }
    }
  }

  // Text translations
  const text = {
    en: {
      loadingQuestions: "Loading questions...",
      restoringProgress: "Restoring progress...",
      calculatingScore: "Calculating your score",
      calculatingMessage: "This takes about 10 seconds. Hang tight…",
      yourScore: "Your Preliminary Score",
      getStarted: "Get Started",
      resultsSaved: "Results saved successfully.",
      yourTotalScore: "Your total score:",
      takeAgain: "Take Again",
      previous: "Previous",
      startOver: "Start Over",
      question: "Question",
      of: "of",
      submitting: "Submitting...",
      completeQuiz: "Complete Quiz",
      next: "Next",
    },
    ar: {
      loadingQuestions: "جارٍ تحميل الأسئلة...",
      restoringProgress: "جارٍ استعادة التقدم...",
      calculatingScore: "جارٍ حساب نتيجتك",
      calculatingMessage: "سيستغرق هذا حوالي ١٠ ثوانٍ. انتظر قليلاً...",
      yourScore: "نتيجتك الأولية",
      getStarted: "ابدأ الآن",
      resultsSaved: "تم حفظ النتائج بنجاح.",
      yourTotalScore: "نتيجتك الإجمالية:",
      takeAgain: "إعادة الاختبار",
      previous: "السابق",
      startOver: "البدء من جديد",
      question: "سؤال",
      of: "من",
      submitting: "جارٍ الإرسال...",
      completeQuiz: "إكمال الاختبار",
      next: "التالي",
    },
  }

  const t = text[language]

  // Don't render if no questions are loaded or progress is still being restored
  if (!quizQuestions || quizQuestions.length === 0) {
    return <div>{t.loadingQuestions}</div>
  }

  if (!isLoaded) {
    return <div>{t.restoringProgress}</div>
  }

  // Completed states
  if (isCompleted) {
    return (
      <div>
        <QuizProgress
          current={quizQuestions.length}
          total={quizQuestions.length}
          progress={100}
          language={language}
        />
        <div className="mb-8">
          <div className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 p-10 text-center">
            {isCalculating ? (
              <div>
                <div className="mx-auto mb-6 w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.calculatingScore}</h2>
                <p className="text-gray-600">{t.calculatingMessage}</p>
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.yourScore}</h2>
                <div className="mx-auto inline-flex items-center justify-center px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl mb-6">
                  <span className="text-3xl font-extrabold">{finalScore}</span>
                  <span className={language === "ar" ? "mr-2 opacity-90" : "ml-2 opacity-90"}>/ {quizQuestions.length * 3}</span>
                </div>
                {!hasSubmitted ? (
                  <div className="flex justify-center gap-4">
                    <button onClick={handleGetStarted} disabled={isSubmitting} className="px-16 py-4 text-black rounded-2xl font-semibold transition-all duration-300 shadow-xl disabled:opacity-50">{t.getStarted}</button>
                  </div>
                ) : (
                  <div>
                    <div className="text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 inline-block">{t.resultsSaved}</div>
                    <div className="mt-4 text-gray-700">{t.yourTotalScore} <span className="font-bold">{finalScore} / {quizQuestions.length * 3}</span></div>
                    <div className="mt-6">
                      <button
                        onClick={handleStartOver}
                        className="px-8 py-4 bg-white text-gray-700 rounded-2xl font-semibold border border-gray-300 hover:bg-gray-50 transition-all duration-300 shadow-sm"
                      >
                        {t.takeAgain}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Default quiz flow
  return (
    <div>
      {/* Progress Bar */}
      <QuizProgress
        current={currentQuestion + 1}
        total={quizQuestions.length}
        progress={progress}
        language={language}
      />

      {/* Question Card */}
      <div className="mb-8">
        <QuestionCard
          question={currentQ}
          selectedAnswer={answers[currentQ.id]}
          onAnswer={(answer) => handleAnswer(currentQ.id, answer)}
          language={language}
        />
      </div>

      {/* Navigation */}
      <div className={`flex justify-between items-center ${language === "ar" ? "flex-row-reverse" : ""}`}>
        <div className={`flex gap-4 ${language === "ar" ? "flex-row-reverse" : ""}`}>
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="group px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-200 hover:to-gray-300 transition-all duration-300 transform hover:scale-105 shadow-lg border border-gray-300"
          >
            <div className={`flex items-center ${language === "ar" ? "space-x-reverse space-x-2" : "space-x-2"}`}>
              <svg className={`w-5 h-5 group-hover:${language === "ar" ? "translate-x-1" : "-translate-x-1"} transition-transform duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={language === "ar" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
              </svg>
              <span>{t.previous}</span>
            </div>
          </button>
          
          <button
            onClick={handleStartOver}
            className="group px-6 py-4 bg-gradient-to-r from-red-100 to-pink-100 text-red-700 rounded-2xl font-semibold hover:from-red-200 hover:to-pink-200 transition-all duration-300 transform hover:scale-105 shadow-lg border border-red-300"
          >
            <div className={`flex items-center ${language === "ar" ? "space-x-reverse space-x-2" : "space-x-2"}`}>
              <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{t.startOver}</span>
            </div>
          </button>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">{t.question}</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {currentQuestion + 1} {t.of} {quizQuestions.length}
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
          className="group px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-xl disabled:transform-none"
        >
          <div className={`flex items-center ${language === "ar" ? "space-x-reverse space-x-2" : "space-x-2"}`}>
            <span>
              {isSubmitting
                ? t.submitting
                : currentQuestion === quizQuestions.length - 1
                ? t.completeQuiz
                : t.next}
            </span>
            {!isSubmitting && (
              <svg className={`w-5 h-5 group-hover:${language === "ar" ? "-translate-x-1" : "translate-x-1"} transition-transform duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={language === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
              </svg>
            )}
          </div>
        </button>
      </div>
    </div>
  )
}

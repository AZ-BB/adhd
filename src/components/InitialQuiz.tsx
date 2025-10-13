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
  const [diagnosis, setDiagnosis] = useState<{
    inattentionScore: number
    hyperactivityScore: number
    impulsivityScore: number
    totalScore: number
    severity: 'mild' | 'moderate' | 'severe'
    diagnoses: Array<{ type: string; detected: boolean; score: number }>
  } | null>(null)

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
        
        // Check if all questions have been answered
        if (quizQuestions && Object.keys(parsedAnswers).length === quizQuestions.length) {
          const allQuestionsAnswered = quizQuestions.every(q => parsedAnswers[q.id] !== undefined)
          if (allQuestionsAnswered) {
            // All questions answered - show results immediately
            setIsCompleted(true)
            setIsCalculating(true)
            setTimeout(() => {
              const diagnosisResult = getDiagnosis(parsedAnswers)
              setFinalScore(diagnosisResult.totalScore)
              setDiagnosis(diagnosisResult)
              setIsCalculating(false)
            }, 2000) // Shorter delay since it's a restore
            setIsLoaded(true)
            return
          }
        }
        
        // Check if current question has an answer to enable proceed button
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
    // Map indices to weights: Never=0, Sometimes=1, Often=2, Always=3
    const weights = [3, 2, 1, 0] // [Always, Often, Sometimes, Never]
    return Object.values(answers).reduce((sum, index) => sum + (weights[index] ?? 0), 0)
  }

  const computeCategoryScores = (answersToUse?: Record<number, number>) => {
    // Map indices to weights: Never=0, Sometimes=1, Often=2, Always=3
    const weights = [3, 2, 1, 0] // [Always, Often, Sometimes, Never]
    
    let inattentionScore = 0
    let hyperactivityScore = 0
    let impulsivityScore = 0
    
    const answersData = answersToUse || answers
    
    Object.entries(answersData).forEach(([questionId, answerIndex]) => {
      const question = quizQuestions.find(q => q.id === Number(questionId))
      if (!question) return
      
      const score = weights[answerIndex] ?? 0
      const category = question.category?.toLowerCase() || ''
      
      if (category.includes('inattention') || category.includes('انتباه')) {
        inattentionScore += score
      } else if (category.includes('hyperactivity') || category.includes('حركة')) {
        hyperactivityScore += score
      } else if (category.includes('impulsivity') || category.includes('اندفاع')) {
        impulsivityScore += score
      }
    })
    
    return { inattentionScore, hyperactivityScore, impulsivityScore }
  }

  const getDiagnosis = (answersToUse?: Record<number, number>) => {
    const answersData = answersToUse || answers
    const { inattentionScore, hyperactivityScore, impulsivityScore } = computeCategoryScores(answersData)
    
    // Calculate total score
    const weights = [3, 2, 1, 0]
    const totalScore = Object.values(answersData).reduce((sum, index) => sum + (weights[index] ?? 0), 0)
    
    const diagnoses = []
    
    // Check for Inattention
    if (inattentionScore >= 18) {
      diagnoses.push({
        type: 'inattention',
        detected: true,
        score: inattentionScore
      })
    }
    
    // Check for Hyperactivity
    if (hyperactivityScore >= 18) {
      diagnoses.push({
        type: 'hyperactivity',
        detected: true,
        score: hyperactivityScore
      })
    }
    
    // Check for Impulsivity
    if (impulsivityScore >= 18) {
      diagnoses.push({
        type: 'impulsivity',
        detected: true,
        score: impulsivityScore
      })
    }
    
    // Determine severity
    let severity: 'mild' | 'moderate' | 'severe' = 'mild'
    if (totalScore >= 101) {
      severity = 'severe'
    } else if (totalScore >= 71) {
      severity = 'moderate'
    } else if (totalScore >= 40) {
      severity = 'mild'
    }
    
    return {
      inattentionScore,
      hyperactivityScore,
      impulsivityScore,
      totalScore,
      severity,
      diagnoses
    }
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
        const diagnosisResult = getDiagnosis(answers)
        setFinalScore(diagnosisResult.totalScore)
        setDiagnosis(diagnosisResult)
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
    setIsCompleted(false)
    setIsCalculating(false)
    setFinalScore(null)
    setDiagnosis(null)
    setHasSubmitted(false)
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
      const categoryScores = diagnosis ? {
        inattentionScore: diagnosis.inattentionScore,
        hyperactivityScore: diagnosis.hyperactivityScore,
        impulsivityScore: diagnosis.impulsivityScore
      } : computeCategoryScores(answers)
      
      if (typeof window !== 'undefined') {
        // Persist final score and answers for post-signup user creation
        localStorage.setItem('pending_signup_quiz', JSON.stringify({
          score,
          maxScore,
          answers,
          type: 'INITIAL',
          timestamp: Date.now(),
          inattentionScore: categoryScores.inattentionScore,
          hyperactivityScore: categoryScores.hyperactivityScore,
          impulsivityScore: categoryScores.impulsivityScore
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
      yourScore: "Your Assessment Results",
      assessmentComplete: "Assessment completed successfully",
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
      inattention: "Inattention Issues Detected",
      hyperactivity: "Hyperactivity Issues Detected",
      impulsivity: "Impulsivity Issues Detected",
      severity: "Severity Level",
      mild: "Mild Symptoms",
      moderate: "Moderate Symptoms",
      severe: "Severe Symptoms",
      diagnosisTitle: "Diagnosis Results",
      inattentionDiagnosis: "The assessment indicates potential difficulties with attention and focus. Your child may have trouble sustaining attention, following through on instructions, or staying organized.",
      hyperactivityDiagnosis: "The assessment indicates potential issues with hyperactivity. Your child may have difficulty sitting still, staying in one place, or controlling excessive movement.",
      impulsivityDiagnosis: "The assessment indicates potential issues with impulsivity. Your child may have difficulty waiting their turn, interrupting others, or acting without thinking about consequences.",
      noIssuesTitle: "No Significant Issues Detected",
      noIssuesDesc: "Based on the assessment, your child's responses fall within the normal range for attention, hyperactivity, and impulsivity. No significant concerns were identified.",
      severityDescLong: {
        mild: "The symptoms are relatively mild and may require monitoring and basic behavioral interventions. Consider consulting with a healthcare professional for guidance.",
        moderate: "The symptoms are moderate and may benefit from professional evaluation and intervention. We recommend scheduling a consultation with a healthcare provider.",
        severe: "The symptoms are severe and warrant immediate professional attention. Please schedule an appointment with a qualified healthcare provider for a comprehensive evaluation."
      }
    },
    ar: {
      loadingQuestions: "جارٍ تحميل الأسئلة...",
      restoringProgress: "جارٍ استعادة التقدم...",
      calculatingScore: "جارٍ حساب نتيجتك",
      calculatingMessage: "سيستغرق هذا حوالي ١٠ ثوانٍ. انتظر قليلاً...",
      yourScore: "نتائج التقييم",
      assessmentComplete: "تم إكمال التقييم بنجاح",
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
      inattention: "تم اكتشاف مشاكل في الانتباه",
      hyperactivity: "تم اكتشاف مشاكل في فرط الحركة",
      impulsivity: "تم اكتشاف مشاكل في الاندفاع",
      severity: "مستوى الشدة",
      mild: "أعراض خفيفة",
      moderate: "أعراض متوسطة",
      severe: "أعراض شديدة",
      diagnosisTitle: "نتائج التشخيص",
      inattentionDiagnosis: "يشير التقييم إلى وجود صعوبات محتملة في الانتباه والتركيز. قد يواجه طفلك صعوبة في الحفاظ على الانتباه أو اتباع التعليمات أو إتمام المهام بشكل منتظم.",
      hyperactivityDiagnosis: "يشير التقييم إلى وجود مؤشرات على فرط الحركة. قد يواجه طفلك صعوبة في الجلوس ساكنًا، أو البقاء في مكان واحد، أو التحكم في الحركة الزائدة.",
      impulsivityDiagnosis: "يشير التقييم إلى وجود مؤشرات على الاندفاع. قد يواجه طفلك صعوبة في انتظار دوره، أو مقاطعة الآخرين، أو التصرف دون التفكير في العواقب.",
      noIssuesTitle: "لم يتم اكتشاف مشاكل كبيرة",
      noIssuesDesc: "بناءً على التقييم، تقع استجابات طفلك ضمن النطاق الطبيعي لكل من الانتباه وفرط الحركة والاندفاع. لم يتم تحديد أي مخاوف كبيرة.",
      severityDescLong: {
        mild: "الأعراض مصنّفة كـ خفيفة وقد تتطلب المراقبة والتدخلات السلوكية الأساسية.",
        moderate: "الأعراض مصنّفة كـ متوسطة وقد تستفيد من التقييم والمتابعة",
        severe: "الأعراض مصنّفة كـ شديدة وتتطلب اهتمامًا أكثر."
      }
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
      <div dir={language === "ar" ? "rtl" : "ltr"}>
        <QuizProgress
          current={quizQuestions.length}
          total={quizQuestions.length}
          progress={100}
          language={language}
        />
        <div className="mb-8">
          <div className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 p-10">
            {isCalculating ? (
              <div className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.calculatingScore}</h2>
                <p className="text-gray-600">{t.calculatingMessage}</p>
              </div>
            ) : diagnosis ? (
              <div>
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.yourScore}</h2>
                  <p className="text-gray-600 text-sm">{t.assessmentComplete}</p>
                </div>

                {/* Diagnosis Results */}
                <div className="space-y-6 mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t.diagnosisTitle}</h3>
                  
                  {/* Inattention Diagnosis */}
                  {diagnosis.inattentionScore >= 18 ? (
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 border-2 border-red-300 shadow-lg">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 bg-red-200">
                          <span className="text-3xl">⚠️</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-base text-red-800 leading-relaxed">
                            {t.inattentionDiagnosis}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Hyperactivity Diagnosis */}
                  {diagnosis.hyperactivityScore >= 18 ? (
                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-8 border-2 border-orange-300 shadow-lg">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 bg-orange-200">
                          <span className="text-3xl">⚠️</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-base text-orange-800 leading-relaxed">
                            {t.hyperactivityDiagnosis}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Impulsivity Diagnosis */}
                  {diagnosis.impulsivityScore >= 18 ? (
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-8 border-2 border-yellow-300 shadow-lg">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 bg-yellow-200">
                          <span className="text-3xl">⚠️</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-base text-yellow-800 leading-relaxed">
                            {t.impulsivityDiagnosis}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* No Issues Detected */}
                  {diagnosis.inattentionScore < 18 && diagnosis.hyperactivityScore < 18 && diagnosis.impulsivityScore < 18 ? (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-300 shadow-lg">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 bg-green-200">
                          <span className="text-3xl">✅</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-2xl font-bold text-green-900 mb-3">{t.noIssuesTitle}</h4>
                          <p className="text-base text-green-800 leading-relaxed">
                            {t.noIssuesDesc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Severity Level - only if issues detected */}
                  {(diagnosis.inattentionScore >= 18 || diagnosis.hyperactivityScore >= 18 || diagnosis.impulsivityScore >= 18) && diagnosis.totalScore >= 40 && (
                    <div className={`bg-gradient-to-br rounded-2xl p-8 border-2 shadow-lg ${
                      diagnosis.severity === 'severe' 
                        ? 'from-purple-50 to-pink-50 border-purple-300' 
                        : diagnosis.severity === 'moderate'
                        ? 'from-blue-50 to-indigo-50 border-blue-300'
                        : 'from-cyan-50 to-sky-50 border-cyan-300'
                    }`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                          diagnosis.severity === 'severe' 
                            ? 'bg-purple-200' 
                            : diagnosis.severity === 'moderate'
                            ? 'bg-blue-200'
                            : 'bg-cyan-200'
                        }`}>
                          <span className="text-3xl">
                            {diagnosis.severity === 'severe' ? '🔴' : diagnosis.severity === 'moderate' ? '🟡' : '🔵'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 mb-2">{t.severity}</h4>
                          <p className="text-2xl font-bold mb-3" style={{
                            color: diagnosis.severity === 'severe' ? '#7c2d92' : diagnosis.severity === 'moderate' ? '#1e40af' : '#0891b2'
                          }}>
                            {diagnosis.severity === 'severe' ? t.severe : diagnosis.severity === 'moderate' ? t.moderate : t.mild}
                          </p>
                          <p className="text-base text-gray-700 leading-relaxed">
                            {t.severityDescLong[diagnosis.severity]}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {!hasSubmitted ? (
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                      onClick={handleGetStarted} 
                      disabled={isSubmitting} 
                      className="px-16 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl font-semibold transition-all duration-300 shadow-xl disabled:opacity-50 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600"
                    >
                      {t.getStarted}
                    </button>
                    <button
                      onClick={handleStartOver}
                      className="px-8 py-4 bg-white text-gray-700 rounded-2xl font-semibold border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-lg"
                    >
                      {t.takeAgain}
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 inline-block mb-4">{t.resultsSaved}</div>
                    <div className="mt-6">
                      <button
                        onClick={handleStartOver}
                        className="px-8 py-4 bg-white text-gray-700 rounded-2xl font-semibold border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-lg"
                      >
                        {t.takeAgain}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
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

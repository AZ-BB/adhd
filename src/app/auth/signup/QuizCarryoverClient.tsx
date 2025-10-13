"use client"

import { useEffect, useState } from "react"

export default function QuizCarryoverClient() {
  const [quizData, setQuizData] = useState<{
    score: number
    inattentionScore: number
    hyperactivityScore: number
    impulsivityScore: number
  } | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pending_signup_quiz")
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed.score === "number") {
        setQuizData({
          score: parsed.score,
          inattentionScore: parsed.inattentionScore || 0,
          hyperactivityScore: parsed.hyperactivityScore || 0,
          impulsivityScore: parsed.impulsivityScore || 0
        })
      }
    } catch {}
  }, [])

  if (!quizData) return null
  return (
    <>
      <input type="hidden" name="initial_quiz_score" value={String(quizData.score)} />
      <input type="hidden" name="inattention_score" value={String(quizData.inattentionScore)} />
      <input type="hidden" name="hyperactivity_score" value={String(quizData.hyperactivityScore)} />
      <input type="hidden" name="impulsivity_score" value={String(quizData.impulsivityScore)} />
    </>
  )
}



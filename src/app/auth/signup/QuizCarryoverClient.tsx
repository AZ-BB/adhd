"use client"

import { useEffect, useState } from "react"

export default function QuizCarryoverClient() {
  const [score, setScore] = useState<number | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pending_signup_quiz")
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed.score === "number") {
        setScore(parsed.score)
      }
    } catch {}
  }, [])

  if (score === null) return null
  return <input type="hidden" name="initial_quiz_score" value={String(score)} />
}



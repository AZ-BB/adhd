
import getInitialQuiz from "@/actions/quizzes"
import InitialQuiz from "@/components/InitialQuiz"
import BackgroundSlideshow from "@/components/BackgroundSlideshow"
import { QuizQuestion } from "@/types/quiz"
import { createSupabaseServerClient } from "@/lib/server"
import { redirect } from "next/navigation"

export default async function InitialQuizPage() {
  // If user is already authenticated, redirect them to the dashboard
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    redirect("/dashboard")
  }
  const { data, error } = await getInitialQuiz()
  if(error) {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-4">
        <BackgroundSlideshow images={["/bg2.jpg", "/bg3.jpg", "/bg4.jpg"]} />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/60 to-white/70"></div>
        <div className="relative z-10 max-w-lg w-full">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-red-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-gray-600">Error: {error.message}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundSlideshow images={["/bg2.jpg", "/bg3.jpg", "/bg4.jpg"]} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/70"></div>
      
      <div className="relative z-10 py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto grid gap-8 md:gap-12 md:grid-cols-12 transform-gpu scale-[.85] origin-top">
          {/* Left: Intro / Hero */}
          <div className="md:col-span-3">
            <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-md border border-white/30 rounded-full px-3 py-1 text-xs text-gray-700 shadow-sm mb-4">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Confidential and evidence-based</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
              ADHD Assessment
            </h1>
            <p className="text-gray-700 leading-relaxed mb-6">
              A concise screening to understand your child's needs and provide
              tailored next steps. Your responses remain private and secure.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-10">
              <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md border border-white/30 rounded-xl px-4 py-3 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">✓</div>
                <span className="text-sm text-gray-700">5–7 minutes</span>
              </div>
              <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md border border-white/30 rounded-xl px-4 py-3 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">★</div>
                <span className="text-sm text-gray-700">Personalized insights</span>
              </div>
              <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md border border-white/30 rounded-xl px-4 py-3 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center">⚑</div>
                <span className="text-sm text-gray-700">Track progress</span>
              </div>
              <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md border border-white/30 rounded-xl px-4 py-3 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">🔒</div>
                <span className="text-sm text-gray-700">Secure & private</span>
              </div>
            </div>
          </div>

          {/* Right: Quiz Panel */}
          <div className="md:col-span-9">
            <div className="bg-white/75 backdrop-blur-md rounded-3xl shadow-2xl border border-white/40 p-5 md:p-6">
              <InitialQuiz quizQuestions={data as QuizQuestion[]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

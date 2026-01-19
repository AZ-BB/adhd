import getInitialQuiz from "@/actions/quizzes"
import InitialQuiz from "@/components/InitialQuiz"
import { QuizQuestion } from "@/types/quiz"
import { createSupabaseServerClient } from "@/lib/server"
import { redirect } from "next/navigation"

export default async function QuizPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const { data, error } = await getInitialQuiz()
  
  if (error) {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-4" dir="rtl">
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/60 to-white/70"></div>
        <div className="relative z-10 max-w-lg w-full">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-red-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">حدث خطأ ما</h2>
              <p className="text-gray-600">خطأ: {error.message}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/70"></div>
      
      {/* Language Switcher */}
      <div className="absolute top-4 left-4 z-20">
        <a
          href="/quiz/en"
          className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-md border border-white/30 rounded-xl text-sm text-gray-700 hover:bg-white shadow-sm transition-all"
        >
          English
        </a>
      </div>
      
      <div className="relative z-10 py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-900 mb-4">
              الاختبار التقييمي
            </h1>
            <p className="text-xl text-indigo-700/80 max-w-2xl mx-auto">
              اختبر مهارات التركيز والانتباه لطفلك
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <InitialQuiz quizQuestions={data as QuizQuestion[]} language="ar" />
          </div>
        </div>
      </div>
    </div>
  )
}

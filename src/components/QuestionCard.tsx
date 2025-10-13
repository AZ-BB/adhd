import { QuizQuestion } from "@/types/quiz"

interface QuestionCardProps {
  question: QuizQuestion
  selectedAnswer?: number
  onAnswer: (answer: number) => void
  language?: "en" | "ar"
}

export default function QuestionCard({ question, selectedAnswer, onAnswer, language = "en" }: QuestionCardProps) {
  const optionsEn = ["Always", "Often", "Sometimes", "Never"]
  const optionsAr = ["دائمًا", "غالبًا", "أحيانًا", "أبدًا"]
  const options = language === "ar" ? optionsAr : optionsEn
  
  const optionColors = [
    "from-red-500 to-pink-500",
    "from-orange-500 to-yellow-500", 
    "from-blue-500 to-indigo-500",
    "from-green-500 to-emerald-500"
  ]
  const optionIcons = ["🔥", "⚡", "💙", "✅"]
  
  const tipText = {
    en: {
      tip: "Tip:",
      message: "Choose the option that best describes your child's behavior over the past 6 months. Be honest for the most accurate results."
    },
    ar: {
      tip: "نصيحة:",
      message: "اختر الخيار الذي يصف سلوك طفلك بشكل أفضل خلال الأشهر الستة الماضية. كن صادقًا للحصول على أدق النتائج."
    }
  }
  
  const t = tipText[language]

  return (
    <div className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 p-8 relative overflow-hidden" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        {/* Question Header */}
        <div className="mb-8">
          {/* Category Badge */}
          {(question.category || question.category_ar) && (
            <div className={`inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200 mb-3 ${language === "ar" ? "mr-0" : "ml-0"}`}>
              <span className="text-xs font-semibold text-indigo-700">
                {language === "ar" ? question.category_ar : question.category}
              </span>
            </div>
          )}
          
          <h2 className={`text-2xl font-bold text-gray-900 leading-relaxed ${language === "ar" ? "text-right" : "text-left"}`}>
            {language === "ar" ? question.question_ar : question.question}
          </h2>
        </div>

        {/* Answer Options */}
        <div className="space-y-4">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswer(index)}
              className={`group w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden ${
                selectedAnswer === index
                  ? `border-transparent bg-gradient-to-r ${optionColors[index]} text-white shadow-xl`
                  : 'border-gray-200 hover:border-gray-300 hover:bg-white/30 bg-white/20'
              }`}
            >
              {/* Background gradient for selected state */}
              {selectedAnswer === index && (
                <div className={`absolute inset-0 bg-gradient-to-r ${optionColors[index]} opacity-90`}></div>
              )}
              
              <div className="relative z-10 flex items-center">
                <div className={`w-6 h-6 rounded-full border-2 ${language === "ar" ? "ml-4" : "mr-4"} flex items-center justify-center transition-all duration-300 ${
                  selectedAnswer === index
                    ? 'border-white bg-white/20'
                    : 'border-gray-300 group-hover:border-gray-400'
                }`}>
                  {selectedAnswer === index && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
                
                <div className={`flex items-center ${language === "ar" ? "space-x-reverse space-x-3" : "space-x-3"}`}>
                  <span className="text-2xl">{optionIcons[index]}</span>
                  <span className={`text-lg font-semibold ${
                    selectedAnswer === index ? 'text-white' : 'text-gray-900'
                  }`}>
                    {option}
                  </span>
                </div>
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          ))}
        </div>
        
        {/* Helpful tip */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className={`flex items-start ${language === "ar" ? "space-x-reverse space-x-3" : "space-x-3"}`}>
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className={`text-sm text-blue-800 ${language === "ar" ? "text-right" : "text-left"}`}>
              <strong>{t.tip}</strong> {t.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

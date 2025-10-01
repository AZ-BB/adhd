interface QuizProgressProps {
  current: number
  total: number | undefined
  progress: number
}

export default function QuizProgress({ current, total, progress }: QuizProgressProps) {
  return (
    <div className="bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 mb-8 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Your Progress</h3>
              <p className="text-sm text-gray-600">Keep going! You're doing great</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {current} / {total || 0}
            </div>
            <div className="text-sm text-gray-600">Questions</div>
          </div>
        </div>
        
        {/* Progress Bar Container */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
            <div 
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-700 ease-out relative overflow-hidden shadow-lg"
              style={{ width: `${progress}%` }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
          
          {/* Progress percentage */}
          <div className="absolute -top-8 right-0 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-700 shadow-lg border border-white/30">
            {Math.round(progress)}%
          </div>
        </div>
        
        {/* Motivational message */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {progress < 25 ? "Let's get started! 🚀" :
             progress < 50 ? "You're making great progress! 💪" :
             progress < 75 ? "Almost there! Keep it up! ⭐" :
             progress < 100 ? "Final stretch! You've got this! 🎯" :
             "Amazing work! 🎉"}
          </p>
        </div>
      </div>
    </div>
  )
}

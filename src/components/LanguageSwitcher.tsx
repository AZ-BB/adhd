'use client'

import { useRouter, usePathname } from 'next/navigation'

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const isEnglish = pathname.includes('/en')

  const switchToArabic = () => {
    const newPath = pathname.replace('/en', '') || '/'
    router.push(newPath)
    router.refresh()
  }

  const switchToEnglish = () => {
    const newPath = pathname.includes('/en') ? pathname : `${pathname}/en`
    router.push(newPath)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1 bg-white">
      <button
        onClick={switchToEnglish}
        className={`px-3 py-1 rounded text-xs font-medium transition ${
          isEnglish 
            ? 'bg-indigo-600 text-white' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        EN
      </button>
      <button
        onClick={switchToArabic}
        className={`px-3 py-1 rounded text-xs font-medium transition ${
          !isEnglish 
            ? 'bg-indigo-600 text-white' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        AR
      </button>
    </div>
  )
}


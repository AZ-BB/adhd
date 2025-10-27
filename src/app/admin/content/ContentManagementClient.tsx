'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { LearningDay, Game } from '@/types/learning-path'
import DayManagement from './components/DayManagement'
import GameManagement from './components/GameManagement'
import DayGameAssignments from './components/DayGameAssignments'

interface ContentManagementClientProps {
  initialDays: LearningDay[]
  initialGames: Game[]
}

type TabType = 'days' | 'games' | 'assignments'

export default function ContentManagementClient({ 
  initialDays, 
  initialGames 
}: ContentManagementClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Get active tab from query param or default to 'days'
  const tabParam = searchParams.get('tab') as TabType | null
  const activeTab: TabType = tabParam && ['days', 'games', 'assignments'].includes(tabParam) 
    ? tabParam 
    : 'days'
  
  const setActiveTab = (tab: TabType) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`${pathname}?${params.toString()}`)
  }

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'days', label: 'Learning Days', icon: '📅' },
    { id: 'games', label: 'Games', icon: '🎮' },
    { id: 'assignments', label: 'Assign Games', icon: '🔗' }
  ]

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium
                transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <span className="text-2xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'days' && <DayManagement initialDays={initialDays} />}
        {activeTab === 'games' && <GameManagement initialGames={initialGames} />}
        {activeTab === 'assignments' && (
          <DayGameAssignments days={initialDays} games={initialGames} />
        )}
      </div>
    </div>
  )
}


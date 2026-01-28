'use client'

import { useState } from 'react'
import { Coach, SessionWithCoach } from '@/types/sessions'
import { SoloSessionRequest } from '@/types/solo-sessions'
import SessionsClient from './SessionsClient'
import SoloSessionsClient from '../solo-sessions/SoloSessionsClient'

interface Props {
  initialSessions: SessionWithCoach[]
  coaches: Coach[]
  initialSoloRequests: SoloSessionRequest[]
  isRtl: boolean
  hasGroupSessions: boolean
  hasSubscription?: boolean
}

export default function SessionsHub({ initialSessions, coaches, initialSoloRequests, isRtl, hasGroupSessions, hasSubscription = false }: Props) {
  // Check if there are any free sessions
  const hasFreeSessions = initialSessions.some(s => s.is_free === true)
  
  // Always show group sessions tab - SessionsClient will filter out paid sessions for non-subscribers
  const [tab, setTab] = useState<'group' | 'solo'>('group')

  return (
    <div className="space-y-6">
      <div className="flex gap-3 border-b border-gray-200">
        <button
          onClick={() => setTab('group')}
          className={`pb-2 px-4 font-semibold ${tab === 'group' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          {isRtl ? 'جلسات جماعية' : 'Group Sessions'}
          {hasFreeSessions && !hasGroupSessions && (
            <span className="ml-2 text-xs text-green-600">({isRtl ? 'مجانية' : 'Free'})</span>
          )}
        </button>
        <button
          onClick={() => setTab('solo')}
          className={`pb-2 px-4 font-semibold ${tab === 'solo' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          {isRtl ? 'جلسات 1:1' : '1:1 Sessions'}
        </button>
      </div>

      {tab === 'group' ? (
        <SessionsClient initialSessions={initialSessions} coaches={coaches} isRtl={isRtl} hasSubscription={hasSubscription} />
      ) : (
        <SoloSessionsClient coaches={coaches} initialRequests={initialSoloRequests} isRtl={isRtl} />
      )}
    </div>
  )
}











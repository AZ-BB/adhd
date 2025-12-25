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
}

export default function SessionsHub({ initialSessions, coaches, initialSoloRequests, isRtl }: Props) {
  const [tab, setTab] = useState<'group' | 'solo'>('group')

  return (
    <div className="space-y-6">
      <div className="flex gap-3 border-b border-gray-200">
        <button
          onClick={() => setTab('group')}
          className={`pb-2 px-4 font-semibold ${tab === 'group' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          {isRtl ? 'جلسات جماعية' : 'Group Sessions'}
        </button>
        <button
          onClick={() => setTab('solo')}
          className={`pb-2 px-4 font-semibold ${tab === 'solo' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          {isRtl ? 'جلسات 1:1' : '1:1 Sessions'}
        </button>
      </div>

      {tab === 'group' ? (
        <SessionsClient initialSessions={initialSessions} coaches={coaches} isRtl={isRtl} />
      ) : (
        <SoloSessionsClient coaches={coaches} initialRequests={initialSoloRequests} isRtl={isRtl} />
      )}
    </div>
  )
}











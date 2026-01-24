'use client'

import { useState, useEffect } from 'react'
import { Coach, SessionWithCoach } from '@/types/sessions'
import { SoloSessionRequest } from '@/types/solo-sessions'
import SessionsClient from './SessionsClient'
import SoloSessionsClient from '../solo-sessions/SoloSessionsClient'
import Link from 'next/link'

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
  
  // Allow group sessions tab if user has subscription OR there are free sessions
  const canAccessGroupSessions = hasGroupSessions || hasFreeSessions
  
  // Default to solo tab if user doesn't have group sessions subscription and no free sessions
  const [tab, setTab] = useState<'group' | 'solo'>(canAccessGroupSessions ? 'group' : 'solo')

  return (
    <div className="space-y-6">
      <div className="flex gap-3 border-b border-gray-200">
        {canAccessGroupSessions ? (
          <button
            onClick={() => setTab('group')}
            className={`pb-2 px-4 font-semibold ${tab === 'group' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          >
            {isRtl ? 'جلسات جماعية' : 'Group Sessions'}
            {hasFreeSessions && !hasGroupSessions && (
              <span className="ml-2 text-xs text-green-600">({isRtl ? 'مجانية' : 'Free'})</span>
            )}
          </button>
        ) : (
          <div className="pb-2 px-4 font-semibold text-gray-400 cursor-not-allowed flex items-center gap-2">
            <span>{isRtl ? 'جلسات جماعية' : 'Group Sessions'}</span>
            <span className="text-xs">🔒</span>
            <Link 
              href={isRtl ? '/pricing' : '/en/pricing'}
              className="text-xs text-indigo-600 hover:text-indigo-700 underline ml-2"
              onClick={(e) => e.stopPropagation()}
            >
              {isRtl ? '(يتطلب اشتراك)' : '(Requires subscription)'}
            </Link>
          </div>
        )}
        <button
          onClick={() => setTab('solo')}
          className={`pb-2 px-4 font-semibold ${tab === 'solo' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          {isRtl ? 'جلسات 1:1' : '1:1 Sessions'}
        </button>
      </div>

      {tab === 'group' ? (
        canAccessGroupSessions ? (
          <SessionsClient initialSessions={initialSessions} coaches={coaches} isRtl={isRtl} hasSubscription={hasSubscription} />
        ) : (
          <div className="bg-white rounded-xl p-8 text-center border-2 border-gray-200">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {isRtl ? 'الجلسات الجماعية غير متاحة' : 'Group Sessions Not Available'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isRtl 
                ? 'يتطلب اشتراك الجلسات الجماعية للوصول إلى هذا المحتوى'
                : 'Group Sessions subscription is required to access this content'}
            </p>
            <Link
              href={isRtl ? '/pricing' : '/en/pricing'}
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all"
            >
              {isRtl ? 'اشترك الآن' : 'Subscribe Now'}
            </Link>
          </div>
        )
      ) : (
        <SoloSessionsClient coaches={coaches} initialRequests={initialSoloRequests} isRtl={isRtl} />
      )}
    </div>
  )
}











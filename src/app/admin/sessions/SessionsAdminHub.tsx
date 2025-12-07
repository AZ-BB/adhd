'use client'

import { useState } from "react"
import { Coach, SessionWithCoach } from "@/types/sessions"
import { SoloSessionRequest } from "@/types/solo-sessions"
import SessionsAdminClient from "./SessionsAdminClient"
import SoloSessionsAdminClient from "../solo-sessions/SoloSessionsAdminClient"

interface Props {
  initialCoaches: Coach[]
  initialSessions: SessionWithCoach[]
  initialSoloRequests: SoloSessionRequest[]
}

export default function SessionsAdminHub({ initialCoaches, initialSessions, initialSoloRequests }: Props) {
  const [tab, setTab] = useState<'group' | 'solo'>('group')

  return (
    <div className="space-y-6">
      <div className="flex gap-3 border-b border-gray-200">
        <button
          onClick={() => setTab('group')}
          className={`pb-2 px-4 font-semibold ${tab === 'group' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          Group Sessions
        </button>
        <button
          onClick={() => setTab('solo')}
          className={`pb-2 px-4 font-semibold ${tab === 'solo' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          1:1 Requests
        </button>
      </div>

      {tab === 'group' ? (
        <SessionsAdminClient initialCoaches={initialCoaches} initialSessions={initialSessions} />
      ) : (
        <SoloSessionsAdminClient initialRequests={initialSoloRequests} coaches={initialCoaches} />
      )}
    </div>
  )
}




import { getAllLearningDays, getAllGames } from '@/actions/content-management'
import ContentManagementClient from './ContentManagementClient'

export default async function AdminContentPage() {
  const [days, games] = await Promise.all([
    getAllLearningDays(),
    getAllGames()
  ])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white">Content Management</h1>
        <p className="text-gray-400 mt-1">Manage learning days, games, and assignments</p>
      </div>

      <ContentManagementClient initialDays={days} initialGames={games} />
    </div>
  )
}

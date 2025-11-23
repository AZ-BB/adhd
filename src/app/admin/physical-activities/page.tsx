import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/server"
import { getAllPhysicalActivityVideos } from "@/actions/physical-activities"
import PhysicalActivitiesAdminClient from "./PhysicalActivitiesAdminClient"

export const metadata = {
  title: "Physical Activities Management | Admin",
  description: "Manage physical activity videos",
}

export default async function PhysicalActivitiesAdminPage() {
  const supabase = await createSupabaseServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }
  
  // Check if user is admin
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("auth_id", user.id)
    .maybeSingle()
  
  if (!userData || (userData.role !== "admin" && userData.role !== "super_admin")) {
    redirect("/dashboard")
  }
  
  // Get all physical activity videos
  const videos = await getAllPhysicalActivityVideos()
  
  if ('error' in videos) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl">Error loading videos</p>
          <p className="text-gray-600 mt-2">{videos.error}</p>
        </div>
      </div>
    )
  }
  
  return <PhysicalActivitiesAdminClient videos={videos} />
}


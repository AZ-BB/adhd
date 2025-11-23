import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/server"
import { getTodaysPhysicalActivity } from "@/actions/physical-activities"
import PhysicalActivityClientEn from "./PhysicalActivityClientEn"

export default async function PhysicalActivitiesPageEn() {
  const supabase = await createSupabaseServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login/en")
  }
  
  // Get user profile
  const { data: profile } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single()
  
  if (!profile) {
    redirect("/auth/login/en")
  }
  
  // Get today's physical activity
  const activityInfo = await getTodaysPhysicalActivity(profile.id)
  
  if ('error' in activityInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl">Error loading activity</p>
          <p className="text-gray-600 mt-2">{activityInfo.error}</p>
        </div>
      </div>
    )
  }
  
  return <PhysicalActivityClientEn activityInfo={activityInfo} userId={profile.id} />
}


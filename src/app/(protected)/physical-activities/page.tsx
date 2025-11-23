import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/server"
import { getTodaysPhysicalActivity, recordPhysicalActivityWatch } from "@/actions/physical-activities"
import PhysicalActivityClientAr from "./PhysicalActivityClientAr"

export default async function PhysicalActivitiesPage() {
  const supabase = await createSupabaseServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }
  
  // Get user profile
  const { data: profile } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single()
  
  if (!profile) {
    redirect("/auth/login")
  }
  
  // Get today's physical activity
  const activityInfo = await getTodaysPhysicalActivity(profile.id)
  
  if ('error' in activityInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600 text-xl">حدث خطأ في تحميل النشاط</p>
          <p className="text-gray-600 mt-2">{activityInfo.error}</p>
        </div>
      </div>
    )
  }
  
  return <PhysicalActivityClientAr activityInfo={activityInfo} userId={profile.id} />
}


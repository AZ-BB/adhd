import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/server"

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("users")
    .select(
      "id, created_at, child_first_name, child_last_name, child_birthday, child_gender, child_profile_picture, parent_first_name, parent_last_name, parent_phone, parent_nationality, initial_quiz_score"
    )
    .eq("auth_id", user.id)
    .maybeSingle()

  function formatDate(value?: string | null) {
    if (!value) return ""
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ""
    return d.toISOString().split("T")[0]
  }

  function calculateAge(value?: string | null) {
    if (!value) return null
    const birth = new Date(value)
    if (Number.isNaN(birth.getTime())) return null
    const now = new Date()
    let age = now.getFullYear() - birth.getFullYear()
    const hasNotHadBirthdayThisYear =
      now.getMonth() < birth.getMonth() ||
      (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
    if (hasNotHadBirthdayThisYear) age -= 1
    return age
  }

  async function updateProfile(formData: FormData) {
    "use server"
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const updates = {
      child_first_name: formData.get("child_first_name") as string,
      child_last_name: formData.get("child_last_name") as string,
      child_birthday: formData.get("child_birthday") as string,
      child_gender: formData.get("child_gender") as string,
      parent_first_name: formData.get("parent_first_name") as string,
      parent_last_name: formData.get("parent_last_name") as string,
      parent_phone: formData.get("parent_phone") as string,
      parent_nationality: formData.get("parent_nationality") as string,
    }

    await supabase
      .from("users")
      .update(updates)
      .eq("auth_id", user.id)

    redirect("/profile")
  }

  const age = calculateAge(profile?.child_birthday)

  return (
    <div className="max-w-5xl mx-auto">
      {!profile ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="rounded-3xl border-4 border-dashed border-purple-300 bg-white/90 p-8 max-w-md text-center shadow-2xl">
            <div className="text-6xl mb-4">🎈</div>
            <p className="text-xl font-bold text-gray-900 mb-2">No Profile Yet!</p>
            <p className="text-gray-600">
              Complete your signup to create your profile.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 text-9xl opacity-20">👤</div>
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white/30 backdrop-blur border-4 border-white flex items-center justify-center text-5xl">
                {profile.child_gender === "Male" ? "👦" : profile.child_gender === "Female" ? "👧" : "🧒"}
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black mb-2">
                  {profile.child_first_name} {profile.child_last_name}
                </h1>
                <p className="text-xl md:text-2xl font-semibold opacity-90">
                  {age} Years Old
                </p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form action={updateProfile} className="space-y-6">
            {/* Child Information */}
            <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-xl border-4 border-blue-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-4xl">🧒</div>
                <h2 className="text-2xl font-black text-gray-800">Child Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="child_first_name" className="block text-sm font-bold text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="child_first_name"
                    name="child_first_name"
                    defaultValue={profile.child_first_name}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="child_last_name" className="block text-sm font-bold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="child_last_name"
                    name="child_last_name"
                    defaultValue={profile.child_last_name}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="child_birthday" className="block text-sm font-bold text-gray-700 mb-2">
                    Birthday 🎂
                  </label>
                  <input
                    type="date"
                    id="child_birthday"
                    name="child_birthday"
                    defaultValue={formatDate(profile.child_birthday)}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="child_gender" className="block text-sm font-bold text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    id="child_gender"
                    name="child_gender"
                    defaultValue={profile.child_gender}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-xl border-4 border-purple-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-4xl">👨‍👩‍👧‍👦</div>
                <h2 className="text-2xl font-black text-gray-800">Parent/Guardian Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="parent_first_name" className="block text-sm font-bold text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="parent_first_name"
                    name="parent_first_name"
                    defaultValue={profile.parent_first_name || ""}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="parent_last_name" className="block text-sm font-bold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="parent_last_name"
                    name="parent_last_name"
                    defaultValue={profile.parent_last_name || ""}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="parent_phone" className="block text-sm font-bold text-gray-700 mb-2">
                    Phone Number 📱
                  </label>
                  <input
                    type="tel"
                    id="parent_phone"
                    name="parent_phone"
                    defaultValue={profile.parent_phone || ""}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="parent_nationality" className="block text-sm font-bold text-gray-700 mb-2">
                    Nationality 🌍
                  </label>
                  <input
                    type="text"
                    id="parent_nationality"
                    name="parent_nationality"
                    defaultValue={profile.parent_nationality || ""}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Account Information (Read-only) */}
            <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-xl border-4 border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-4xl">📧</div>
                <h2 className="text-2xl font-black text-gray-800">Account Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="px-4 py-3 rounded-xl bg-gray-100 border-2 border-gray-200 text-gray-600">
                    {user.email}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Initial Quiz Score ⭐
                  </label>
                  <div className="px-4 py-3 rounded-xl bg-gray-100 border-2 border-gray-200 text-gray-600 font-bold">
                    {profile.initial_quiz_score}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Member Since
                  </label>
                  <div className="px-4 py-3 rounded-xl bg-gray-100 border-2 border-gray-200 text-gray-600">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Profile ID
                  </label>
                  <div className="px-4 py-3 rounded-xl bg-gray-100 border-2 border-gray-200 text-gray-600 font-mono text-sm">
                    {profile.id}
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-black shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                💾 Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}




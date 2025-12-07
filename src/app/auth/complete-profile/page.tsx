import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/server"
import { cookies } from "next/headers"

async function completeProfile(formData: FormData) {
  "use server"
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?error=يرجى%20تسجيل%20الدخول%20أولاً")
  }

  const child_first_name = String(formData.get("child_first_name") || "").trim()
  const child_last_name = String(formData.get("child_last_name") || "").trim()
  const child_birthday = String(formData.get("child_birthday") || "").trim()
  const child_gender = String(formData.get("child_gender") || "").trim()
  const parent_first_name = String(formData.get("parent_first_name") || "").trim()
  const parent_last_name = String(formData.get("parent_last_name") || "").trim()
  const parent_phone = String(formData.get("parent_phone") || "").trim()
  const parent_nationality = String(formData.get("parent_nationality") || "").trim()

  if (!child_first_name || !child_last_name || !child_birthday || !child_gender) {
    redirect("/auth/complete-profile?error=يرجى%20ملء%20جميع%20الحقول%20المطلوبة")
  }

  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .maybeSingle()

  if (existingProfile) {
    redirect("/dashboard")
  }

  // Create user profile
  const { error } = await supabase
    .from("users")
    .insert({
      auth_id: user.id,
      child_first_name,
      child_last_name,
      child_birthday,
      child_gender,
      parent_first_name: parent_first_name || user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || "",
      parent_last_name: parent_last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || "",
      parent_phone,
      parent_nationality,
      initial_quiz_score: 0,
      inattention_score: 0,
      hyperactivity_score: 0,
      impulsivity_score: 0,
    })

  if (error) {
    console.error("Error creating profile:", error)
    redirect(`/auth/complete-profile?error=${encodeURIComponent(error.message)}`)
  }

  redirect("/dashboard")
}

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .maybeSingle()

  if (existingProfile) {
    redirect("/dashboard")
  }

  const error = typeof params?.error === "string" ? params.error : ""

  // Try to get user info from Google OAuth metadata
  const userEmail = user.email || ""
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || ""
  const nameParts = userName.split(' ')
  const defaultParentFirstName = nameParts[0] || userEmail.split('@')[0] || ""
  const defaultParentLastName = nameParts.slice(1).join(' ') || ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" dir="rtl">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 left-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 right-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-2xl w-full space-y-8 relative z-10">
        {/* Logo/Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              أكمل ملفك الشخصي
            </h1>
            <p className="text-gray-600 text-base">
              نحتاج إلى بعض المعلومات لإكمال حسابك
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" action={completeProfile}>
            <div>
              <h2 className="text-lg font-semibold text-indigo-800 mb-4 text-right">عن طفلك 🧒</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="child_first_name" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    الاسم الأول للطفل *
                  </label>
                  <input
                    id="child_first_name"
                    name="child_first_name"
                    type="text"
                    required
                    placeholder="مثال: أحمد"
                    className="block w-full px-4 py-3 border-2 border-indigo-100 rounded-xl bg-white/80 placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                  />
                </div>
                <div>
                  <label htmlFor="child_last_name" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    اسم العائلة للطفل *
                  </label>
                  <input
                    id="child_last_name"
                    name="child_last_name"
                    type="text"
                    required
                    placeholder="مثال: محمد"
                    className="block w-full px-4 py-3 border-2 border-indigo-100 rounded-xl bg-white/80 placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                  />
                </div>
                <div>
                  <label htmlFor="child_birthday" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    تاريخ ميلاد الطفل 🎂 *
                  </label>
                  <input
                    id="child_birthday"
                    name="child_birthday"
                    type="date"
                    required
                    className="block w-full px-4 py-3 border-2 border-indigo-100 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                  />
                </div>
                <div>
                  <label htmlFor="child_gender" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    جنس الطفل 🧸 *
                  </label>
                  <select
                    id="child_gender"
                    name="child_gender"
                    required
                    className="block w-full px-4 py-3 border-2 border-indigo-100 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                  >
                    <option value="">اختر الجنس</option>
                    <option value="Male">ذكر</option>
                    <option value="Female">أنثى</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-indigo-800 mb-4 text-right">عن ولي الأمر 👨‍👩‍👧</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="parent_first_name" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    الاسم الأول لولي الأمر
                  </label>
                  <input
                    id="parent_first_name"
                    name="parent_first_name"
                    type="text"
                    placeholder="الاسم الأول"
                    defaultValue={defaultParentFirstName}
                    className="block w-full px-4 py-3 border-2 border-indigo-100 rounded-xl bg-white/80 placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                  />
                </div>
                <div>
                  <label htmlFor="parent_last_name" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    اسم العائلة لولي الأمر
                  </label>
                  <input
                    id="parent_last_name"
                    name="parent_last_name"
                    type="text"
                    placeholder="اسم العائلة"
                    defaultValue={defaultParentLastName}
                    className="block w-full px-4 py-3 border-2 border-indigo-100 rounded-xl bg-white/80 placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                  />
                </div>
                <div>
                  <label htmlFor="parent_phone" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    هاتف ولي الأمر 📱
                  </label>
                  <input
                    id="parent_phone"
                    name="parent_phone"
                    type="tel"
                    placeholder="رقم الهاتف"
                    className="block w-full px-4 py-3 border-2 border-indigo-100 rounded-xl bg-white/80 placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                  />
                </div>
                <div>
                  <label htmlFor="parent_nationality" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    جنسية ولي الأمر 🌍
                  </label>
                  <input
                    id="parent_nationality"
                    name="parent_nationality"
                    type="text"
                    placeholder="الجنسية"
                    className="block w-full px-4 py-3 border-2 border-indigo-100 rounded-xl bg-white/80 placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
            >
              <span>إكمال الملف الشخصي</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}


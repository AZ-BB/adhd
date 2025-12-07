import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/server"
import Link from "next/link"
import {
  getUserLearningPathStats,
  getUserAllDayProgress,
} from "@/actions/learning-path"
import { getUserPhysicalActivityStats } from "@/actions/physical-activities"

export default async function DashboardPage() {
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
      "id, created_at, child_first_name, child_last_name, child_birthday, child_gender, parent_first_name, parent_last_name, parent_phone, parent_nationality, initial_quiz_score"
    )
    .eq("auth_id", user.id)
    .maybeSingle()

  // Get learning path stats
  let learningStats = null
  let dayProgress: any[] = []
  let physicalActivityStats = null
  if (profile) {
    try {
      learningStats = await getUserLearningPathStats(profile.id)
      dayProgress = await getUserAllDayProgress(profile.id)
    } catch (error) {
      console.error("Error fetching learning path stats:", error)
    }

    try {
      const physicalStats = await getUserPhysicalActivityStats(profile.id)
      if (!("error" in physicalStats)) {
        physicalActivityStats = physicalStats
      }
    } catch (error) {
      console.error("Error fetching physical activity stats:", error)
    }
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

  const age = calculateAge(profile?.child_birthday)

  return (
    <div className="max-w-7xl mx-auto" dir="rtl">
      {/* Language Switcher */}
      {/* <div className="flex justify-end mb-4">
        <a
          href="/dashboard/en"
          className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-md border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-white shadow-sm transition-all"
        >
          English
        </a>
      </div> */}

      {!profile ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="rounded-3xl border-4 border-dashed border-purple-300 bg-white/90 p-8 max-w-md text-center shadow-2xl">
            <div className="text-6xl mb-4">🎈</div>
            <p className="text-xl font-bold text-gray-900 mb-2">
              أوشكت على الانتهاء!
            </p>
            <p className="text-gray-600">
              أكمل التسجيل لفتح لوحة التحكم الشخصية الخاصة بك!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 text-9xl opacity-20">🎉</div>
            <div className="relative z-10 text-right">
              <h1 className="text-4xl md:text-5xl font-black mb-2">
                مرحبًا، {profile.child_first_name}! 👋
              </h1>
              <p className="text-xl md:text-2xl font-semibold opacity-90">
                مرحبًا بك في لوحة التحكم الرائعة الخاصة بك!
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Training Journey Card */}
            <div className="bg-gradient-to-br from-emerald-400 to-green-600 rounded-3xl p-6 shadow-xl text-white transform hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4 flex-row-reverse">
                <div className="text-5xl">🚀</div>
                <div className="bg-white/30 backdrop-blur rounded-full px-3 py-1 text-sm font-bold">
                  رحلة التدريب
                </div>
              </div>
              <div className="text-6xl font-black mb-2 text-right">
                {learningStats?.completedDays || 0}
              </div>
              <div className="text-xl font-bold text-right">
                {learningStats?.completedDays === 1
                  ? "يوم مكتمل!"
                  : "أيام مكتملة!"}
              </div>
              <div className="mt-4 text-sm opacity-90 text-right">
                {learningStats?.completedDays === 0
                  ? "ابدأ تدريبك اليوم!"
                  : `${
                      learningStats?.totalDays! - learningStats?.completedDays!
                    } أيام متبقية`}
              </div>
            </div>

            {/* Streak Card */}
            <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-6 shadow-xl text-white transform hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4 flex-row-reverse">
                <div className="text-5xl">🔥</div>
                <div className="bg-white/30 backdrop-blur rounded-full px-3 py-1 text-sm font-bold">
                  السلسلة
                </div>
              </div>
              <div className="text-6xl font-black mb-2 text-right">
                {learningStats?.streak || 0}
              </div>
              <div className="text-xl font-bold text-right">
                {learningStats?.streak === 1 ? "يوم متتالي!" : "أيام متتالية!"}
              </div>
              <div className="mt-4 text-sm opacity-90 text-right">
                {learningStats?.streak === 0
                  ? "ابدأ سلسلتك اليوم!"
                  : "حافظ على الزخم!"}
              </div>
            </div>

            {/* Age Card */}
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl p-6 shadow-xl text-white transform hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4 flex-row-reverse">
                <div className="text-5xl">🎂</div>
                <div className="bg-white/30 backdrop-blur rounded-full px-3 py-1 text-sm font-bold">
                  عيد الميلاد
                </div>
              </div>
              <div className="text-6xl font-black mb-2 text-right">{age}</div>
              <div className="text-xl font-bold text-right">سنوات شابة!</div>
              <div className="mt-4 text-sm opacity-90 text-right">
                {new Date(profile.child_birthday).toLocaleDateString("ar-EG", {
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/learning-path"
              className="group bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-8 shadow-xl text-white hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              <div className="flex items-center gap-4 flex-row-reverse">
                <div className="text-6xl group-hover:animate-bounce">🎮</div>
                <div className="text-right">
                  <h3 className="text-2xl font-black mb-1">العب ألعابًا</h3>
                  <p className="text-teal-100">
                    {learningStats?.completedDays === 0
                      ? "ابدأ رحلتك التعليمية!"
                      : `اليوم ${learningStats?.currentDay} في انتظارك!`}
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/physical-activities"
              className="group bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 shadow-xl text-white hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              <div className="flex items-center gap-4 flex-row-reverse">
                <div className="text-6xl group-hover:animate-bounce">🏃</div>
                <div className="text-right">
                  <h3 className="text-2xl font-black mb-1">النشاط البدني</h3>
                  <p className="text-green-100">
                    {physicalActivityStats?.totalVideosWatched === 0
                      ? "ابدأ التمارين اليوم!"
                      : `${physicalActivityStats?.currentVideoNumber} فيديوهات جديدة!`}
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Physical Activity Progress */}
          {physicalActivityStats &&
            physicalActivityStats.totalVideosWatched > 0 && (
              <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-xl border-4 border-green-200">
                <div className="flex items-center gap-3 mb-6 flex-row-reverse">
                  <div className="text-4xl">🏃</div>
                  <h2 className="text-2xl font-black text-gray-800">
                    النشاط البدني
                  </h2>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-4 text-center border-2 border-green-300">
                    <div className="text-3xl font-black text-green-600 mb-1">
                      {physicalActivityStats.totalVideosWatched}
                    </div>
                    <div className="text-xs font-bold text-gray-700">
                      فيديوهات مشاهدة
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4 text-center border-2 border-blue-300">
                    <div className="text-3xl font-black text-blue-600 mb-1">
                      {physicalActivityStats.currentVideoNumber}
                    </div>
                    <div className="text-xs font-bold text-gray-700">
                      فيديوهات اليوم
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-4 text-center border-2 border-orange-300">
                    <div className="text-3xl font-black text-orange-600 mb-1">
                      {physicalActivityStats.streak}🔥
                    </div>
                    <div className="text-xs font-bold text-gray-700">
                      أيام متتالية
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-4 text-center border-2 border-purple-300">
                    <div className="text-3xl font-black text-purple-600 mb-1">
                      {Math.floor(
                        (physicalActivityStats.totalWatchTime || 0) / 60
                      )}
                    </div>
                    <div className="text-xs font-bold text-gray-700">
                      دقائق نشاط
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/physical-activities"
                  className="block bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-4 text-center hover:shadow-lg transition-all text-white font-bold"
                >
                  🏃 شاهد فيديوهات اليوم
                </Link>
              </div>
            )}

          {/* Learning Path Progress */}
          {learningStats && learningStats.totalDays > 0 && (
            <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-xl border-4 border-purple-200">
              <div className="flex items-center gap-3 mb-6 flex-row-reverse">
                <div className="text-4xl">📚</div>
                <h2 className="text-2xl font-black text-gray-800">
                  مسار التعلم
                </h2>
              </div>

              {/* Overall Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2 flex-row-reverse">
                  <span className="text-sm font-bold text-gray-700">
                    التقدم الإجمالي
                  </span>
                  <span className="text-sm font-semibold text-purple-600">
                    {Math.round(
                      (learningStats.completedDays / learningStats.totalDays) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 h-4 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (learningStats.completedDays /
                          learningStats.totalDays) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600 flex-row-reverse">
                  <span>{learningStats.completedDays} مكتمل</span>
                  <span>{learningStats.totalDays} إجمالي</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-4 text-center border-2 border-purple-300">
                  <div className="text-3xl font-black text-purple-600 mb-1">
                    {learningStats.currentDay}
                  </div>
                  <div className="text-xs font-bold text-gray-700">
                    اليوم الحالي
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4 text-center border-2 border-blue-300">
                  <div className="text-3xl font-black text-blue-600 mb-1">
                    {learningStats.totalGamesCompleted}
                  </div>
                  <div className="text-xs font-bold text-gray-700">
                    ألعاب مكتملة
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-4 text-center border-2 border-green-300">
                  <div className="text-3xl font-black text-green-600 mb-1">
                    {learningStats.averageScore}
                  </div>
                  <div className="text-xs font-bold text-gray-700">
                    متوسط النتيجة
                  </div>
                </div>
              </div>

              {/* Recent Days */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-700 mb-3 text-right">
                  الأيام الأخيرة
                </h3>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {Array.from(
                    { length: Math.min(10, learningStats.currentDay) },
                    (_, i) => {
                      const dayNum = learningStats.currentDay - i
                      const dayProg = dayProgress.find((p) => {
                        const day = p.learning_day as any
                        return day?.day_number === dayNum
                      })
                      const isCompleted = dayProg?.is_completed || false

                      return (
                        <div
                          key={dayNum}
                          className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold border-2 ${
                            isCompleted
                              ? "bg-green-500 border-green-600 text-white"
                              : dayNum === learningStats.currentDay
                              ? "bg-blue-500 border-blue-600 text-white animate-pulse"
                              : "bg-gray-200 border-gray-300 text-gray-500"
                          }`}
                        >
                          {dayNum}
                        </div>
                      )
                    }
                  ).reverse()}
                </div>
              </div>
            </div>
          )}

          {/* Achievements Section */}
          <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-xl border-4 border-purple-200">
            <div className="flex items-center gap-3 mb-6 flex-row-reverse">
              <div className="text-4xl">🏆</div>
              <h2 className="text-2xl font-black text-gray-800">إنجازاتك</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-4 text-center border-2 border-yellow-300">
                <div className="text-4xl mb-2">🎯</div>
                <div className="text-sm font-bold text-gray-700">
                  بطل الاختبارات
                </div>
              </div>
              <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-4 text-center border-2 border-pink-300">
                <div className="text-4xl mb-2">🌈</div>
                <div className="text-sm font-bold text-gray-700">
                  الخطوات الأولى
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4 text-center border-2 border-blue-300 opacity-50">
                <div className="text-4xl mb-2">🎨</div>
                <div className="text-sm font-bold text-gray-700">مفكر مبدع</div>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-4 text-center border-2 border-purple-300 opacity-50">
                <div className="text-4xl mb-2">⚡</div>
                <div className="text-sm font-bold text-gray-700">سريع جدًا</div>
              </div>
            </div>
          </div>

          {/* Parent Info (Collapsed) */}
          <details className="bg-white/70 backdrop-blur rounded-3xl shadow-lg border-2 border-gray-200 overflow-hidden">
            <summary className="cursor-pointer p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 flex-row-reverse justify-end">
                <div className="text-3xl">👨‍👩‍👧‍👦</div>
                <h2 className="text-xl font-bold text-gray-800">
                  معلومات ولي الأمر
                </h2>
              </div>
            </summary>
            <div className="px-6 pb-6 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="text-right">
                <div className="text-gray-500 font-medium">اسم ولي الأمر</div>
                <div className="text-gray-800 font-semibold">
                  {profile.parent_first_name} {profile.parent_last_name}
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-500 font-medium">الهاتف</div>
                <div className="text-gray-800 font-semibold">
                  {profile.parent_phone || "—"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-500 font-medium">
                  البريد الإلكتروني
                </div>
                <div className="text-gray-800 font-semibold">{user?.email}</div>
              </div>
              <div className="text-right">
                <div className="text-gray-500 font-medium">الجنسية</div>
                <div className="text-gray-800 font-semibold">
                  {profile.parent_nationality || "—"}
                </div>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

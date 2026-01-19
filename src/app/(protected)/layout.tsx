import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/server";
import { getUserLearningPathStats } from "@/actions/learning-path";
import { getUserPhysicalActivityStats } from "@/actions/physical-activities";
import { requireActiveSubscription, getUserSubscriptionPlan, hasSubscriptionType } from "@/lib/subscription";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SidebarNav from "@/components/SidebarNav";
import "../globals.css";
import Image from "next/image";



export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check user role and redirect admins to admin dashboard
  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("auth_id", user.id)
      .maybeSingle();

    // Redirect admins away from user routes
    if (userData?.role === "admin" || userData?.role === "super_admin") {
      redirect("/admin");
    }

    // Require active subscription for non-admin users
    // This will redirect to pricing if no active subscription
    await requireActiveSubscription();
  } else {
    // Not authenticated, redirect to login
    redirect("/auth/login");
  }

  // Get user profile and stats
  let learningStats = null;
  let physicalActivityStats = null;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .maybeSingle();
    
    if (profile) {
      try {
        learningStats = await getUserLearningPathStats(profile.id);
      } catch (error) {
        console.error("Error fetching learning stats:", error);
      }
      
      try {
        const physicalStats = await getUserPhysicalActivityStats(profile.id);
        if (!('error' in physicalStats)) {
          physicalActivityStats = physicalStats;
        }
      } catch (error) {
        console.error("Error fetching physical activity stats:", error);
      }
    }
  }

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "/";
  const isEnglish = pathname.includes('/en');

  // Get user's subscription plan
  const subscriptionPlan = await getUserSubscriptionPlan();
  const hasGroupSessions = await hasSubscriptionType('group_sessions');

  // Build navigation items - sessions is always accessible (individual sessions are available to all)
  const baseNavItems = !isEnglish ? [
    { href: "/dashboard", icon: "🏠", label: "الرئيسية" },
    { href: "/sessions", icon: "🎯", label: "الجلسات" },
    { href: "/learning-path", icon: "🎮", label: "مسار التعلم" },
    { href: "/physical-activities", icon: "🏃", label: "النشاط البدني" },
    { href: "/quiz", icon: "📝", label: "الاختبار" },
    { href: "/profile", icon: "👤", label: "الملف الشخصي" },
    { href: "/settings", icon: "⚙️", label: "الإعدادات" },
  ] : [
    { href: "/dashboard/en", icon: "🏠", label: "Home" },
    { href: "/sessions/en", icon: "🎯", label: "Sessions" },
    { href: "/learning-path/en", icon: "🎮", label: "Learning Path" },
    { href: "/physical-activities/en", icon: "🏃", label: "Physical Activity" },
    { href: "/quiz/en", icon: "📝", label: "Quiz" },
    { href: "/profile/en", icon: "👤", label: "Profile" },
    { href: "/settings/en", icon: "⚙️", label: "Settings" },
  ];

  const navItems = baseNavItems;

  async function logout() {
    "use server";
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect(isEnglish ? "/auth/login/en" : "/auth/login");
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100">
      <aside className={`hidden md:flex w-64 flex-col border-r border-indigo-100 bg-white/70 backdrop-blur fixed h-screen ${!isEnglish ? 'right-0' : 'left-0'}`}>
        <div className="h-16 flex items-center px-5 border-b border-indigo-100 flex-shrink-0">
          <Link href={!isEnglish ? "/dashboard" : "/"} className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            <Image src="/logo/1.png" alt="Movokids" width={200} height={200} />
          </Link>
        </div>
        <SidebarNav navItems={navItems} isRtl={!isEnglish} />
        <div className={`p-4 border-t border-indigo-100 space-y-3 flex-shrink-0 ${!isEnglish ? 'text-right' : ''}`} dir={!isEnglish ? 'rtl' : 'ltr'}>
          {learningStats && learningStats.totalDays > 0 ? (
            <>
              {/* Learning Progress Widget */}
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-3 border-2 border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-purple-700">
                    {!isEnglish ? '🎮 مسار التعلم' : '🎮 Learning'}
                  </p>
                  <span className="text-xs font-semibold text-purple-600">
                    {Math.round((learningStats.completedDays / learningStats.totalDays) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(learningStats.completedDays / learningStats.totalDays) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-purple-600">
                    {!isEnglish ? `يوم ${learningStats.currentDay}` : `Day ${learningStats.currentDay}`}
                  </span>
                  <span className="text-orange-600">
                    {learningStats.streak}🔥
                  </span>
                </div>
              </div>
              
              {/* Call to Action */}
              <Link 
                href={!isEnglish ? "/learning-path" : "/learning-path/en"}
                className="block bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-3 text-center hover:shadow-lg transition-all"
              >
                <p className="text-xs font-bold text-white">
                  {learningStats.completedDays === 0 
                    ? (!isEnglish ? '🚀 ابدأ التعلم!' : '🚀 Start Learning!') 
                    : (!isEnglish ? `🎮 تابع اليوم ${learningStats.currentDay}` : `🎮 Continue Day ${learningStats.currentDay}`)}
                </p>
              </Link>
            </>
          ) : (
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 text-center">
              <p className="text-xs font-semibold text-purple-700">{!isEnglish ? 'استمر في التعلم!' : 'Keep Learning!'}</p>
              <p className="text-2xl mt-1">🌟</p>
            </div>
          )}
          
          {/* Physical Activity Progress Widget */}
          {physicalActivityStats && physicalActivityStats.totalVideosWatched > 0 && (
            <>
              <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-3 border-2 border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-green-700">
                    {!isEnglish ? '🏃 النشاط البدني' : '🏃 Physical Activity'}
                  </p>
                  <span className="text-xs font-semibold text-green-600">
                    {physicalActivityStats.totalVideosWatched} {!isEnglish ? 'فيديو' : 'videos'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-green-600">
                    {!isEnglish ? 'اليوم:' : 'Today:'} {physicalActivityStats.currentVideoNumber}
                  </span>
                  {physicalActivityStats.streak > 0 && (
                    <span className="text-orange-600">
                      {physicalActivityStats.streak}🔥
                    </span>
                  )}
                </div>
              </div>
              
              {/* Physical Activity CTA */}
              <Link 
                href={!isEnglish ? "/physical-activities" : "/physical-activities/en"}
                className="block bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-3 text-center hover:shadow-lg transition-all"
              >
                <p className="text-xs font-bold text-white">
                  {!isEnglish ? '🏃 شاهد فيديوهات اليوم' : '🏃 Watch Today\'s Videos'}
                </p>
              </Link>
            </>
          )}
          
          <p className="text-xs text-gray-500 text-center">© {new Date().getFullYear()} ADHD</p>
        </div>
      </aside>
      <div className={`flex-1 flex flex-col min-w-0 ${!isEnglish ? 'md:mr-64' : 'md:ml-64'}`}>
        <header className="h-16 flex items-center justify-between gap-4 bg-white/70 backdrop-blur border-b border-indigo-100 px-4 md:px-6">
          <div className="md:hidden">
            <Link href="/" className="text-base font-semibold text-indigo-700">
              Movokids
            </Link>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            {/* Subscription Plan Badge */}
            {subscriptionPlan.plan && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200">
                <span className="text-xs font-semibold text-indigo-700">
                  {subscriptionPlan.plan === 'games' 
                    ? (!isEnglish ? '🎮 باقة الألعاب' : '🎮 Games Package')
                    : subscriptionPlan.plan === 'group_sessions'
                    ? (!isEnglish ? '👥 باقة الجلسات' : '👥 Group Sessions')
                    : (!isEnglish ? '✨ باقة كاملة' : '✨ Full Package')
                  }
                </span>
              </div>
            )}
            
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-gray-700">{user.email}</span>
                <form action={logout}>
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-md bg-indigo-600 text-white px-3 py-1.5 text-sm font-medium shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    aria-label="Log out"
                  >
                    {!isEnglish ? 'تسجيل الخروج' : 'Log out'}
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center rounded-md bg-indigo-600 text-white px-3 py-1.5 text-sm font-medium shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {!isEnglish ? 'تسجيل الدخول' : 'Sign in'}
              </Link>
            )}
          </div>
        </header>
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/server";
import { getUserLearningPathStats } from "@/actions/learning-path";
import LanguageSwitcher from "@/components/LanguageSwitcher";
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

  // Get user profile and learning stats
  let learningStats = null;
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
    }
  }

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "/";
  const isEnglish = pathname.includes('/en');

  function getNavLinkClass(path: string) {
    const isActive = pathname === path || (path !== "/" && pathname.startsWith(path));
    const baseClass = "flex items-center gap-3 rounded-xl px-4 py-3 transition-all group";
    const activeClass = "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-sm border-2 border-indigo-300";
    const inactiveClass = "text-gray-800 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700";
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  }

  const navItems = !isEnglish ? [
    { href: "/dashboard", icon: "🏠", label: "الرئيسية" },
    { href: "/quiz", icon: "📝", label: "الاختبار" },
    { href: "/progress", icon: "📊", label: "التقدم" },
    { href: "/sessions", icon: "🎯", label: "الجلسات" },
    { href: "/learning-path", icon: "🎮", label: "مسار التعلم" },
    { href: "/profile", icon: "👤", label: "الملف الشخصي" },
    { href: "/settings", icon: "⚙️", label: "الإعدادات" },
  ] : [
    { href: "/", icon: "🏠", label: "Home" },
    { href: "/quiz", icon: "📝", label: "Quiz" },
    { href: "/progress", icon: "📊", label: "Progress" },
    { href: "/sessions", icon: "🎯", label: "Sessions" },
    { href: "/learning-path/en", icon: "🎮", label: "Learning Path" },
    { href: "/profile", icon: "👤", label: "Profile" },
    { href: "/settings", icon: "⚙️", label: "Settings" },
  ];

  async function logout() {
    "use server";
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100">
      <aside className={`hidden md:flex w-64 flex-col border-r border-indigo-100 bg-white/70 backdrop-blur fixed h-screen ${!isEnglish ? 'right-0' : 'left-0'}`}>
        <div className="h-16 flex items-center px-5 border-b border-indigo-100 flex-shrink-0">
          <Link href={!isEnglish ? "/dashboard" : "/"} className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            <Image src="/logo/1.png" alt="Movokids" width={200} height={200} />
          </Link>
        </div>
        <nav className={`p-4 flex-1 overflow-y-auto ${!isEnglish ? 'text-right' : ''}`} dir={!isEnglish ? 'rtl' : 'ltr'}>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={getNavLinkClass(item.href)}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={`p-4 border-t border-indigo-100 space-y-3 flex-shrink-0 ${!isEnglish ? 'text-right' : ''}`} dir={!isEnglish ? 'rtl' : 'ltr'}>
          {learningStats && learningStats.totalDays > 0 ? (
            <>
              {/* Progress Widget */}
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-3 border-2 border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-purple-700">{!isEnglish ? 'تقدمك' : 'Your Progress'}</p>
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
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <div className="text-lg font-black text-purple-700">
                      {learningStats.completedDays}
                    </div>
                    <div className="text-[10px] text-purple-600">{!isEnglish ? 'مكتمل' : 'Completed'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black text-orange-600">
                      {learningStats.streak}🔥
                    </div>
                    <div className="text-[10px] text-orange-600">{!isEnglish ? 'سلسلة' : 'Streak'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black text-blue-600">
                      {learningStats.currentDay}
                    </div>
                    <div className="text-[10px] text-blue-600">{!isEnglish ? 'الحالي' : 'Current'}</div>
                  </div>
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

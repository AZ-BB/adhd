import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/server";
import "../globals.css";



export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || headersList.get("referer")?.split("/").pop() || "/";

  function getNavLinkClass(path: string) {
    const isActive = pathname === path || (path !== "/" && pathname.startsWith(path));
    const baseClass = "flex items-center gap-3 rounded-xl px-4 py-3 transition-all group";
    const activeClass = "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-sm border-2 border-indigo-300";
    const inactiveClass = "text-gray-800 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700";
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  }

  async function logout() {
    "use server";
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100">
      <aside className="hidden md:flex w-64 flex-col border-r border-indigo-100 bg-white/70 backdrop-blur">
        <div className="h-16 flex items-center px-5 border-b border-indigo-100">
          <Link href="/" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            ADHD App
          </Link>
        </div>
        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className={getNavLinkClass("/")}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">🏠</span>
                <span className="font-medium">Home</span>
              </Link>
            </li>
            <li>
              <Link
                href="/quiz"
                className={getNavLinkClass("/quiz")}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">📝</span>
                <span className="font-medium">Quiz</span>
              </Link>
            </li>
            <li>
              <Link
                href="/progress"
                className={getNavLinkClass("/progress")}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
                <span className="font-medium">Progress</span>
              </Link>
            </li>
            <li>
              <Link
                href="/sessions"
                className={getNavLinkClass("/sessions")}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">🎯</span>
                <span className="font-medium">Sessions</span>
              </Link>
            </li>
            <li>
              <Link
                href="/games"
                className={getNavLinkClass("/games")}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">🎮</span>
                <span className="font-medium">Games</span>
              </Link>
            </li>
            <li>
              <Link
                href="/profile"
                className={getNavLinkClass("/profile")}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">👤</span>
                <span className="font-medium">Profile</span>
              </Link>
            </li>
            <li className="pt-2">
              <Link
                href="/settings"
                className={getNavLinkClass("/settings")}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">⚙️</span>
                <span className="font-medium">Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-indigo-100">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 text-center">
            <p className="text-xs font-semibold text-purple-700">Keep Learning!</p>
            <p className="text-2xl mt-1">🌟</p>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">© {new Date().getFullYear()} ADHD</p>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between gap-4 bg-white/70 backdrop-blur border-b border-indigo-100 px-4 md:px-6">
          <div className="md:hidden">
            <Link href="/" className="text-base font-semibold text-indigo-700">
              ADHD App
            </Link>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-gray-700">{user.email}</span>
                <form action={logout}>
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-md bg-indigo-600 text-white px-3 py-1.5 text-sm font-medium shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    aria-label="Log out"
                  >
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center rounded-md bg-indigo-600 text-white px-3 py-1.5 text-sm font-medium shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
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

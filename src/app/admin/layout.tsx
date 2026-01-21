import type { Metadata } from "next"
import Link from "next/link"
import { requireAdmin, adminLogout } from "@/lib/admin"
import "../globals.css"

export const metadata: Metadata = {
  title: "Admin Dashboard - ADHD Learning Platform",
  description: "Admin dashboard for managing users and content",
}

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const adminUser = await requireAdmin()

  const navItems = [
    { href: "/admin", icon: "📊", label: "Dashboard" },
    { href: "/admin/users", icon: "👥", label: "Users" },
    { href: "/admin/payments", icon: "💳", label: "Payments & Subscriptions" },
    { href: "/admin/analytics", icon: "📈", label: "Analytics" },
    { href: "/admin/content", icon: "📚", label: "Content" },
    { href: "/admin/blogs", icon: "✍️", label: "Blogs" },
    { href: "/admin/physical-activities", icon: "🏃", label: "Physical Activities" },
    { href: "/admin/sessions", icon: "📅", label: "Group Sessions" },
    { href: "/admin/solo-sessions", icon: "👤", label: "1:1 Requests" },
    { href: "/admin/settings", icon: "👑", label: "Admins" },
  ]

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-purple-800/50 bg-black/30 backdrop-blur fixed h-screen">
        <div className="h-16 flex items-center px-5 border-b border-purple-800/50 flex-shrink-0">
          <Link
            href="/admin"
            className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
          >
            Movokids Admin
          </Link>
        </div>
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-300 hover:bg-purple-800/30 hover:text-white transition-all"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-purple-800/50 flex-shrink-0">
          <div className="bg-purple-800/30 rounded-xl p-3 mb-3">
            <p className="text-xs font-semibold text-purple-300">Logged in as</p>
            <p className="text-sm font-bold text-white truncate">{adminUser.name}</p>
            <p className="text-xs text-gray-400 truncate">{adminUser.email}</p>
          </div>
          <form action={adminLogout}>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-sm font-medium transition-colors border border-red-500/50"
            >
              Sign Out
            </button>
          </form>
          <p className="text-xs text-gray-500 text-center mt-3">© {new Date().getFullYear()} Admin</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <header className="h-16 flex items-center justify-between gap-4 bg-black/30 backdrop-blur border-b border-purple-800/50 px-4 md:px-6">
          <div className="md:hidden">
            <Link href="/admin" className="text-base font-semibold text-purple-300">
              Admin
            </Link>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-gray-300">{adminUser.email}</span>
            {adminUser.is_super_admin && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold rounded border border-yellow-500/50">
                SUPER ADMIN
              </span>
            )}
          </div>
        </header>
        <main className="p-4 md:p-6 lg:p-8 flex-1">{children}</main>
      </div>
    </div>
  )
}


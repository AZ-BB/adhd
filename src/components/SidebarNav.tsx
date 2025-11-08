'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  icon: string
  label: string
}

interface SidebarNavProps {
  navItems: NavItem[]
  isRtl: boolean
}

export default function SidebarNav({ navItems, isRtl }: SidebarNavProps) {
  const pathname = usePathname()

  function getNavLinkClass(path: string) {
    // Exact match or match the base path (e.g., /dashboard matches /dashboard/en)
    // Use path + "/" to avoid false matches (e.g., /dashboard won't match /dashboard-admin)
    const isActive = pathname === path || (path !== "/" && pathname.startsWith(path + "/"));
    const baseClass = "flex items-center gap-3 rounded-xl px-4 py-3 transition-all group";
    const activeClass = "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-sm border-2 border-indigo-300";
    const inactiveClass = "text-gray-800 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700";
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  }

  return (
    <nav className={`p-4 flex-1 overflow-y-auto ${isRtl ? 'text-right' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
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
  )
}


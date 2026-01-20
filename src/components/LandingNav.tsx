"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

interface LandingNavProps {
  isRtl?: boolean
  navItems: {
    label: string
    href: string
    isPrimary?: boolean
  }[]
  logoHref: string
}

export default function LandingNav({ isRtl = false, navItems, logoHref }: LandingNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight)
    }
  }, [])

  return (
    <header ref={headerRef} className="relative z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 flex items-center justify-between gap-3 relative">
        <Link href={logoHref} className="text-2xl font-extrabold flex-shrink-0">
          <Image
            src="/logo/1.png"
            alt="Movokids"
            width={200}
            height={60}
            className="object-contain w-32 sm:w-40 md:w-48 h-auto"
          />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                item.isPrimary
                  ? "bg-green-500 text-white hover:bg-green-600 shadow"
                  : "bg-white/70 text-sky-700 border border-sky-200 hover:bg-white shadow-sm"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg bg-white/70 text-sky-700 border border-sky-200 hover:bg-white transition-all z-10"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="md:hidden fixed inset-0 bg-black/20 z-[60]"
            onClick={() => setIsOpen(false)}
            style={{ top: `${headerHeight}px` }}
          />
          {/* Dropdown menu */}
          <div
            className={`md:hidden fixed left-0 right-0 w-full bg-white backdrop-blur-md border-b border-gray-200 shadow-xl z-[70] ${
              isRtl ? "text-right" : "text-left"
            }`}
            dir={isRtl ? "rtl" : "ltr"}
            onClick={(e) => e.stopPropagation()}
            style={{ top: `${headerHeight}px` }}
          >
            <nav className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    item.isPrimary
                      ? "bg-green-500 text-white hover:bg-green-600 shadow"
                      : "bg-white/70 text-sky-700 border border-sky-200 hover:bg-white shadow-sm"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  )
}

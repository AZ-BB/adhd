'use client'

import Link from 'next/link'

interface DashboardFeatureCardProps {
  href: string
  icon: string
  lockedIcon: string
  title: string
  description: string
  isLocked: boolean
  isRtl?: boolean
  gradientFrom: string
  gradientTo: string
  textColor: string
}

export default function DashboardFeatureCard({
  href,
  icon,
  lockedIcon,
  title,
  description,
  isLocked,
  isRtl = true,
  gradientFrom,
  gradientTo,
  textColor,
}: DashboardFeatureCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault()
    }
  }

  return (
    <Link
      href={href}
      className={`group rounded-3xl p-8 shadow-xl text-white transition-all relative ${
        !isLocked
          ? `bg-gradient-to-br ${gradientFrom} ${gradientTo} hover:shadow-2xl transform hover:scale-105`
          : 'bg-gradient-to-br from-gray-400 to-gray-500 opacity-75 cursor-not-allowed'
      }`}
      onClick={handleClick}
    >
      {isLocked && (
        <div className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold`}>
          ✨ {isRtl ? 'مميز' : 'Premium'}
        </div>
      )}
      <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className="text-6xl group-hover:animate-bounce">
          {isLocked ? lockedIcon : icon}
        </div>
        <div className={isRtl ? 'text-right' : ''}>
          <h3 className="text-2xl font-black mb-1">{title}</h3>
          <p className={!isLocked ? textColor : "text-gray-200"}>
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}

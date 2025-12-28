"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

export default function PricingPage() {
  const [isEgypt, setIsEgypt] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Detect user location based on IP
    const detectLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()
        
        // Check if country is Egypt (EG)
        if (data.country_code === 'EG') {
          setIsEgypt(true)
        } else {
          setIsEgypt(false)
        }
      } catch (error) {
        // Default to international if detection fails
        setIsEgypt(false)
      } finally {
        setLoading(false)
      }
    }

    detectLocation()
  }, [])

  const packages = [
    {
      id: 1,
      name: "باقة الألعاب",
      description: "الوصول الكامل لجميع الألعاب التعليمية",
      icon: "🎮",
      features: [
        "جميع الألعاب التعليمية",
        "تتبع التقدم",
        "إمكانية الوصول غير محدودة",
        "دعم فني متواصل"
      ],
      originalPrice: isEgypt ? "374" : "75",
      price: isEgypt ? "299" : "60",
      currency: isEgypt ? "جنيه مصري" : "درهم إماراتي",
      period: "شهرياً",
      popular: false
    },
    {
      id: 2,
      name: "باقة الجلسات الجماعية",
      description: "الألعاب + 4 جلسات جماعية شهرياً",
      icon: "👥",
      features: [
        "جميع الألعاب التعليمية",
        "4 جلسات جماعية شهرياً",
        "تفاعل مع أطفال آخرين",
        "تتبع التقدم",
        "دعم فني متواصل"
      ],
      originalPrice: isEgypt ? "813" : "275",
      price: isEgypt ? "650" : "220",
      currency: isEgypt ? "جنيه مصري" : "درهم إماراتي",
      period: isEgypt ? "لفترة محدودة" : "شهرياً",
      popular: true
    },
    {
      id: 3,
      name: "الباقة الفردية",
      description: "الألعاب + جلسات فردية عند الطلب",
      icon: "👤",
      features: [
        "الألعاب بسعرها الأصلي",
        "إضافة جلسة فردية بـ 50 درهم أو 200 جنيه",
        "مرونة في حجز الجلسات",
        "تتبع التقدم",
        "دعم فني متواصل"
      ],
      originalPrice: isEgypt ? "250" : "63",
      price: isEgypt ? "200" : "50",
      currency: isEgypt ? "جنيه مصري" : "درهم إماراتي",
      period: "لكل جلسة فردية إضافية",
      popular: false,
      note: true
    }
  ]

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-green-50 to-sky-100"
      dir="rtl"
    >
      {/* Navbar */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 flex items-center justify-between gap-3">
          <Link href="/" className="text-2xl font-extrabold flex-shrink-0">
            <Image
              src="/logo/1.png"
              alt="Movokids"
              width={200}
              height={60}
              className="object-contain w-32 sm:w-40 md:w-48 h-auto"
            />
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link
              href="/en/pricing"
              className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/70 text-sky-700 border border-sky-200 hover:bg-white shadow-sm text-xs sm:text-sm font-medium whitespace-nowrap transition-all"
            >
              English
            </Link>
            <Link
              href="/"
              className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/70 text-sky-700 border border-sky-200 hover:bg-white shadow-sm text-xs sm:text-sm font-medium whitespace-nowrap transition-all"
            >
              الرئيسية
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-sky-900 mb-4">
            الأسعار
          </h1>
          <p className="text-xl text-sky-700/80 max-w-2xl mx-auto">
            اختر الباقة المناسبة لطفلك وابدأ رحلة التعلم التفاعلي اليوم
          </p>
        </div>

        {/* Pricing Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div>
            <p className="mt-4 text-sky-700">جاري تحميل الأسعار...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-white/90 backdrop-blur-sm rounded-3xl border-2 ${
                  pkg.popular
                    ? "border-sky-500 shadow-xl scale-105"
                    : "border-sky-200 shadow-md"
                } p-8 transition-transform hover:scale-105`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      الأكثر شعبية ⭐
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">{pkg.icon}</div>
                  <h3 className="text-2xl font-bold text-sky-900 mb-2">{pkg.name}</h3>
                  <p className="text-sky-700/70 text-sm mb-4">{pkg.description}</p>
                  <div className="mb-2">
                    {pkg.originalPrice && (
                      <div className="mb-1">
                        <span className="text-xl text-sky-400 line-through">
                          {pkg.originalPrice}
                        </span>
                        <span className="text-sm text-sky-400 mr-1">{pkg.currency}</span>
                      </div>
                    )}
                    <span className="text-5xl font-extrabold text-sky-600">
                      {pkg.price}
                    </span>
                    <span className="text-xl text-sky-700 mr-2">{pkg.currency}</span>
                  </div>
                  <p className="text-sky-600/70 text-sm">{pkg.period}</p>
                  {pkg.note && (
                    <p className="text-xs text-sky-500 mt-2">*سعر الجلسة الفردية الإضافية</p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sky-800/80">
                      <svg
                        className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/login"
                  className={`block w-full py-3 px-6 rounded-xl font-semibold text-center transition-all ${
                    pkg.popular
                      ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 shadow-lg"
                      : "bg-sky-100 text-sky-700 hover:bg-sky-200"
                  }`}
                >
                  ابدأ الآن
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 text-white font-semibold hover:bg-sky-600 shadow transition-colors"
          >
            <span>←</span>
            <span>العودة إلى الصفحة الرئيسية</span>
          </Link>
        </div>
      </main>
    </div>
  )
}


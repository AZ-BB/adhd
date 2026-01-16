"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function PricingPage() {
  const [isEgypt, setIsEgypt] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [subscriptions, setSubscriptions] = useState<{ games: boolean; group_sessions: boolean; hasExpiredSubscription?: boolean; expiredSubscription?: any }>({ games: false, group_sessions: false })
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        })
        const data = await response.json()
        setIsAuthenticated(data.authenticated || false)
        
        // If authenticated, check subscription status
        if (data.authenticated) {
          try {
            const subResponse = await fetch('/api/subscriptions/check', {
              method: 'GET',
              credentials: 'include',
            })
            const subData = await subResponse.json()
            setSubscriptions(subData)
          } catch (error) {
            console.error('Error checking subscriptions:', error)
          } finally {
            setSubscriptionsLoading(false)
          }
        } else {
          setSubscriptionsLoading(false)
        }
      } catch (error) {
        setIsAuthenticated(false)
        setSubscriptionsLoading(false)
      }
    }

    checkAuth()

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

  const handlePurchase = (pkg: typeof packages[0]) => {
    // Check if already purchased
    const subscriptionType = pkg.id === 1 ? 'games' : 'group_sessions'
    const isPurchased = pkg.id === 1 ? subscriptions.games : subscriptions.group_sessions
    
    if (isPurchased) {
      return // Don't allow purchasing again
    }

    if (!isAuthenticated) {
      // Redirect to login with return URL
      const currencyCode = isEgypt ? 'EGP' : 'AED'
      router.push(`/auth/login?redirect=/payment/checkout?packageId=${pkg.id}&subscriptionType=${subscriptionType}&amount=${pkg.price}&currency=${currencyCode}`)
      return
    }

    // Redirect to payment checkout
    const currencyCode = isEgypt ? 'EGP' : 'AED'
    router.push(`/payment/checkout?packageId=${pkg.id}&subscriptionType=${subscriptionType}&amount=${pkg.price}&currency=${currencyCode}`)
  }

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
      originalPrice: isEgypt ? "600" : "120",
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
      originalPrice: isEgypt ? "1300" : "440",
      price: isEgypt ? "650" : "220",
      currency: isEgypt ? "جنيه مصري" : "درهم إماراتي",
      period: isEgypt ? "لفترة محدودة" : "شهرياً",
      popular: true
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

        {/* Expired Subscription Alert - Only show if no active subscription */}
        {isAuthenticated && subscriptions.hasExpiredSubscription && !subscriptions.games && !subscriptions.group_sessions && !subscriptionsLoading && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-6 shadow-xl text-white border-2 border-orange-300">
              <div className="flex items-center gap-4 flex-row-reverse">
                <div className="text-5xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">انتهت صلاحية اشتراكك</h3>
                  <p className="text-lg opacity-95">
                    آخر اشتراك لك قد انتهت صلاحيته. يرجى تجديد اشتراكك للاستمرار في الوصول إلى جميع الميزات.
                  </p>
                  {subscriptions.expiredSubscription && (
                    <p className="text-sm mt-2 opacity-90">
                      انتهى في: {new Date(subscriptions.expiredSubscription.endDate).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div>
            <p className="mt-4 text-sky-700">جاري تحميل الأسعار...</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8 mb-12 max-w-4xl mx-auto">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-white/90 backdrop-blur-sm rounded-3xl border-2 ${
                  pkg.popular
                    ? "border-sky-500 shadow-xl scale-105"
                    : "border-sky-200 shadow-md"
                } p-8 transition-transform hover:scale-105 w-full md:w-[calc(50%-1rem)] max-w-md`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      المفضل لدى العملاء ⭐
                    </span>
                  </div>
                )}
                {(pkg.id === 1 ? subscriptions.games : subscriptions.group_sessions) && (
                  <div className="absolute -top-4 left-4">
                    <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      ✓ تم الشراء
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
                  {pkg.period && (
                    <p className="text-sky-600/70 text-sm">{pkg.period}</p>
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

                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={(pkg.id === 1 ? subscriptions.games : subscriptions.group_sessions) || subscriptionsLoading}
                  className={`block w-full py-3 px-6 rounded-xl font-semibold text-center transition-all ${
                    subscriptionsLoading
                      ? "bg-gray-200 text-gray-400 cursor-wait"
                      : (pkg.id === 1 ? subscriptions.games : subscriptions.group_sessions)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : pkg.popular
                      ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 shadow-lg"
                      : "bg-sky-100 text-sky-700 hover:bg-sky-200"
                  }`}
                >
                  {subscriptionsLoading
                    ? "جاري التحميل..."
                    : (pkg.id === 1 ? subscriptions.games : subscriptions.group_sessions)
                    ? "تم الشراء"
                    : isAuthenticated
                    ? "اشتر الآن"
                    : "ابدأ الآن"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Individual Session Info */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-sky-200 shadow-md p-6 text-center">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-xl font-bold text-sky-900 mb-2">الجلسات الفردية</h3>
            <p className="text-sky-700 mb-4">
              يمكنك إضافة جلسات فردية حسب الحاجة
            </p>
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="mb-1">
                <span className="text-xl text-sky-400 line-through">
                  {isEgypt ? "400" : "100"}
                </span>
                <span className="text-sm text-sky-400 mr-1">
                  {isEgypt ? "جنيه مصري" : "درهم إماراتي"}
                </span>
              </div>
              <div className="flex items-center justify-center gap-4 text-lg">
                <span className="text-sky-600 font-semibold">
                  سعر الجلسة الفردية:
                </span>
                <span className="text-2xl font-extrabold text-sky-600">
                  {isEgypt ? "200" : "50"}
                </span>
                <span className="text-sky-700">
                  {isEgypt ? "جنيه مصري" : "درهم إماراتي"}
                </span>
              </div>
            </div>
          </div>
        </div>

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


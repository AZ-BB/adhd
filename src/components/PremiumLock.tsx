import Link from 'next/link'

interface PremiumLockProps {
  isRtl?: boolean
  feature?: string
}

export default function PremiumLock({ isRtl = true, feature }: PremiumLockProps) {
  const content = {
    ar: {
      title: '✨ محتوى مميز',
      subtitle: feature ? `${feature} متاحة للمشتركين فقط` : 'هذه الميزة متاحة للمشتركين فقط',
      description: 'اشترك الآن للوصول إلى جميع الميزات المميزة',
      features: [
        '🎮 الألعاب التعليمية',
        '🏃 النشاط البدني',
        '🎯 الجلسات الجماعية والفردية',
        '📊 تتبع التقدم والإحصائيات',
      ],
      cta: 'عرض الباقات والاشتراك',
    },
    en: {
      title: '✨ Premium Content',
      subtitle: feature ? `${feature} is available for subscribers only` : 'This feature is available for subscribers only',
      description: 'Subscribe now to access all premium features',
      features: [
        '🎮 Educational Games',
        '🏃 Physical Activities',
        '🎯 Group & Solo Sessions',
        '📊 Progress Tracking & Stats',
      ],
      cta: 'View Plans & Subscribe',
    },
  }

  const text = isRtl ? content.ar : content.en

  return (
    <div 
      className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-2xl w-full">
        {/* Lock Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-6 border-4 border-purple-200 shadow-lg">
            <svg 
              className="w-12 h-12 text-purple-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>
          
          <h1 className="text-4xl font-black text-gray-900 mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {text.title}
          </h1>
          
          <p className="text-xl text-gray-700 font-semibold mb-2">
            {text.subtitle}
          </p>
          
          <p className="text-gray-600 max-w-md mx-auto">
            {text.description}
          </p>
        </div>

        {/* Features Grid */}
        <div className="bg-white/90 backdrop-blur rounded-3xl p-8 shadow-xl border-2 border-purple-100 mb-6">
          <h2 className={`text-lg font-bold text-gray-800 mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>
            {isRtl ? '🎁 اشترك الآن واحصل على:' : '🎁 Subscribe and get:'}
          </h2>
          
          <ul className="space-y-3 mb-6">
            {text.features.map((feature, index) => (
              <li 
                key={index} 
                className={`flex items-center gap-3 text-gray-700 ${isRtl ? 'flex-row-reverse text-right' : ''}`}
              >
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="font-medium">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <Link 
            href={isRtl ? "/pricing" : "/pricing/en"}
            className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-center py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            {text.cta}
          </Link>
        </div>

        {/* Bottom Note */}
        <p className={`text-center text-sm text-gray-500 ${isRtl ? 'text-right' : 'text-left'}`}>
          {isRtl ? (
            <>
              💡 لديك حساب مميز بالفعل؟{' '}
              <Link href="/settings" className="text-purple-600 hover:text-purple-700 font-semibold underline">
                تحقق من حالة اشتراكك
              </Link>
            </>
          ) : (
            <>
              💡 Already have a premium account?{' '}
              <Link href="/settings/en" className="text-purple-600 hover:text-purple-700 font-semibold underline">
                Check your subscription status
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

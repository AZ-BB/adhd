import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
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
              href="/en/about"
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
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/90 rounded-3xl border border-sky-100 p-8 md:p-12 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-extrabold text-sky-900 mb-8 text-right">
            من نحن
          </h1>

          <div className="prose prose-sky max-w-none text-right space-y-6 text-sky-900/80 leading-relaxed">
            <section>
              <p className="text-lg mb-6">
                Movokids هي منصة تعليمية وتدريبية متخصصة للأطفال تهدف إلى تنمية التركيز والانتباه والمهارات الإدراكية والسلوكية لديهم بطريقة ممتعة وآمنة.
              </p>
              <p className="text-base mb-6">
                نقدم مجموعة من الأنشطة التفاعلية اليومية، ألعاب تدريبية قصيرة، وتمارين مصممة بعناية لمساعدة الأطفال على تحسين قدراتهم الذهنية وتنظيم سلوكهم ودعم تحصيلهم الدراسي.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                نهدف إلى:
              </h2>
              <ul className="list-disc mr-6 space-y-3">
                <li className="text-base">
                  مساعدة الأطفال على زيادة التركيز والانتباه
                </li>
                <li className="text-base">
                  تقليل التشتت والاندفاع
                </li>
                <li className="text-base">
                  دعم أولياء الأمور بخطط تدريب واضحة
                </li>
                <li className="text-base">
                  تقديم بيئة تعليمية ممتعة وآمنة
                </li>
                <li className="text-base">
                  بناء عادة يومية للتعلم والتدريب
                </li>
              </ul>
            </section>

            <section>
              <div className="bg-sky-50 border-r-4 border-sky-400 p-6 mt-6 rounded-lg">
                <p className="text-base leading-relaxed">
                  فريق Movokids يضم مختصين تربويين وتقنيين يعملون معًا لتقديم تجربة تعليمية حديثة وفعّالة تناسب احتياجات طفلك.
                </p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-sky-100">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 text-white font-semibold hover:bg-sky-600 shadow transition-colors"
            >
              <span>←</span>
              <span>العودة إلى الصفحة الرئيسية</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}



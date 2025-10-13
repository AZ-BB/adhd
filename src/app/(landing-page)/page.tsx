import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/server"
import { redirect } from "next/navigation"
import Image from "next/image"

export default async function Home() {
  // Redirect logged-in users to dashboard
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-green-50 to-sky-100"
      dir="rtl"
    >
      {/* Navbar */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-start justify-between">
          <Link
            href="/"
            className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-green-600"
          >
            <Image src="/logo/1.png" alt="Movokids" width={200} height={200} />
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/en"
              className="px-3 py-2 rounded-xl bg-white/70 text-sky-700 border border-sky-200 hover:bg-white shadow-sm"
            >
              English
            </Link>
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-xl bg-white/70 text-sky-700 border border-sky-200 hover:bg-white shadow-sm"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 shadow"
            >
              ابدأ الآن
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section dir="rtl" className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 md:pt-10 md:pb-16 lg:pt-14 lg:pb-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1 text-right">
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-sky-900">
                Movokids
                <br />
                منصه متكاملة تساعد طفلك علي اكتشاف قوّته الحقيقية
              </h1>
              <p className="mt-4 text-sky-900/80 text-lg md:text-xl">
                منصّتنا مخصّصة لدعم الأطفال من عمر ٥ إلى ١٢ عامًا في تطوير
                مهارات التركيز والتحكّم في الانفعالات، وتنمية القدرات التعليمية
                من خلال تدريبات يومية ممتعة وأنشطة تفاعلية، بالإضافة إلى جلسات
                أونلاين مع مختصّين
              </p>
              <p className="mt-3 text-sky-900/70 text-sm md:text-base">
                الاختبارات الموجودة في منصّتنا، مبنيّة على أدوات تقييم وتشخيص
                عالمية، لكنها لا تُعطي حكمًا نهائيًا لحالة الطفل، إذ إن التشخيص
                المؤكّد يجب أن يتمّ على يد الطبيب المختص. هدفنا هو تقديم مؤشرات
                أوليّة تساعد الأهل على فهم التحدّيات، ثم توفير تدريبات بإشراف
                مختصّين لتقوية قدرات الأطفال خطوةً بخطوة، وتحويل الصعوبات إلى
                إنجازات.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <Link
                  href="/auth/signup"
                  className="px-5 py-3 rounded-2xl bg-green-500 text-white font-semibold hover:bg-green-600 shadow"
                >
                  ابدأ الآن مجانًا
                </Link>
                <a
                  href="#why"
                  className="px-5 py-3 rounded-2xl bg-white text-sky-700 border border-sky-200 hover:bg-sky-50"
                >
                  لماذا Movokids؟
                </a>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sky-800/70 text-sm">
                <span>👨‍👩‍👧 مناسب للأهل</span>
                <span>•</span>
                <span>🧒 مناسب للأطفال</span>
                <span>•</span>
                <span>🔒 آمن وموثوق</span>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative mx-auto w-full max-w-md aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-sky-100 to-green-100 border border-white/60 shadow-xl flex items-center justify-center">
                <img
                  src="/hero.png"
                  alt="صورة توضيحية لمنصة Movokids"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs md:text-sm px-3 py-2 rounded-2xl shadow">
                  جوائز تحفيزية
                </div>
                <div className="absolute bottom-2 right-2 bg-sky-500 text-white text-xs md:text-sm px-3 py-2 rounded-2xl shadow">
                  أنشطة ممتعة
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section dir="rtl" className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 gap-5">
            {/* Mission: text with side image mosaic */}
            <div className="bg-white/90 rounded-3xl border border-sky-100 p-6 shadow-sm">
              <div className="grid sm:grid-cols-2 gap-5 items-center">
                <div className="sm:order-2 text-right">
                  <h2 className="text-2xl font-bold text-sky-900 mb-2">
                    مهمتنا
                  </h2>
                  <p className="text-sky-900/80">
                    أن نحوّل التحديات اليومية لأطفال صعوبة الانتباه وفرط الحركة
                    إلى قصص نجاح، من خلال تدريبات عملية، تقييمات وجلسات تفاعلية
                    مع متخصصين.
                  </p>
                </div>
                <div className="sm:order-1">
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-sky-100 bg-white">
                    <img
                      src="/hero/kids_3.png"
                      alt="تعلّم ممتع"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Vision: text with side image mosaic (alternating order) */}
            <div className="bg-white/90 rounded-3xl border border-green-100 p-6 shadow-sm">
              <div className="grid sm:grid-cols-2 gap-5 items-center">
                <div className="sm:order-2 text-right">
                  <h2 className="text-2xl font-bold text-sky-900 mb-2">
                    رؤيتنا
                  </h2>
                  <p className="text-sky-900/80">
                    أن ننشئ عالمًا يتمكّن فيه كل طفل من النمو، والتعلم، والتألق.
                    نؤمن أن كل طفل يستحق فرصة للوصول إلى دعم متخصص، وأنشطة
                    تعليمية ممتعة، ومساحة آمنة تساعده على التطور مهما كانت
                    التحديات.
                  </p>
                </div>
                <div className="sm:order-1">
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-sky-100 bg-white">
                    <img
                      src="/hero/kids_1.png"
                      alt="نشاط عملي"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Programs Features */}
      <section dir="rtl" className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/90 rounded-3xl border border-sky-100 p-6 md:p-8 shadow-sm">
            <div className="text-center mb-8">
              <p className="text-sky-900/90 text-lg md:text-xl font-semibold">
                تم إعداد برامجنا بالتعاون مع أخصائيين في علم النفس والتربية
                الخاصة.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-gradient-to-br from-sky-50 to-white rounded-2xl border border-sky-100 p-5 text-center shadow-sm">
                <div className="text-4xl mb-3">🌍</div>
                <h3 className="font-bold text-sky-900 text-lg mb-2">
                  أدوات تقييم عالمية
                </h3>
                <p className="text-sky-900/70 text-sm">
                  نستخدم أدوات تقييم معترف بها عالميًا
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 p-5 text-center shadow-sm">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="font-bold text-sky-900 text-lg mb-2">
                  تدريبات يومية
                </h3>
                <p className="text-sky-900/70 text-sm">
                  للمساعدة على الانتباه والتركيز
                </p>
              </div>
              <div className="bg-gradient-to-br from-sky-50 to-white rounded-2xl border border-sky-100 p-5 text-center shadow-sm">
                <div className="text-4xl mb-3">👨‍⚕️</div>
                <h3 className="font-bold text-sky-900 text-lg mb-2">
                  جلسات مع مختصّين
                </h3>
                <p className="text-sky-900/70 text-sm">
                  دعم مباشر من خبراء متخصصين
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 p-5 text-center shadow-sm">
                <div className="text-4xl mb-3">✨</div>
                <h3 className="font-bold text-sky-900 text-lg mb-2">
                  نتائج مثبتة
                </h3>
                <p className="text-sky-900/70 text-sm">
                  مع مئات الأطفال والعائلات
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Benefits */}
      <section dir="rtl" className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-sky-50 to-green-50 rounded-3xl border border-sky-100 p-6">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-2xl md:text-3xl font-extrabold text-sky-900 mb-6 text-right">
                  ما مدى استفادة طفلك من Movokids؟
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-sm text-right">
                    <div className="text-3xl">🎯</div>
                    <h3 className="mt-3 font-bold text-sky-900">تركيز أقوى</h3>
                    <p className="text-sky-900/70 text-sm mt-1">
                      أنشطة يومية تشجّع على الانتباه لفترات أطول.
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-sm text-right">
                    <div className="text-3xl">🧘</div>
                    <h3 className="mt-3 font-bold text-sky-900">سلوك أفضل</h3>
                    <p className="text-sky-900/70 text-sm mt-1">
                      ألعاب وتمارين تعلم الصبر وضبط النفس.
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-sm text-right">
                    <div className="text-3xl">✍️</div>
                    <h3 className="mt-3 font-bold text-sky-900">
                      مهارات أكاديمية
                    </h3>
                    <p className="text-sky-900/70 text-sm mt-1">
                      تدريبات على الأرقام، الحروف، والذاكرة.
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-sm text-right">
                    <div className="text-3xl">🌟</div>
                    <h3 className="mt-3 font-bold text-sky-900">ثقة بالنفس</h3>
                    <p className="text-sky-900/70 text-sm mt-1">
                      جوائز تحفيزية لكل إنجاز.
                    </p>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="relative mx-auto w-full max-w-md aspect-square rounded-3xl overflow-hidden border border-sky-100 bg-white shadow">
                  <img
                    src="/hero/kids_4.png"
                    alt="أنشطة ممتعة"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section id="why" dir="rtl" className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-6">
              <div className="bg-white/90 rounded-3xl border border-sky-100 p-6 shadow-sm flex flex-col items-start">
                <h2 className="text-2xl font-extrabold text-sky-900 mb-4">
                  لماذا نحن؟
                </h2>
                <ul className="space-y-3 text-sky-900/85 text-right">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-xl">✔️</span>
                    <span>منصة ممتعة وسهلة الاستخدام</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-xl">✔️</span>
                    <span>أنشطة أعدها مختصون في علم النفس للأطفال</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-xl">✔️</span>
                    <span>محتوى ثنائي اللغة (عربي + إنجليزي)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-xl">✔️</span>
                    <span>تناسب جميع الاعمار</span>
                  </li>
                </ul>
                <div className="mt-6 flex">
                  <Link
                    href="/auth/signup"
                    className="px-5 py-3 rounded-2xl bg-green-500 text-white font-semibold hover:bg-green-600 shadow"
                  >
                    جرّب مجانًا الآن
                  </Link>
                </div>
              </div>
              <div className="rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 to-sky-50 p-6 text-right">
                <h3 className="text-xl font-bold text-sky-900">
                  رحلة طفلك معنا تبدأ من هنا
                </h3>
                <ol className="mt-3 space-y-2 text-sky-900/80">
                  <li>1) اختبار تمهيدي بسيط لتحديد نقاط القوة والتحديات.</li>
                  <li>2) خطة تدريب يومية قصيرة وممتعة.</li>
                  <li>3) متابعة التقدم وتقارير واضحة للأهل.</li>
                  <li>4) جلسات أونلاين مع مختصين عند الحاجة.</li>
                </ol>
                <div className="mt-4 flex items-center gap-2 text-sky-800/70 text-sm">
                  <span>⏱️ 10–15 دقيقة يوميًا</span>
                  <span>•</span>
                  <span>🎮 لعب + تعلم</span>
                </div>
              </div>
            </div>
            <div>
              <div className="relative mx-auto w-full max-w-md aspect-square rounded-3xl overflow-hidden border border-sky-100 bg-white shadow">
                <img
                  src="/hero/kids_2.png"
                  alt="تعلم وتفاعل"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section dir="rtl" className="relative z-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-sky-600 to-green-600 p-6 text-white text-right shadow">
            <h2 className="text-2xl md:text-3xl font-extrabold">
              ابدأ رحلة طفلك اليوم
            </h2>
            <p className="mt-2 text-white/90">
              انضم إلى Movokids واصنع فارقًا حقيقيًا بخطوات بسيطة وممتعة.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                href="/auth/signup"
                className="px-5 py-3 rounded-2xl bg-white text-sky-700 font-semibold hover:bg-sky-50"
              >
                إنشاء حساب
              </Link>
              <Link
                href="/auth/login"
                className="px-5 py-3 rounded-2xl bg-white/10 border border-white/30 text-white hover:bg-white/20"
              >
                لدي حساب مسبقًا
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Parents' Reviews */}
      <section dir="rtl" className="relative z-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-sky-900 text-center mb-8">
            آراء الأهل
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Review 1 */}
            <div className="bg-white/90 rounded-3xl border border-sky-100 p-6 shadow-sm text-right">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-sky-900/80 mb-4">
                "منصة رائعة ساعدت ابني كثيرًا في التركيز والانتباه. الأنشطة
                ممتعة وسهلة الاستخدام، وأصبح طفلي يتطلع لممارسة التمارين
                اليومية."
              </p>
              <div className="flex flex-row-reverse justify-end items-center gap-3">
                <div className="text-right">
                  <p className="font-bold text-sky-900">أم أحمد</p>
                  <p className="text-sm text-sky-700">الرياض، السعودية</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-green-400 flex items-center justify-center text-white font-bold text-lg">
                  أ
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white/90 rounded-3xl border border-sky-100 p-6 shadow-sm text-right">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-sky-900/80 mb-4">
                "التطبيق سهل الاستخدام والجلسات مع المختصين كانت مفيدة جدًا.
                لاحظت تحسنًا كبيرًا في سلوك ابنتي بعد أسبوعين فقط."
              </p>
              <div className="flex flex-row-reverse justify-end items-center gap-3">
                <div className="text-right">
                  <p className="font-bold text-sky-900">أبو خالد</p>
                  <p className="text-sm text-sky-700">جدة، السعودية</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-sky-400 flex items-center justify-center text-white font-bold text-lg">
                  خ
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white/90 rounded-3xl border border-sky-100 p-6 shadow-sm text-right">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-sky-900/80 mb-4">
                "شكرًا لـ Movokids على هذه المنصة المميزة. طفلي أصبح أكثر هدوءًا
                وقدرته على التحكم بالانفعالات تحسنت بشكل ملحوظ."
              </p>
              <div className="flex flex-row-reverse justify-end items-center gap-3">
                <div className="text-right">
                  <p className="font-bold text-sky-900">أم سارة</p>
                  <p className="text-sm text-sky-700">دبي، الإمارات</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-green-400 flex items-center justify-center text-white font-bold text-lg">
                  س
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section dir="rtl" className="relative z-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-sky-900 mb-2">
              مقالاتنا
            </h2>
            <p className="text-sky-900/70">
              اكتشف أحدث النصائح والموارد لدعم طفلك
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Blog Post 1 */}
            <article className="bg-white/90 rounded-3xl border border-sky-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-48 bg-gradient-to-br from-sky-100 to-green-100">
                <div className="absolute inset-0 flex items-center justify-center text-6xl">
                  🧠
                </div>
              </div>
              <div className="p-6 text-right">
                <div className="text-xs text-sky-700 mb-2">15 أكتوبر، 2024</div>
                <h3 className="text-xl font-bold text-sky-900 mb-3">
                  كيف تساعد طفلك على تحسين التركيز؟
                </h3>
                <p className="text-sky-900/70 text-sm mb-4">
                  نصائح عملية يومية لتعزيز قدرة طفلك على الانتباه والتركيز في
                  الأنشطة اليومية والدراسة.
                </p>
                <a
                  href="#"
                  className="text-sky-700 hover:text-sky-900 font-semibold text-sm inline-flex items-center gap-1"
                >
                  <span>اقرأ المزيد</span>
                  <span>←</span>
                </a>
              </div>
            </article>

            {/* Blog Post 2 */}
            <article className="bg-white/90 rounded-3xl border border-sky-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-48 bg-gradient-to-br from-green-100 to-sky-100">
                <div className="absolute inset-0 flex items-center justify-center text-6xl">
                  👨‍👩‍👧‍👦
                </div>
              </div>
              <div className="p-6 text-right">
                <div className="text-xs text-sky-700 mb-2">12 أكتوبر، 2024</div>
                <h3 className="text-xl font-bold text-sky-900 mb-3">
                  دور الأهل في دعم الأطفال ذوي فرط الحركة
                </h3>
                <p className="text-sky-900/70 text-sm mb-4">
                  استراتيجيات فعّالة للتعامل مع التحديات اليومية وتقديم الدعم
                  المناسب لطفلك.
                </p>
                <a
                  href="#"
                  className="text-sky-700 hover:text-sky-900 font-semibold text-sm inline-flex items-center gap-1"
                >
                  <span>اقرأ المزيد</span>
                  <span>←</span>
                </a>
              </div>
            </article>

            {/* Blog Post 3 */}
            <article className="bg-white/90 rounded-3xl border border-sky-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-48 bg-gradient-to-br from-sky-100 to-green-100">
                <div className="absolute inset-0 flex items-center justify-center text-6xl">
                  🎯
                </div>
              </div>
              <div className="p-6 text-right">
                <div className="text-xs text-sky-700 mb-2">8 أكتوبر، 2024</div>
                <h3 className="text-xl font-bold text-sky-900 mb-3">
                  التدريبات اليومية: المفتاح لتطوير المهارات
                </h3>
                <p className="text-sky-900/70 text-sm mb-4">
                  كيف تساعد التمارين القصيرة اليومية في بناء عادات إيجابية
                  وتحسين الأداء الأكاديمي.
                </p>
                <a
                  href="#"
                  className="text-sky-700 hover:text-sky-900 font-semibold text-sm inline-flex items-center gap-1"
                >
                  <span>اقرأ المزيد</span>
                  <span>←</span>
                </a>
              </div>
            </article>
          </div>
          <div className="text-center mt-8">
            <a
              href="#"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 text-white font-semibold hover:bg-sky-600 shadow"
            >
              <span>عرض جميع المقالات</span>
              <span>←</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        dir="rtl"
        className="relative z-10 bg-white/90 border-t border-sky-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-8 text-right">
            {/* Links Section */}
            <div>
              <h3 className="text-lg font-bold text-sky-900 mb-4">
                روابط مهمة
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="text-sky-700 hover:text-sky-900 transition-colors"
                  >
                    سياسة الخصوصية
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sky-700 hover:text-sky-900 transition-colors"
                  >
                    تواصل معنا
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-sky-700 hover:text-sky-900 transition-colors"
                  >
                    من نحن
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Section */}
            <div>
              <h3 className="text-lg font-bold text-sky-900 mb-4">
                تواصل معنا
              </h3>
              <div className="space-y-3">
                <a
                  href="https://wa.me/966500000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sky-700 hover:text-green-600 transition-colors "
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <div className="flex flex-row-reverse gap-1">
                    <span className="">966+</span> <span>50</span>{" "}
                    <span>000</span> <span>0000</span>
                  </div>
                </a>
                <a
                  href="mailto:info@movokids.com"
                  className="flex items-center gap-2 text-sky-700 hover:text-sky-900 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>info@movokids.com</span>
                </a>
              </div>
            </div>

            {/* Social Media Section */}
            <div>
              <h3 className="text-lg font-bold text-sky-900 mb-4">تابعنا</h3>
              <div className="flex gap-4 justify-start">
                <a
                  href="https://facebook.com/movokids"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-700 hover:text-blue-600 transition-colors"
                  aria-label="Facebook"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://twitter.com/movokids"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-700 hover:text-sky-500 transition-colors"
                  aria-label="Twitter"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com/movokids"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-700 hover:text-pink-600 transition-colors"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com/company/movokids"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-700 hover:text-blue-700 transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-6 border-t border-sky-100">
            <p className="text-center text-sky-900/60 text-xs">
              © {new Date().getFullYear()} Movokids. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

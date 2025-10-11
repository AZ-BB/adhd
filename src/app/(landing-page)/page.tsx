import Link from "next/link"
import BackgroundSlideshow from "@/components/BackgroundSlideshow"
import { createSupabaseServerClient } from "@/lib/server"
import { redirect } from "next/navigation"

export default async function Home() {
  // Redirect logged-in users to dashboard
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    redirect("/dashboard")
  }

  const backgrounds = ["/bg2.jpg", "/bg3.webp", "/bg5.webp", "/bg4.jpg"]

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blue-50 to-green-50" dir="rtl">
      {/* Background slideshow for a friendly, soft look */}
      <BackgroundSlideshow images={backgrounds} intervalMs={7000} fadeMs={1200} />
      {/* Soft overlay for readability */}
      <div className="absolute inset-0 bg-white/70" />

      {/* Navbar */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-green-600">
            Movokids
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/en" className="px-3 py-2 rounded-xl bg-white/70 text-sky-700 border border-sky-200 hover:bg-white shadow-sm">
              English
            </Link>
            <Link href="/auth/login" className="px-4 py-2 rounded-xl bg-white/70 text-sky-700 border border-sky-200 hover:bg-white shadow-sm">
              تسجيل الدخول
            </Link>
            <Link href="/auth/signup" className="px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 shadow">
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
                Movokids منصة متكاملة لنساعد طفلك من عمر ٥ إلى 12 عام على اكتشاف قوته الحقيقية
              </h1>
              <p className="mt-4 text-sky-900/80 text-lg md:text-xl">
                مخصّصة لدعم الأطفال من عمر ٥ إلى 12 عام في تطوير مهارات التركيز، التحكم في الانفعالات، وتنمية القدرات التعليمية من خلال تدريبات يومية ممتعة وأنشطة تفاعلية وتقديم جلسات أونلاين مع مختصين.
              </p>
              <p className="mt-3 text-sky-900/70 text-sm md:text-base">
                أما الاختبارات الموجودة في منصتنا فهي مبنية على أدوات تقييم وتشخيص عالمية، لكنها لا تُعطي حكمًا نهائيًا على حالة الطفل، لأن التشخيص المؤكد لا بد أن يتم على يد الطبيب المختص. هدفنا أن نقدّم مؤشرات أولية تساعد الأهل على فهم التحديات، ثم نوفر تدريبات مع مختصين لتقوية قدرات الأطفال خطوة بخطوة وتحويل الصعوبات إلى إنجازات.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <Link href="/auth/signup" className="px-5 py-3 rounded-2xl bg-green-500 text-white font-semibold hover:bg-green-600 shadow">
                  ابدأ الآن مجانًا
                </Link>
                <a href="#why" className="px-5 py-3 rounded-2xl bg-white text-sky-700 border border-sky-200 hover:bg-sky-50">
                  لماذا Movokids؟
                </a>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2 text-sky-800/70 text-sm">
                <span>👨‍👩‍👧 مناسب للأهل</span>
                <span>•</span>
                <span>🧒 مناسب للأطفال</span>
                <span>•</span>
                <span>🔒 آمن وموثوق</span>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative mx-auto w-full max-w-md aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-sky-100 to-green-100 border border-white/60 shadow-xl flex items-center justify-center">
                <img src="/hero.png" alt="صورة توضيحية لمنصة Movokids" className="w-full h-full object-cover" />
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
                  <h2 className="text-2xl font-bold text-sky-900 mb-2">مهمتنا</h2>
                  <p className="text-sky-900/80">
                    أن نحوّل التحديات اليومية لأطفال صعوبة الانتباه وفرط الحركة إلى قصص نجاح، من خلال تدريبات عملية، تقييمات وجلسات تفاعلية مع متخصصين.
                  </p>
                </div>
                <div className="sm:order-1">
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-sky-100 bg-white">
                    <img src="/hero/kids_3.png" alt="تعلّم ممتع" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>

            {/* Vision: text with side image mosaic (alternating order) */}
            <div className="bg-white/90 rounded-3xl border border-green-100 p-6 shadow-sm">
              <div className="grid sm:grid-cols-2 gap-5 items-center">
                <div className="sm:order-2 text-right">
                  <h2 className="text-2xl font-bold text-sky-900 mb-2">رؤيتنا</h2>
                  <p className="text-sky-900/80">
                    أن ننشئ عالمًا يتمكّن فيه كل طفل من النمو، والتعلم، والتألق. نؤمن أن كل طفل يستحق فرصة للوصول إلى دعم متخصص، وأنشطة تعليمية ممتعة، ومساحة آمنة تساعده على التطور مهما كانت التحديات.
                  </p>
                </div>
                <div className="sm:order-1">
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-sky-100 bg-white">
                    <img src="/hero/kids_1.png" alt="نشاط عملي" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                </div>
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
                  ماذا سيتوقع أن يستفيد طفلك من Movokids؟
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-sm text-right">
                    <div className="text-3xl">🎯</div>
                    <h3 className="mt-3 font-bold text-sky-900">تركيز أقوى</h3>
                    <p className="text-sky-900/70 text-sm mt-1">أنشطة يومية تشجّع على الانتباه لفترات أطول.</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-sm text-right">
                    <div className="text-3xl">🧘</div>
                    <h3 className="mt-3 font-bold text-sky-900">سلوك أفضل</h3>
                    <p className="text-sky-900/70 text-sm mt-1">ألعاب وتمارين تعلم الصبر وضبط النفس.</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-sm text-right">
                    <div className="text-3xl">✍️</div>
                    <h3 className="mt-3 font-bold text-sky-900">مهارات أكاديمية</h3>
                    <p className="text-sky-900/70 text-sm mt-1">تدريبات على الأرقام، الحروف، والذاكرة.</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-sm text-right">
                    <div className="text-3xl">🌟</div>
                    <h3 className="mt-3 font-bold text-sky-900">ثقة بالنفس</h3>
                    <p className="text-sky-900/70 text-sm mt-1">جوائز تحفيزية لكل إنجاز.</p>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="relative mx-auto w-full max-w-md aspect-square rounded-3xl overflow-hidden border border-sky-100 bg-white shadow">
                  <img src="/hero/kids_4.png" alt="أنشطة ممتعة" className="absolute inset-0 w-full h-full object-cover" />
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
              <div className="bg-white/90 rounded-3xl border border-sky-100 p-6 shadow-sm">
                <h2 className="text-2xl font-extrabold text-sky-900 mb-4">لماذا نحن؟</h2>
                <ul className="space-y-3 text-sky-900/85 text-right">
                  <li className="flex items-start gap-2 justify-end">
                    <span className="text-green-600 text-xl">✔️</span>
                    <span>محتوى ثنائي اللغة (عربي + إنجليزي)</span>
                  </li>
                  <li className="flex items-start gap-2 justify-end">
                    <span className="text-green-600 text-xl">✔️</span>
                    <span>أنشطة أعدها مختصون في علم النفس للأطفال</span>
                  </li>
                  <li className="flex items-start gap-2 justify-end">
                    <span className="text-green-600 text-xl">✔️</span>
                    <span>منصة ممتعة وسهلة الاستخدام</span>
                  </li>
                  <li className="flex items-start gap-2 justify-end">
                    <span className="text-green-600 text-xl">✔️</span>
                    <span>أسعار اشتراك مناسبة</span>
                  </li>
                </ul>
                <div className="mt-6 flex justify-end">
                  <Link href="/auth/signup" className="px-5 py-3 rounded-2xl bg-green-500 text-white font-semibold hover:bg-green-600 shadow">
                    جرّب مجانًا الآن
                  </Link>
                </div>
              </div>
              <div className="rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 to-sky-50 p-6 text-right">
                <h3 className="text-xl font-bold text-sky-900">كيف نعمل؟</h3>
                <ol className="mt-3 space-y-2 text-sky-900/80">
                  <li>1) اختبار تمهيدي بسيط لتحديد نقاط القوة والتحديات.</li>
                  <li>2) خطة تدريب يومية قصيرة وممتعة.</li>
                  <li>3) متابعة التقدم وتقارير واضحة للأهل.</li>
                  <li>4) جلسات أونلاين مع مختصين عند الحاجة.</li>
                </ol>
                <div className="mt-4 flex items-center justify-end gap-2 text-sky-800/70 text-sm">
                  <span>⏱️ 10–15 دقيقة يوميًا</span>
                  <span>•</span>
                  <span>🎮 لعب + تعلم</span>
                </div>
              </div>
            </div>
            <div>
              <div className="relative mx-auto w-full max-w-md aspect-square rounded-3xl overflow-hidden border border-sky-100 bg-white shadow">
                <img src="/hero/kids_2.png" alt="تعلم وتفاعل" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section dir="rtl" className="relative z-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-sky-600 to-green-600 p-6 text-white text-right shadow">
            <h2 className="text-2xl md:text-3xl font-extrabold">ابدأ رحلة طفلك اليوم</h2>
            <p className="mt-2 text-white/90">انضم إلى Movokids واصنع فارقًا حقيقيًا بخطوات بسيطة وممتعة.</p>
            <div className="mt-4 flex justify-end gap-3">
              <Link href="/auth/signup" className="px-5 py-3 rounded-2xl bg-white text-sky-700 font-semibold hover:bg-sky-50">
                إنشاء حساب
              </Link>
              <Link href="/auth/login" className="px-5 py-3 rounded-2xl bg-white/10 border border-white/30 text-white hover:bg-white/20">
                لدي حساب مسبقًا
              </Link>
            </div>
          </div>
          <p className="mt-4 text-center text-sky-900/60 text-xs">© {new Date().getFullYear()} Movokids. جميع الحقوق محفوظة.</p>
        </div>
      </section>
    </div>
  )
}

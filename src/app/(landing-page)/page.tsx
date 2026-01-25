import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { getBlogsCached } from "@/actions/blogs"
import LandingNav from "@/components/LandingNav"
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

  // Fetch latest 3 blogs
  const { rows: blogs } = await getBlogsCached({
    offset: 0,
    limit: 3,
    search: "",
  })

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-green-50 to-sky-100"
      dir="rtl"
    >
      {/* Navbar */}
      <LandingNav
        isRtl={true}
        logoHref="/"
        navItems={[
          { label: "English", href: "/en" },
          { label: "الأسعار والخطط", href: "/pricing" },
          { label: "تسجيل الدخول", href: "/auth/login" },
          { label: "ابدأ الآن", href: "/auth/signup", isPrimary: true },
        ]}
      />

      {/* Hero Section */}
      <section
        dir="rtl"
        className="relative z-10 bg-cover bg-no-repeat bg-right md:bg-center"
        style={{ backgroundImage: "url('/landing/ar/1_ar.png')" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 md:pt-10 md:pb-16 lg:pt-14 lg:pb-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1 text-right">
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-white">
                Movokids
                <br />
                منصه متكاملة تساعد طفلك علي اكتشاف قوّته الحقيقية
              </h1>
              <p className="mt-4 text-white/80 text-lg md:text-xl">
                منصّتنا مخصّصة لدعم الأطفال و المراهقين من عمر 6 إلى 12 عامًا في
                تطوير مهارات التركيز، وتعزيز التحكّم في الاندفاعات، وتنمية
                القدرات العقلية عبر تدريبات يومية ممتعة وأنشطة تفاعلية مبتكرة.
              </p>
              <p className="mt-3 text-white/70 text-sm md:text-base">
                كما نوفر جلسات أونلاين فردية وجماعية مع متخصصين لمتابعة تقدّم
                الطفل
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
                  className="px-5 py-3 rounded-2xl bg-white text-green-700 border border-green-200 hover:bg-green-50"
                >
                  لماذا Movokids؟
                </a>
              </div>
              <div className="mt-4 flex items-center gap-2 text-white/70 text-sm">
                <span>👨‍👩‍👧 مناسب للأهل</span>
                <span>•</span>
                <span>🧒 مناسب للأطفال</span>
                <span>•</span>
                <span>🔒 آمن وموثوق</span>
              </div>
            </div>
            <div className="order-1 md:order-2"></div>
          </div>
        </div>
      </section>

      {/* Introduction Video Section */}
      <section dir="rtl" className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-sky-900 mb-2">
              تعرّف على Movokids
            </h2>
            <p className="text-sky-900/70">
              شاهد هذا الفيديو التعريفي لمعرفة المزيد عن منصتنا
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg border border-sky-100 bg-white/90">
              <iframe
                src="https://www.youtube.com/embed/psRBFRy8HNM"
                title="Movokids Introduction Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
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
                    نحوّل التحديات اليومية التي يواجهها الأطفال في التركيز
                    والانتباه وإتمام المهام إلى قصة نجاح؛ وذلك عبر تدريبات
                    عملية، وتقييمات دقيقة، وجلسات تفاعلية مع متخصصين لدعم
                    تطوّرهم خطوة بخطوة.
                  </p>
                </div>
                <div className="sm:order-1">
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-sky-100 bg-white">
                    <img
                      src="/landing/kids_2.png"
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
                    ممتعة، ومساحة آمنة تساعده على التطور و الوصول الي افضل اداء
                    من خلال دعم المتخصصين .
                  </p>
                </div>
                <div className="sm:order-1">
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-sky-100 bg-white">
                    <img
                      src="/landing/kids_1.png"
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
                تم إعداد برامجنا بالتعاون مع أخصائيين نفسيين وأخصائيين في
                التربية الخاصة
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-gradient-to-br from-sky-50 to-white rounded-2xl border border-sky-100 p-5 text-center shadow-sm">
                <div className="text-4xl mb-3">🌍</div>
                <h3 className="font-bold text-sky-900 text-lg mb-2">
                  أدوات تقييم حديثة
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
                  جلسات مع متخصصين
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
      <section
        dir="rtl"
        className="relative z-10 bg-cover"
        style={{ backgroundImage: "url('/landing/ar/3_ar.jpg')" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className=" p-6">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-6 text-right">
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
                    <h3 className="mt-3 font-bold text-sky-900">سلوك</h3>
                    <p className="text-sky-900/70 text-sm mt-1">
                      العاب و تمارين و جلسات لتعليم ضبط النفس و التحكم في
                      الانفعالات
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-sm text-right">
                    <div className="text-3xl">🧘</div>
                    <h3 className="mt-3 font-bold text-sky-900">دعم الاسرة</h3>
                    <p className="text-sky-900/70 text-sm mt-1">
                      من خلال متابعه دائمه للاسره بالاضافة الي جلسات ارشاد اسري
                      و شرح كيفية التعامل مع المراحل العمريه
                    </p>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section
        id="why"
        dir="rtl"
        className="relative z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/landing/ar/2_ar.jpg')" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div></div>
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
                    <span>أنشطة أعدها متخصصون في علم النفس للأطفال</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-xl">✔️</span>
                    <span>محتوى ثنائي اللغة (عربي + إنجليزي)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-xl">✔️</span>
                    <span>للاطفال و المراهقين</span>
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
                  <li>1) استبيان تمهيدي بسيط لتحديد نقاط القوة والضعف.</li>
                  <li>2) خطة تدريب يومية قصيرة وممتعة.</li>
                  <li>3) جلسات أونلاين مع مختصين عند الحاجة.</li>
                </ol>
                <div className="mt-4 flex items-center gap-2 text-sky-800/70 text-sm">
                  <span>⏱️ 10–15 دقيقة يوميًا</span>
                  <span>•</span>
                  <span>🎮 لعب + تعلم</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Parents' Reviews */}
      <section dir="rtl" className="relative z-10 py-12">
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
                "لاحظت إن ابني بقى أهدى في البيت، خاصة وقت الواجب. التحسن مو
                كبير جدًا لكنه ملحوظ، وهذا المهم بالنسبة لي. شكرًا Movokids."
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
                "التطبيق بسيط وما يحتاج شرح كثير. جرّبت لابنتي جلستين مع
                الأخصائية وحسّيت إن فيه تغيير بسيط في تهدئة ردود فعلها. إن شاء
                الله نكمل."
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
                "بصراحة كنت قلقانة جدًا في الأول… ما كنت أعرف إذا التدريبات
                هتنفع مع ابني ولا تكون مجرد تطبيق عادي. لكن بعد أسبوع من
                الاستخدام لاحظت إنه بدأ يهدى وقت المذاكرة شوية. حسّيت إن في فرق
                وقررت أستمر وفعلاً اشتركت. تجربة تستحق."
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
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <article
                  key={blog.id}
                  className="bg-white/90 rounded-3xl border border-sky-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48 bg-gradient-to-br from-sky-100 to-green-100">
                    {blog.thumbnailUrl ? (
                      <Image
                        src={blog.thumbnailUrl}
                        alt={blog.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-6xl">
                        📝
                      </div>
                    )}
                  </div>
                  <div className="p-6 text-right">
                    <div className="text-xs text-sky-700 mb-2">
                      {new Date(blog.createdAt).toLocaleDateString("ar-SA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <h3 className="text-xl font-bold text-sky-900 mb-3 line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-sky-900/70 text-sm mb-4 line-clamp-3">
                      {blog.description}
                    </p>
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="text-sky-700 hover:text-sky-900 font-semibold text-sm inline-flex items-center gap-1"
                    >
                      <span>اقرأ المزيد</span>
                      <span>←</span>
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-sky-900/70">لا توجد مقالات حاليًا</p>
              </div>
            )}
          </div>
          {blogs.length > 0 && (
            <div className="text-center mt-8">
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 text-white font-semibold hover:bg-sky-600 shadow"
              >
                <span>عرض جميع المقالات</span>
                <span>←</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section dir="rtl" className="relative z-10 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-sky-900 mb-2">
              الأسئلة الشائعة
            </h2>
            <p className="text-sky-900/70">
              إجابات على الأسئلة الأكثر شيوعًا حول Movokids
            </p>
          </div>
          <div className="space-y-4">
            {/* FAQ 1 */}
            <details className="bg-white/90 rounded-2xl border border-sky-100 p-6 shadow-sm group">
              <summary className="font-bold text-sky-900 text-lg cursor-pointer list-none flex items-center justify-between">
                <span>ما هي منصة MovoKids؟</span>
                <span className="text-green-600 transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <p className="mt-4 text-sky-900/80 text-right leading-relaxed">
                MovoKids هي منصة تعليمية رقمية للأطفال من عمر 6 إلى 12 عام
                متخصصة في تحسين الانتباه، التركيز، والمهارات السلوكية من خلال
                تمارين تفاعلية وأنشطة يومية مصممة من متخصصين.
              </p>
            </details>

            {/* FAQ 2 */}
            <details className="bg-white/90 rounded-2xl border border-sky-100 p-6 shadow-sm group">
              <summary className="font-bold text-sky-900 text-lg cursor-pointer list-none flex items-center justify-between">
                <span>
                  هل منصة MovoKids مناسبة للأطفال المصابين باضطراب فرط الحركة
                  وتشتت الانتباه (ADHD)؟
                </span>
                <span className="text-green-600 transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <p className="mt-4 text-sky-900/80 text-right leading-relaxed">
                نعم، المنصة يمكن أن تساعد في دعم الأطفال المصابين بصعوبات
                التركيز من خلال تقديم أنشطة قصيرة وتفاعلية، وتمارين حسية تساعد
                على تحسين الانتباه بشكل تدريجي دون ضغط.
              </p>
            </details>

            {/* FAQ 3 */}
            <details className="bg-white/90 rounded-2xl border border-sky-100 p-6 shadow-sm group">
              <summary className="font-bold text-sky-900 text-lg cursor-pointer list-none flex items-center justify-between">
                <span>ما نوع الأنشطة المقدمة داخل منصة MovoKids؟</span>
                <span className="text-green-600 transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <div className="mt-4 text-sky-900/80 text-right leading-relaxed">
                <p className="mb-2">تحتوي المنصة على أكثر من 300 تمرين تشمل:</p>
                <ul className="space-y-2 mr-6">
                  <li>• ألعاب تحسين الانتباه</li>
                  <li>• تمارين حسية لتحسين التنظيم السلوكي</li>
                  <li>• تدريبات ذاكرة وتركيز</li>
                  <li>• أنشطة رقمية</li>
                  <li>• ألعاب سرعة استجابة</li>
                  <li>• جلسات مع متخصصين في مجالات الأطفال</li>
                </ul>
              </div>
            </details>

            {/* FAQ 4 */}
            <details className="bg-white/90 rounded-2xl border border-sky-100 p-6 shadow-sm group">
              <summary className="font-bold text-sky-900 text-lg cursor-pointer list-none flex items-center justify-between">
                <span>
                  هل المنصة مناسبة للأطفال الذين ليس لديهم ADHD ولكن لديهم ضعف
                  تركيز فقط؟
                </span>
                <span className="text-green-600 transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <div className="mt-4 text-sky-900/80 text-right leading-relaxed">
                <p className="mb-2">نعم. MovoKids مفيدة للأطفال الذين لديهم:</p>
                <ul className="space-y-2 mr-6">
                  <li>• ضعف تركيز</li>
                  <li>• بطء في الاستجابة</li>
                  <li>• مشاكل بالذاكرة</li>
                  <li>• تشتت ذهني</li>
                  <li>• حاجة لأنشطة ذكية بدل الجلوس على الشاشات بدون فائدة</li>
                </ul>
              </div>
            </details>

            {/* FAQ 5 */}
            <details className="bg-white/90 rounded-2xl border border-sky-100 p-6 shadow-sm group">
              <summary className="font-bold text-sky-900 text-lg cursor-pointer list-none flex items-center justify-between">
                <span>هل الأنشطة يومية أم أسبوعية؟</span>
                <span className="text-green-600 transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <p className="mt-4 text-sky-900/80 text-right leading-relaxed">
                يوجد برنامج تدريبات يومية من 10–15 دقيقة، بالإضافة إلى جلسات
                أسبوعية تتابع تقدم الطفل.
              </p>
            </details>

            {/* FAQ 6 */}
            <details className="bg-white/90 rounded-2xl border border-sky-100 p-6 shadow-sm group">
              <summary className="font-bold text-sky-900 text-lg cursor-pointer list-none flex items-center justify-between">
                <span>هل المحتوى آمن للأطفال؟</span>
                <span className="text-green-600 transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <p className="mt-4 text-sky-900/80 text-right leading-relaxed">
                نعم، جميع التمارين خالية من الإعلانات، وتستخدم ألوانًا آمنة
                بصريًا، وتم تصميمها بالتعاون مع مختصين في تعديل السلوك وتنمية
                المهارات.
              </p>
            </details>

            {/* FAQ 7 */}
            <details className="bg-white/90 rounded-2xl border border-sky-100 p-6 shadow-sm group">
              <summary className="font-bold text-sky-900 text-lg cursor-pointer list-none flex items-center justify-between">
                <span>ما الذي يميز MovoKids عن التطبيقات الأخرى؟</span>
                <span className="text-green-600 transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <div className="mt-4 text-sky-900/80 text-right leading-relaxed">
                <ul className="space-y-2 mr-6">
                  <li>• أنشطة تفاعلية قصيرة وممتعة</li>
                  <li>• تقارير للأهل</li>
                  <li>• جلسات مع متخصصين</li>
                  <li>• مناسب لعمر 6–12 عام</li>
                  <li>• بدون إعلانات</li>
                </ul>
              </div>
            </details>

            {/* FAQ 8 */}
            <details className="bg-white/90 rounded-2xl border border-sky-100 p-6 shadow-sm group">
              <summary className="font-bold text-sky-900 text-lg cursor-pointer list-none flex items-center justify-between">
                <span>
                  هل MovoKids بديل عن العلاج السلوكي أو الدوائي مع الطبيب؟
                </span>
                <span className="text-green-600 transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <p className="mt-4 text-sky-900/80 text-right leading-relaxed">
                لا، منصة MovoKids ليست بديلاً عن العلاج السلوكي أو الدوائي الذي
                يحدده الطبيب المختص. المنصة تقدم تدريبات وأنشطة تفاعلية فقط
                لتحسين التركيز والانتباه عند الأطفال، ولا نُقدّم أي أدوية ولا
                ننصح باستخدام أي دواء.
                <br />
                <br />
                الدور الأساسي لـ MovoKids هو الدعم والتطوير من خلال تمارين يومية
                وجلسات تدريبية اختيارية، بينما يبقى التشخيص ووضع الخطة العلاجية
                — سواء سلوكية أو دوائية — مسؤولية الطبيب المعالج فقط.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        dir="rtl"
        className="relative z-10 bg-white/90 border-t border-sky-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-4 gap-8 text-right">
            {/* Links Section */}
            <div>
              <h3 className="text-lg font-bold text-sky-900 mb-4">عنا</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-sky-700 hover:text-sky-900 transition-colors"
                  >
                    من نحن
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-sky-700 hover:text-sky-900 transition-colors"
                  >
                    الأسعار
                  </Link>
                </li>
              </ul>
            </div>

            {/* Policies Section */}
            <div>
              <h3 className="text-lg font-bold text-sky-900 mb-4">السياسات</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/return-policy"
                    className="text-sky-700 hover:text-sky-900 transition-colors"
                  >
                    سياسة الاسترجاع
                  </Link>
                </li>
                <li>
                  <Link
                    href="/exchange-policy"
                    className="text-sky-700 hover:text-sky-900 transition-colors"
                  >
                    سياسة الاستبدال
                  </Link>
                </li>
                <li>
                  <Link
                    href="/delivery-policy"
                    className="text-sky-700 hover:text-sky-900 transition-colors"
                  >
                    سياسة التوصيل
                  </Link>
                </li>
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
                    href="/terms"
                    className="text-sky-700 hover:text-sky-900 transition-colors"
                  >
                    الشروط والأحكام
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
                  href="https://wa.me/971564251027"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sky-700 hover:text-green-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <div className="flex flex-row-reverse gap-1">
                    <span>+971</span> <span>56</span> <span>425</span> <span>1027</span>
                  </div>
                </a>
                <a
                  href="tel:01115331900"
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>01115331900</span>
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

            {/* Locations Section */}
            <div>
              <h3 className="text-lg font-bold text-sky-900 mb-4">مواقعنا</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sky-700">
                  <svg
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div>
                    <div className="font-semibold">القاهرة، مصر</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sky-700">
                  <svg
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div>
                    <div className="font-semibold">ديلاوير، الولايات المتحدة الأمريكية</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Section */}
            <div>
              <h3 className="text-lg font-bold text-sky-900 mb-4">تابعنا</h3>
              <div className="flex gap-4 justify-start">
                <a
                  href="https://www.facebook.com/profile.php?id=61581882091405"
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
                  href="https://www.instagram.com/movo.kids?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
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

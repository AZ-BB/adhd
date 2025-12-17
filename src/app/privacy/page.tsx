import Link from "next/link"
import Image from "next/image"

export default function PrivacyPolicyPage() {
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
              href="/en/privacy"
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
            سياسة الخصوصية
          </h1>

          <div className="prose prose-sky max-w-none text-right space-y-6 text-sky-900/80 leading-relaxed">
            <p className="text-lg">
              نحن في MovoKids نحترم خصوصيتك ونلتزم بحماية بياناتك وبيانات طفلك. توضح هذه السياسة كيفية جمع واستخدام وحماية المعلومات عند استخدامك لموقعنا وخدماتنا.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                1. المعلومات التي نقوم بجمعها
              </h2>
              <p className="mb-3">قد نقوم بجمع المعلومات التالية:</p>
              <ul className="list-disc mr-6 space-y-2">
                <li>الاسم والبريد الإلكتروني لولي الأمر</li>
                <li>عمر الطفل والفئة العمرية فقط (دون اسم الطفل الكامل)</li>
                <li>بيانات الاستخدام داخل الموقع (مثل الأنشطة المستخدمة ومدة التفاعل)</li>
                <li>معلومات الدفع (تتم معالجتها عبر بوابات دفع آمنة ولا يتم تخزين بيانات البطاقة لدينا)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                2. كيفية استخدام المعلومات
              </h2>
              <p className="mb-3">نستخدم البيانات من أجل:</p>
              <ul className="list-disc mr-6 space-y-2">
                <li>تحسين تجربة الطفل داخل المنصة</li>
                <li>تخصيص الأنشطة بما يتناسب مع الفئة العمرية</li>
                <li>التواصل مع أولياء الأمور بخصوص الحساب أو التحديثات</li>
                <li>تطوير المحتوى والخدمات التعليمية</li>
              </ul>
              <div className="bg-yellow-50 border-r-4 border-yellow-400 p-4 mt-4 rounded">
                <p className="font-semibold text-yellow-900 mb-2">ملاحظة مهمة:</p>
                <p className="text-yellow-800">
                  MovoKids منصة تعليمية وتدريبية، ولا تقدم تشخيصًا طبيًا أو علاجًا لأي حالة.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                3. حماية البيانات
              </h2>
              <p>
                نطبق إجراءات أمنية وتقنية لحماية البيانات من الوصول غير المصرح به أو الاستخدام الخاطئ.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                4. مشاركة المعلومات
              </h2>
              <p className="mb-3">لا نقوم ببيع أو مشاركة البيانات مع أي طرف ثالث، باستثناء:</p>
              <ul className="list-disc mr-6 space-y-2">
                <li>مزودي خدمات الدفع</li>
                <li>متطلبات قانونية أو تنظيمية عند الحاجة</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                5. حقوق المستخدم
              </h2>
              <p className="mb-3">يحق لك:</p>
              <ul className="list-disc mr-6 space-y-2">
                <li>طلب تعديل أو حذف بياناتك</li>
                <li>إيقاف الحساب في أي وقت</li>
                <li>الاستفسار عن كيفية استخدام بياناتك</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                للتواصل بخصوص الخصوصية
              </h2>
              <p>
                📧 <a href="mailto:info@movokids.com" className="text-sky-700 hover:text-sky-900 underline">info@movokids.com</a>
              </p>
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


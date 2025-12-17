import Link from "next/link"
import Image from "next/image"

export default function TermsAndConditionsPage() {
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
              href="/en/terms"
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
            الشروط والأحكام
          </h1>

          <div className="prose prose-sky max-w-none text-right space-y-6 text-sky-900/80 leading-relaxed">
            <p className="text-lg">
              مرحبًا بك في MovoKids. من خلال استخدامك لموقعنا وخدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                1. قبول الشروط
              </h2>
              <p className="mb-3">
                باستخدامك لمنصة MovoKids، فإنك تقر بأنك قد قرأت وفهمت ووافقت على الالتزام بهذه الشروط والأحكام وسياسة الخصوصية الخاصة بنا.
              </p>
              <p className="mb-3">
                باستخدامك لموقع MovoKids، فإنك توافق على الشروط التالية:
              </p>
              <ul className="list-disc mr-6 space-y-2">
                <li>المحتوى المقدم تعليمي وتفاعلي، ولا يُعد تشخيصًا طبيًا أو علاجًا.</li>
                <li>يُستخدم الموقع تحت إشراف الوالدين أو أولياء الأمور.</li>
                <li>يمنع مشاركة الحساب مع أطراف أخرى.</li>
                <li>جميع حقوق الملكية الفكرية للمحتوى محفوظة لـ MovoKids.</li>
                <li>تحتفظ MovoKids بحق تعديل المحتوى أو الأسعار أو السياسات في أي وقت.</li>
                <li>الاستخدام المخالف أو المسيء قد يؤدي إلى إيقاف الحساب دون إشعار.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                2. استخدام الخدمة
              </h2>
              <p className="mb-3">يجب استخدام منصة MovoKids للأغراض التعليمية والتدريبية فقط. أنت توافق على:</p>
              <ul className="list-disc mr-6 space-y-2">
                <li>عدم استخدام المنصة لأي غرض غير قانوني أو غير مصرح به</li>
                <li>عدم محاولة الوصول غير المصرح به إلى أنظمة المنصة</li>
                <li>عدم مشاركة حسابك مع أشخاص آخرين</li>
                <li>المسؤولية عن جميع الأنشطة التي تتم تحت حسابك</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                3. الحسابات والاشتراكات
              </h2>
              <p className="mb-3">عند إنشاء حساب:</p>
              <ul className="list-disc mr-6 space-y-2">
                <li>يجب أن تكون المعلومات المقدمة دقيقة وكاملة</li>
                <li>أنت مسؤول عن الحفاظ على سرية معلومات حسابك</li>
                <li>يجب إخطارنا فورًا بأي استخدام غير مصرح به لحسابك</li>
                <li>الاشتراكات قابلة للتجديد تلقائيًا ما لم يتم إلغاؤها</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                4. المحتوى والملكية الفكرية
              </h2>
              <p className="mb-3">
                جميع المحتويات الموجودة على منصة MovoKids، بما في ذلك النصوص والصور والألعاب والبرامج، محمية بحقوق الطبع والنشر والملكية الفكرية. لا يجوز لك:
              </p>
              <ul className="list-disc mr-6 space-y-2">
                <li>نسخ أو توزيع أو تعديل أي محتوى من المنصة</li>
                <li>استخدام المحتوى لأغراض تجارية دون إذن كتابي</li>
                <li>إزالة أي إشعارات حقوق الطبع والنشر</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                5. إخلاء المسؤولية الطبية
              </h2>
              <div className="bg-red-50 border-r-4 border-red-400 p-4 mt-4 rounded">
                <p className="font-semibold text-red-900 mb-2">تنبيه مهم:</p>
                <p className="text-red-800 mb-3">
                  MovoKids هي منصة تعليمية وتدريبية فقط. نحن لا نقدم:
                </p>
                <ul className="list-disc mr-6 space-y-2 text-red-800">
                  <li>تشخيصًا طبيًا لأي حالة</li>
                  <li>علاجًا طبيًا أو دوائيًا</li>
                  <li>استشارة طبية بديلة للطبيب المختص</li>
                </ul>
                <p className="text-red-800 mt-3">
                  يجب استشارة الطبيب المختص للحصول على التشخيص والعلاج المناسب. MovoKids هي أداة دعم وتطوير فقط.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                6. سياسة مدة الخدمة
              </h2>
              <ul className="list-disc mr-6 space-y-2">
                <li>يتم تفعيل الحساب فور إتمام عملية الدفع بنجاح.</li>
                <li>مدة الاشتراك تكون شهرية أو سنوية حسب الخطة المختارة.</li>
                <li>يظل الوصول متاحًا طوال فترة الاشتراك فقط.</li>
                <li>في حال انتهاء الاشتراك، سيتم تعليق الوصول تلقائيًا حتى التجديد.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                7. سياسة الاسترجاع
              </h2>
              <p className="mb-3">
                نظرًا لأن MovoKids تقدم محتوى رقميًا وخدمات تعليمية عبر الإنترنت:
              </p>
              <ul className="list-disc mr-6 space-y-2">
                <li>لا يمكن استرجاع أو استبدال الاشتراك بعد تفعيل الحساب</li>
                <li>في حال وجود مشكلة تقنية تمنع استخدام الخدمة، يتم مراجعة الحالة ودعم المستخدم</li>
                <li>يمكن إلغاء الاشتراك قبل موعد التجديد التالي بدون أي رسوم إضافية</li>
              </ul>
              <div className="bg-yellow-50 border-r-4 border-yellow-400 p-4 mt-4 rounded">
                <p className="font-semibold text-yellow-900">
                  📌 لا يوجد استبدال لأن الخدمة رقمية وغير قابلة للنقل.
                </p>
              </div>
              <p className="mt-4">
                جميع المدفوعات تتم عبر بوابات دفع آمنة. لأي استفسارات حول الاسترداد، يرجى التواصل معنا عبر <a href="mailto:info@movokids.com" className="text-sky-700 hover:text-sky-900 underline">info@movokids.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                8. إلغاء الحساب
              </h2>
              <p>
                يمكنك إلغاء حسابك في أي وقت من خلال إعدادات الحساب أو بالتواصل معنا. سيتم حذف بياناتك وفقًا لسياسة الخصوصية الخاصة بنا.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                9. التعديلات على الشروط
              </h2>
              <p>
                نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم إشعارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال المنصة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                10. التواصل معنا
              </h2>
              <p className="mb-3">
                يسعدنا تواصلك معنا في أي وقت 🌟 فريق MovoKids موجود لدعمك والإجابة على جميع استفساراتك.
              </p>
              <p className="mb-2">طرق التواصل:</p>
              <ul className="list-disc mr-6 space-y-2">
                <li>📧 البريد الإلكتروني: <a href="mailto:info@movokids.com" className="text-sky-700 hover:text-sky-900 underline">info@movokids.com</a></li>
                <li>🌐 عبر نموذج التواصل في الموقع</li>
                <li>⏰ يتم الرد خلال 24–48 ساعة عمل</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                11. القانون الحاكم
              </h2>
              <p>
                تخضع هذه الشروط والأحكام للقوانين المحلية المعمول بها. أي نزاع ينشأ عن هذه الشروط سيتم حله وفقًا للقوانين المحلية.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                12. من نحن
              </h2>
              <p className="mb-3">
                MovoKids هي منصة تعليمية رقمية تفاعلية مخصصة للأطفال، تهدف إلى تنمية مهارات:
              </p>
              <ul className="list-disc mr-6 space-y-2 mb-3">
                <li>التركيز والانتباه</li>
                <li>الذاكرة</li>
                <li>التفكير المنطقي</li>
                <li>حل المشكلات</li>
              </ul>
              <p>
                نقدم أنشطة وألعابًا تعليمية مصممة بعناية، تعتمد على أساليب تعليم حديثة قائمة على اللعب والتفاعل، لمساعدة الأطفال على تطوير قدراتهم الذهنية في بيئة آمنة ومحفزة.
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


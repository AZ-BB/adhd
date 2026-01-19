import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createSupabaseServerClient } from "@/lib/server"
import { signup as signupAction } from "@/actions/users"
import BackgroundSlideshow from "@/components/BackgroundSlideshow"
import GoogleSignInButton from "@/components/auth/GoogleSignInButton"

async function signup(formData: FormData) {
  "use server"
  const email = String(formData.get("email") || "").trim()
  const password = String(formData.get("password") || "")
  const child_first_name = String(formData.get("child_first_name") || "").trim()
  const child_last_name = String(formData.get("child_last_name") || "").trim()
  const child_birthday = String(formData.get("child_birthday") || "").trim()
  const child_gender = String(formData.get("child_gender") || "").trim()
  const initial_quiz_score = Number(formData.get("initial_quiz_score") || "0")
  const inattention_score = Number(formData.get("inattention_score") || "0")
  const hyperactivity_score = Number(formData.get("hyperactivity_score") || "0")
  const impulsivity_score = Number(formData.get("impulsivity_score") || "0")
  const parent_first_name = String(
    formData.get("parent_first_name") || ""
  ).trim()
  const parent_last_name = String(formData.get("parent_last_name") || "").trim()
  const parent_phone = String(formData.get("parent_phone") || "").trim()
  const parent_nationality = String(
    formData.get("parent_nationality") || ""
  ).trim()

  const result = await signupAction({
    email,
    password,
    child_first_name,
    child_last_name,
    child_birthday,
    child_gender,
    parent_first_name,
    parent_last_name,
    parent_phone,
    parent_nationality,
    initial_quiz_score,
    inattention_score,
    hyperactivity_score,
    impulsivity_score,
  })

  if (result.success) {
    // Clear any saved form data on success
    try {
      const cookieStore = await cookies()
      cookieStore.delete("signup_form_data")
    } catch {}
    redirect("/auth/login")
  } else {
    // Save form data to cookies to preserve it on redirect
    try {
      const cookieStore = await cookies()
      const formDataToSave = {
        email,
        child_first_name,
        child_last_name,
        child_birthday,
        child_gender,
        parent_first_name,
        parent_last_name,
        parent_phone,
        parent_nationality,
        initial_quiz_score,
        inattention_score,
        hyperactivity_score,
        impulsivity_score,
      }
      cookieStore.set("signup_form_data", JSON.stringify(formDataToSave), {
        path: "/",
        maxAge: 60 * 5, // 5 minutes
      })
    } catch {}
    
    const errorMessages = result.errors
      ?.map((err) => `${err.field}:${err.messageAr}`)
      .join("|||")
    redirect(`/auth/signup?errors=${encodeURIComponent(errorMessages || "")}`)
  }
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    redirect("/dashboard")
  }
  const message = typeof params?.message === "string" ? params.message : ""
  const error = typeof params?.error === "string" ? params.error : ""

  // Parse field-specific errors
  const errorsParam = typeof params?.errors === "string" ? params.errors : ""
  const errorsMap: Record<string, string> = {}
  if (errorsParam) {
    errorsParam.split("|||").forEach((errorPair) => {
      const [field, message] = errorPair.split(":")
      if (field && message) {
        errorsMap[field] = message
      }
    })
  }

  // Get saved form data from cookies
  let savedFormData: Record<string, string | number> = {}
  try {
    const cookieStore = await cookies()
    const savedData = cookieStore.get("signup_form_data")?.value
    if (savedData) {
      savedFormData = JSON.parse(savedData)
    }
  } catch {}

  return (
    <div
      className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      dir="rtl"
    >
      <BackgroundSlideshow
        images={["/bg3.webp", "/bg5.webp", "/bg4.jpg"]}
        intervalMs={6000}
        fadeMs={1200}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-indigo-50/70 to-pink-50/70"></div>

      {/* Language Switcher */}
      <div className="absolute top-4 left-4 z-20">
        <a
          href="/auth/signup/en"
          className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-md border border-white/30 rounded-xl text-sm text-gray-700 hover:bg-white shadow-sm transition-all"
        >
          English
        </a>
      </div>

      <div className="relative max-w-2xl w-full">
        <div className="glass rounded-3xl shadow-2xl ring-1 ring-white/60 backdrop-blur-lg p-6 sm:p-10 animate-fade-in">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-700">
              لنقم بإنشاء حسابك ✨
            </h1>
            <p className="mt-2 text-sm sm:text-base text-indigo-900/70">
              لك ولنجمك الصغير 🌟
            </p>
            <p className="mt-3 text-sm text-gray-600">
              لديك حساب بالفعل؟{" "}
              <a
                href="/auth/login"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                تسجيل الدخول
              </a>
            </p>
          </div>

          {message && (
            <div className="mt-4 text-sm text-center p-3 rounded-xl bg-green-50 text-green-700 border border-green-200">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 text-sm text-center p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}
          {errorsMap.general && (
            <div className="mt-4 text-sm text-center p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
              {errorsMap.general}
            </div>
          )}

          <form className="mt-8 space-y-8" action={signup}>
            <div className="rounded-2xl">
              <h2 className="text-base font-semibold text-indigo-800 mb-3 text-right">
                عن طفلك 🧒
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="child_first_name"
                    className="block text-sm font-medium text-indigo-900 mb-1 text-right"
                  >
                    الاسم الأول للطفل
                  </label>
                  <input
                    id="child_first_name"
                    name="child_first_name"
                    type="text"
                    required
                    placeholder="مثال: أحمد"
                    defaultValue={savedFormData.child_first_name as string || ""}
                    className={`block w-full px-4 py-3 border-2 rounded-2xl bg-white/80 placeholder-indigo-300 focus:outline-none focus:ring-4 sm:text-sm text-right ${
                      errorsMap.child_first_name
                        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                        : "border-indigo-100 focus:ring-pink-200 focus:border-pink-300"
                    }`}
                  />
                  {errorsMap.child_first_name && (
                    <p className="mt-1 text-xs text-red-600 text-right">
                      {errorsMap.child_first_name}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="child_last_name"
                    className="block text-sm font-medium text-indigo-900 mb-1 text-right"
                  >
                    اسم العائلة للطفل
                  </label>
                  <input
                    id="child_last_name"
                    name="child_last_name"
                    type="text"
                    required
                    placeholder="مثال: محمد"
                    defaultValue={savedFormData.child_last_name as string || ""}
                    className={`block w-full px-4 py-3 border-2 rounded-2xl bg-white/80 placeholder-indigo-300 focus:outline-none focus:ring-4 sm:text-sm text-right ${
                      errorsMap.child_last_name
                        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                        : "border-indigo-100 focus:ring-pink-200 focus:border-pink-300"
                    }`}
                  />
                  {errorsMap.child_last_name && (
                    <p className="mt-1 text-xs text-red-600 text-right">
                      {errorsMap.child_last_name}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="child_birthday"
                    className="block text-sm font-medium text-indigo-900 mb-1 text-right"
                  >
                    تاريخ ميلاد الطفل 🎂
                  </label>
                  <input
                    id="child_birthday"
                    name="child_birthday"
                    type="date"
                    required
                    defaultValue={savedFormData.child_birthday as string || ""}
                    className={`block w-full px-4 py-3 border-2 rounded-2xl bg-white/80 focus:outline-none focus:ring-4 sm:text-sm text-right ${
                      errorsMap.child_birthday
                        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                        : "border-indigo-100 focus:ring-pink-200 focus:border-pink-300"
                    }`}
                  />
                  {errorsMap.child_birthday && (
                    <p className="mt-1 text-xs text-red-600 text-right">
                      {errorsMap.child_birthday}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="child_gender"
                    className="block text-sm font-medium text-indigo-900 mb-1 text-right"
                  >
                    جنس الطفل 🧸
                  </label>
                  <select
                    id="child_gender"
                    name="child_gender"
                    required
                    defaultValue={savedFormData.child_gender as string || ""}
                    className={`block w-full px-4 py-3 border-2 rounded-2xl bg-white focus:outline-none focus:ring-4 sm:text-sm text-right ${
                      errorsMap.child_gender
                        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                        : "border-indigo-100 focus:ring-pink-200 focus:border-pink-300"
                    }`}
                  >
                    <option value="">اختر الجنس</option>
                    <option value="Male">ذكر</option>
                    <option value="Female">أنثى</option>
                  </select>
                  {errorsMap.child_gender && (
                    <p className="mt-1 text-xs text-red-600 text-right">
                      {errorsMap.child_gender}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-indigo-800 mb-3 text-right">
                تفاصيل ولي الأمر 👨‍👩‍👧
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="parent_first_name"
                    className="block text-sm font-medium text-indigo-900 mb-1 text-right"
                  >
                    الاسم الأول لولي الأمر
                  </label>
                  <input
                    id="parent_first_name"
                    name="parent_first_name"
                    type="text"
                    placeholder="الاسم الأول"
                    defaultValue={savedFormData.parent_first_name as string || ""}
                    className={`block w-full px-4 py-3 border-2 rounded-2xl bg-white/80 placeholder-indigo-300 focus:outline-none focus:ring-4 sm:text-sm text-right ${
                      errorsMap.parent_first_name
                        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                        : "border-indigo-100 focus:ring-pink-200 focus:border-pink-300"
                    }`}
                  />
                  {errorsMap.parent_first_name && (
                    <p className="mt-1 text-xs text-red-600 text-right">
                      {errorsMap.parent_first_name}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="parent_last_name"
                    className="block text-sm font-medium text-indigo-900 mb-1 text-right"
                  >
                    اسم العائلة لولي الأمر
                  </label>
                  <input
                    id="parent_last_name"
                    name="parent_last_name"
                    type="text"
                    placeholder="اسم العائلة"
                    defaultValue={savedFormData.parent_last_name as string || ""}
                    className={`block w-full px-4 py-3 border-2 rounded-2xl bg-white/80 placeholder-indigo-300 focus:outline-none focus:ring-4 sm:text-sm text-right ${
                      errorsMap.parent_last_name
                        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                        : "border-indigo-100 focus:ring-pink-200 focus:border-pink-300"
                    }`}
                  />
                  {errorsMap.parent_last_name && (
                    <p className="mt-1 text-xs text-red-600 text-right">
                      {errorsMap.parent_last_name}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="parent_phone"
                    className="block text-sm font-medium text-indigo-900 mb-1 text-right"
                  >
                    هاتف ولي الأمر 📱
                  </label>
                  <input
                    id="parent_phone"
                    name="parent_phone"
                    type="tel"
                    placeholder="رقم الهاتف"
                    defaultValue={savedFormData.parent_phone as string || ""}
                    className={`block w-full px-4 py-3 border-2 rounded-2xl bg-white/80 placeholder-indigo-300 focus:outline-none focus:ring-4 sm:text-sm text-right ${
                      errorsMap.parent_phone
                        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                        : "border-indigo-100 focus:ring-pink-200 focus:border-pink-300"
                    }`}
                  />
                  {errorsMap.parent_phone && (
                    <p className="mt-1 text-xs text-red-600 text-right">
                      {errorsMap.parent_phone}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="parent_nationality"
                    className="block text-sm font-medium text-indigo-900 mb-1 text-right"
                  >
                    جنسية ولي الأمر 🌍
                  </label>
                  <input
                    id="parent_nationality"
                    name="parent_nationality"
                    type="text"
                    placeholder="الجنسية"
                    defaultValue={savedFormData.parent_nationality as string || ""}
                    className={`block w-full px-4 py-3 border-2 rounded-2xl bg-white/80 placeholder-indigo-300 focus:outline-none focus:ring-4 sm:text-sm text-right ${
                      errorsMap.parent_nationality
                        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                        : "border-indigo-100 focus:ring-pink-200 focus:border-pink-300"
                    }`}
                  />
                  {errorsMap.parent_nationality && (
                    <p className="mt-1 text-xs text-red-600 text-right">
                      {errorsMap.parent_nationality}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-indigo-800 mb-3 text-right">
                تفاصيل الحساب 🔐
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-indigo-900 mb-1 text-right"
                  >
                    البريد الإلكتروني
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    defaultValue={savedFormData.email as string || ""}
                    className={`block w-full px-4 py-3 border-2 rounded-2xl bg-white/80 placeholder-indigo-300 focus:outline-none focus:ring-4 sm:text-sm text-right ${
                      errorsMap.email
                        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                        : "border-indigo-100 focus:ring-pink-200 focus:border-pink-300"
                    }`}
                    aria-describedby="email-help"
                  />
                  <p
                    id="email-help"
                    className="mt-1 text-xs text-indigo-900/60 text-right"
                  >
                    لن نشارك بريدك الإلكتروني أبدًا.
                  </p>
                  {errorsMap.email && (
                    <p className="mt-1 text-xs text-red-600 text-right">
                      {errorsMap.email}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-indigo-900 mb-1 text-right"
                  >
                    كلمة المرور
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="٦ أحرف على الأقل"
                    className={`block w-full px-4 py-3 border-2 rounded-2xl bg-white/80 placeholder-indigo-300 focus:outline-none focus:ring-4 sm:text-sm text-right ${
                      errorsMap.password
                        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                        : "border-indigo-100 focus:ring-pink-200 focus:border-pink-300"
                    }`}
                  />
                  {errorsMap.password && (
                    <p className="mt-1 text-xs text-red-600 text-right">
                      {errorsMap.password}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="group relative w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold rounded-2xl text-white bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-pink-200 shadow-lg hover:shadow-xl active:scale-[0.99] transition-all"
              >
                <span className="text-lg">🎉</span>
                إنشاء الحساب
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/70 text-gray-500">أو</span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleSignInButton mode="signup" />
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-indigo-900/70">
            إذا أكملت التقييم، سيتم ربط نتيجتك بعد تسجيل الدخول.
          </div>
        </div>
      </div>
      <div className="pointer-events-none select-none absolute -z-0">
        {/* Decorative floating shapes */}
        <div className="absolute top-20 left-10 w-6 h-6 rounded-full bg-pink-300/70 animate-float"></div>
        <div
          className="absolute bottom-24 right-16 w-8 h-8 rounded-2xl bg-indigo-300/70 rotate-12 animate-float"
          style={{ animationDelay: "0.6s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-4 h-4 rounded-full bg-yellow-300/70 animate-float"
          style={{ animationDelay: "1.2s" }}
        ></div>
      </div>
    </div>
  )
}

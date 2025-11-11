import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createSupabaseServerClient } from "@/lib/server"

async function login(formData: FormData) {
  "use server"
  const email = String(formData.get("email") || "").trim()
  const password = String(formData.get("password") || "")

  if (!email || !password) {
    redirect("/auth/login?error=يرجى%20إدخال%20البريد%20الإلكتروني%20وكلمة%20المرور")
  }

  const supabase = await createSupabaseServerClient()
  const { error, data } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)
  }

  // Check user role and redirect accordingly
  if (data.user) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("auth_id", data.user.id)
      .maybeSingle()

    // Redirect admins to admin dashboard, regular users to user dashboard
    if (userData?.role === "admin" || userData?.role === "super_admin") {
      redirect("/admin")
    }
  }

  redirect("/dashboard")
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // If already logged in, redirect based on role
  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("auth_id", user.id)
      .maybeSingle()

    if (userData?.role === "admin" || userData?.role === "super_admin") {
      redirect('/admin')
    } else {
      redirect('/dashboard')
    }
  }
  
  const message = typeof params?.message === 'string' ? params.message : ""
  const error = typeof params?.error === 'string' ? params.error : ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" dir="rtl">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 left-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 right-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Language Switcher */}
      <div className="absolute top-6 left-6 z-20">
        <a
          href="/auth/login/en"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-lg border border-white/40 rounded-2xl text-sm font-medium text-gray-700 hover:bg-white hover:shadow-lg shadow-md transition-all duration-300 hover:scale-105"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          English
        </a>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo/Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              مرحباً بعودتك
            </h1>
            <p className="text-gray-600 text-base">
              ليس لديك حساب؟{' '}
              <a href="/auth/signup" className="font-semibold text-indigo-600 hover:text-purple-600 transition-colors duration-200 hover:underline">
                إنشاء حساب جديد
              </a>
            </p>
          </div>

          {message && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{message}</span>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" action={login}>
            <div className="space-y-4">
              <div className="relative group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="example@domain.com"
                    className="block w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 hover:bg-white text-right"
                  />
                </div>
              </div>

              <div className="relative group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="block w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 hover:bg-white text-right"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
            >
              <span>تسجيل الدخول</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/auth/forgot-password"
              className="text-sm font-medium text-indigo-600 hover:text-purple-600 transition-colors duration-200 hover:underline inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              نسيت كلمة المرور؟
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          محمي بواسطة تشفير من الدرجة الأولى 🔒
        </p>
      </div>
    </div>
  )
}

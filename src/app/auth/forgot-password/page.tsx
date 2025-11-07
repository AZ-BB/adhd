import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/server"

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams
  const message = typeof params?.message === 'string' ? params.message : ""
  const error = typeof params?.error === 'string' ? params.error : ""

  async function requestReset(formData: FormData) {
    "use server"
    const email = String(formData.get("email") || "").trim()

    if (!email) {
      redirect(`/auth/forgot-password?error=${encodeURIComponent("يرجى إدخال البريد الإلكتروني")}`)
    }

    const supabase = await createSupabaseServerClient()
    
    // Get the origin for the redirect URL
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?type=recovery`,
    })

    if (error) {
      redirect(`/auth/forgot-password?error=${encodeURIComponent(error.message)}`)
    }

    redirect(`/auth/forgot-password?message=${encodeURIComponent("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني")}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      {/* Language Switcher */}
      <div className="absolute top-4 left-4 z-20">
        <a
          href="/auth/forgot-password/en"
          className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-md border border-white/30 rounded-xl text-sm text-gray-700 hover:bg-white shadow-sm transition-all"
        >
          English
        </a>
      </div>

      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">نسيت كلمة المرور؟</h1>
          <p className="mt-2 text-center text-sm text-gray-600">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور</p>
        </div>

        {message && (
          <div className="text-sm text-center p-3 rounded-md bg-green-50 text-green-700">{message}</div>
        )}
        {error && (
          <div className="text-sm text-center p-3 rounded-md bg-red-50 text-red-700">{error}</div>
        )}

        <form className="mt-8 space-y-6" action={requestReset}>
          <div className="rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">البريد الإلكتروني</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required 
                placeholder="البريد الإلكتروني" 
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right" 
              />
            </div>
          </div>

          <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            إرسال رابط إعادة التعيين
          </button>
        </form>

        <div className="text-center">
          <a href="/auth/login" className="text-sm text-indigo-600 hover:text-indigo-500">العودة إلى تسجيل الدخول</a>
        </div>
      </div>
    </div>
  )
}


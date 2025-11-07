import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/server"

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams
  const error = typeof params?.error === 'string' ? params.error : ""

  async function updatePassword(formData: FormData) {
    "use server"
    const password = String(formData.get("password") || "")
    const confirmPassword = String(formData.get("confirmPassword") || "")

    if (!password || !confirmPassword) {
      redirect(`/auth/reset-password?error=${encodeURIComponent("يرجى إدخال كلمة المرور وتأكيدها")}`)
    }

    if (password !== confirmPassword) {
      redirect(`/auth/reset-password?error=${encodeURIComponent("كلمات المرور غير متطابقة")}`)
    }

    if (password.length < 6) {
      redirect(`/auth/reset-password?error=${encodeURIComponent("يجب أن تكون كلمة المرور 6 أحرف على الأقل")}`)
    }

    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      redirect(`/auth/reset-password?error=${encodeURIComponent(error.message)}`)
    }

    redirect(`/auth/login?message=${encodeURIComponent("تم تحديث كلمة المرور بنجاح")}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      {/* Language Switcher */}
      <div className="absolute top-4 left-4 z-20">
        <a
          href="/auth/reset-password/en"
          className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-md border border-white/30 rounded-xl text-sm text-gray-700 hover:bg-white shadow-sm transition-all"
        >
          English
        </a>
      </div>

      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">إعادة تعيين كلمة المرور</h1>
          <p className="mt-2 text-center text-sm text-gray-600">أدخل كلمة المرور الجديدة الخاصة بك</p>
        </div>

        {error && (
          <div className="text-sm text-center p-3 rounded-md bg-red-50 text-red-700">{error}</div>
        )}

        <form className="mt-8 space-y-6" action={updatePassword}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 text-right">كلمة المرور الجديدة</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                placeholder="كلمة المرور الجديدة" 
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right" 
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 text-right">تأكيد كلمة المرور</label>
              <input 
                id="confirmPassword" 
                name="confirmPassword" 
                type="password" 
                required 
                placeholder="تأكيد كلمة المرور" 
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right" 
              />
            </div>
          </div>

          <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            تحديث كلمة المرور
          </button>
        </form>

        <div className="text-center">
          <a href="/auth/login" className="text-sm text-indigo-600 hover:text-indigo-500">العودة إلى تسجيل الدخول</a>
        </div>
      </div>
    </div>
  )
}


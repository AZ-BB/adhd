import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/server"

export default async function ResetPasswordPageEn({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams
  const error = typeof params?.error === 'string' ? params.error : ""

  async function updatePassword(formData: FormData) {
    "use server"
    const password = String(formData.get("password") || "")
    const confirmPassword = String(formData.get("confirmPassword") || "")

    if (!password || !confirmPassword) {
      redirect("/auth/reset-password/en?error=Please%20enter%20password%20and%20confirmation")
    }

    if (password !== confirmPassword) {
      redirect("/auth/reset-password/en?error=Passwords%20do%20not%20match")
    }

    if (password.length < 6) {
      redirect("/auth/reset-password/en?error=Password%20must%20be%20at%20least%206%20characters")
    }

    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      redirect(`/auth/reset-password/en?error=${encodeURIComponent(error.message)}`)
    }

    redirect("/auth/login/en?message=Password%20updated%20successfully")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <a
          href="/auth/reset-password"
          className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-md border border-white/30 rounded-xl text-sm text-gray-700 hover:bg-white shadow-sm transition-all"
        >
          عربي
        </a>
      </div>

      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset Your Password</h1>
          <p className="mt-2 text-center text-sm text-gray-600">Enter your new password</p>
        </div>

        {error && (
          <div className="text-sm text-center p-3 rounded-md bg-red-50 text-red-700">{error}</div>
        )}

        <form className="mt-8 space-y-6" action={updatePassword}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                placeholder="New Password" 
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input 
                id="confirmPassword" 
                name="confirmPassword" 
                type="password" 
                required 
                placeholder="Confirm Password" 
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
              />
            </div>
          </div>

          <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Update Password
          </button>
        </form>

        <div className="text-center">
          <a href="/auth/login/en" className="text-sm text-indigo-600 hover:text-indigo-500">Back to Sign In</a>
        </div>
      </div>
    </div>
  )
}


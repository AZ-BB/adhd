import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createSupabaseServerClient } from "@/lib/server"

async function login(formData: FormData) {
  "use server"
  const email = String(formData.get("email") || "").trim()
  const password = String(formData.get("password") || "")

  if (!email || !password) {
    redirect("/auth/login/en?error=Missing%20email%20or%20password")
  }

  const supabase = await createSupabaseServerClient()
  const { error, data } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/auth/login/en?error=${encodeURIComponent(error.message)}`)
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

export default async function LoginPageEn({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <a
          href="/auth/login"
          className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-md border border-white/30 rounded-xl text-sm text-gray-700 hover:bg-white shadow-sm transition-all"
        >
          عربي
        </a>
      </div>

      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h1>
          <p className="mt-2 text-center text-sm text-gray-600">Don't have an account? <a href="/auth/signup/en" className="font-medium text-indigo-600 hover:text-indigo-500">Sign up</a></p>
        </div>

        {message && (
          <div className="text-sm text-center p-3 rounded-md bg-green-50 text-green-700">{message}</div>
        )}
        {error && (
          <div className="text-sm text-center p-3 rounded-md bg-red-50 text-red-700">{error}</div>
        )}

        <form className="mt-8 space-y-6" action={login}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input id="email" name="email" type="email" required placeholder="Email" className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input id="password" name="password" type="password" required placeholder="Password" className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>

          <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Sign in</button>
        </form>

        <div className="text-center">
          <a href="/auth/forgot-password/en" className="text-sm text-indigo-600 hover:text-indigo-500">Forgot your password?</a>
        </div>
      </div>
    </div>
  )
}


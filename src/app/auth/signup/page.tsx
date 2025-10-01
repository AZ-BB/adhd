import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createSupabaseServerClient } from "@/lib/server"
import QuizCarryoverClient from "./QuizCarryoverClient"
import { signup as signupAction } from "@/actions/users"
async function signup(formData: FormData) {
  "use server"
  const email = String(formData.get("email") || "").trim()
  const password = String(formData.get("password") || "")
  const child_first_name = String(formData.get("child_first_name") || "").trim()
  const child_last_name = String(formData.get("child_last_name") || "").trim()
  const child_birthday = String(formData.get("child_birthday") || "").trim()
  const child_gender = String(formData.get("child_gender") || "").trim()
  const initial_quiz_score = Number(formData.get("initial_quiz_score") || "0")
  const parent_first_name = String(
    formData.get("parent_first_name") || ""
  ).trim()
  const parent_last_name = String(formData.get("parent_last_name") || "").trim()
  const parent_phone = String(formData.get("parent_phone") || "").trim()
  const parent_nationality = String(
    formData.get("parent_nationality") || ""
  ).trim()

  if (!email || !password) {
    redirect("/auth/signup?error=Missing%20email%20or%20password")
  }

  await signupAction({
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
  })

  // Persist submitted profile in a cookie to attach post-login
  try {
    const cookieStore = await cookies()
    const pendingProfile = {
      child_first_name,
      child_last_name,
      child_birthday,
      child_gender,
      parent_first_name,
      parent_last_name,
      parent_phone,
      parent_nationality,
      initial_quiz_score,
    }
    cookieStore.set("pending_profile", JSON.stringify(pendingProfile), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
  } catch {}

  redirect(
    "/auth/login?message=Check%20your%20email%20to%20confirm%20your%20account"
  )
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const message =
    typeof searchParams?.message === "string" ? searchParams?.message : ""
  const error =
    typeof searchParams?.error === "string" ? searchParams?.error : ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Log in
            </a>
          </p>
        </div>

        {message && (
          <div className="text-sm text-center p-3 rounded-md bg-green-50 text-green-700">
            {message}
          </div>
        )}
        {error && (
          <div className="text-sm text-center p-3 rounded-md bg-red-50 text-red-700">
            {error}
          </div>
        )}

          <form className="mt-8 space-y-6" action={signup}>
            <QuizCarryoverClient />
          <div className="rounded-md shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="child_first_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Child first name
                </label>
                <input
                  id="child_first_name"
                  name="child_first_name"
                  type="text"
                  required
                  placeholder="First name"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="child_last_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Child last name
                </label>
                <input
                  id="child_last_name"
                  name="child_last_name"
                  type="text"
                  required
                  placeholder="Last name"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="child_birthday"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Child birthday
                </label>
                <input
                  id="child_birthday"
                  name="child_birthday"
                  type="date"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="child_gender"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Child gender
                </label>
                <select
                  id="child_gender"
                  name="child_gender"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="parent_first_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Parent first name
                </label>
                <input
                  id="parent_first_name"
                  name="parent_first_name"
                  type="text"
                  placeholder="First name"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="parent_last_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Parent last name
                </label>
                <input
                  id="parent_last_name"
                  name="parent_last_name"
                  type="text"
                  placeholder="Last name"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="parent_phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Parent phone
                </label>
                <input
                  id="parent_phone"
                  name="parent_phone"
                  type="tel"
                  placeholder="Phone"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            <div>
                <label
                  htmlFor="parent_nationality"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Parent nationality
                </label>
                <input
                  id="parent_nationality"
                  name="parent_nationality"
                  type="text"
                  placeholder="Nationality"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Email"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Password"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign up
          </button>
        </form>

        <div className="text-center text-xs text-gray-600">
          If you completed the assessment, your score will be linked after you
          log in.
        </div>
      </div>
    </div>
  )
}

"use server"
import { createSupabaseServerClient } from "@/lib/server"
import { headers } from "next/headers"
export interface SignUpForm {
  email: string
  password: string
  child_first_name: string
  child_last_name: string
  child_birthday: string
  child_gender: string
  parent_first_name: string
  parent_last_name: string
  parent_phone: string
  parent_nationality: string
  initial_quiz_score: number
}
export async function signup(signUpForm: SignUpForm) {
  const {
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
  } = signUpForm
  const supabase = await createSupabaseServerClient()
  const hdrs = await headers()
  const origin = hdrs.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    throw error
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .insert({
      child_first_name,
      child_last_name,
      child_birthday,
      child_gender,
      parent_first_name,
      parent_last_name,
      parent_phone,
      parent_nationality,
      auth_id: data.user?.id,
      initial_quiz_score,
    })
    .select()
    .single()

  console.log(userData, userError)
}

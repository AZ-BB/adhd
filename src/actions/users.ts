"use server"
import { createSupabaseAdminServerClient, createSupabaseServerClient } from "@/lib/server"
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
  inattention_score: number
  hyperactivity_score: number
  impulsivity_score: number
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
    inattention_score,
    hyperactivity_score,
    impulsivity_score,
  } = signUpForm
  const supabase = await createSupabaseServerClient()

  // const origin = process.env.NEXT_PUBLIC_SITE_URL

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `http://147.93.127.229:3060/auth/callback`,
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
      inattention_score,
      hyperactivity_score,
      impulsivity_score,
    })
    .select()
    .single()

  console.log(userData, userError)
}

export async function getUserByAuthId(authId: string) {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", authId)
    .single()
  
  if (error) {
    console.error("Error fetching user by auth_id:", error)
    return null
  }
  
  return data
}
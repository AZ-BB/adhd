"use server"
import { createSupabaseServerClient } from "@/lib/server"
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
  const { data, error } = await supabase.auth.signUp({ email, password })

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

  if(data.user && userData) {
    await supabase.auth.admin.updateUserById(data.user.id, {
      user_metadata: {
        ...data.user?.user_metadata,
        db_user_id: userData.id,
      },
    })
  }
}

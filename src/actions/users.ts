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
export interface ValidationError {
  field: string
  messageAr: string
  messageEn: string
}

export interface SignupResponse {
  success: boolean
  errors?: ValidationError[]
  userId?: string
}

export async function signup(signUpForm: SignUpForm): Promise<SignupResponse> {
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

  const errors: ValidationError[] = []

  // Email validation
  if (!email) {
    errors.push({ 
      field: "email", 
      messageAr: "البريد الإلكتروني مطلوب",
      messageEn: "Email is required"
    })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ 
      field: "email", 
      messageAr: "البريد الإلكتروني غير صحيح",
      messageEn: "Invalid email format"
    })
  }

  // Password validation
  if (!password) {
    errors.push({ 
      field: "password", 
      messageAr: "كلمة المرور مطلوبة",
      messageEn: "Password is required"
    })
  } else if (password.length < 6) {
    errors.push({ 
      field: "password", 
      messageAr: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
      messageEn: "Password must be at least 6 characters"
    })
  }

  // Child information validation
  if (!child_first_name) {
    errors.push({ 
      field: "child_first_name", 
      messageAr: "الاسم الأول للطفل مطلوب",
      messageEn: "Child first name is required"
    })
  } else if (child_first_name.length < 2) {
    errors.push({ 
      field: "child_first_name", 
      messageAr: "الاسم الأول يجب أن يكون حرفين على الأقل",
      messageEn: "Child first name must be at least 2 characters"
    })
  }

  if (!child_last_name) {
    errors.push({ 
      field: "child_last_name", 
      messageAr: "اسم العائلة للطفل مطلوب",
      messageEn: "Child last name is required"
    })
  } else if (child_last_name.length < 2) {
    errors.push({ 
      field: "child_last_name", 
      messageAr: "اسم العائلة يجب أن يكون حرفين على الأقل",
      messageEn: "Child last name must be at least 2 characters"
    })
  }

  if (!child_birthday) {
    errors.push({ 
      field: "child_birthday", 
      messageAr: "تاريخ ميلاد الطفل مطلوب",
      messageEn: "Child birthday is required"
    })
  } else {
    const birthDate = new Date(child_birthday)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    if (isNaN(birthDate.getTime()) || birthDate > today) {
      errors.push({ 
        field: "child_birthday", 
        messageAr: "تاريخ الميلاد غير صحيح",
        messageEn: "Invalid birth date"
      })
    } else if (age > 12 || age < 6) {
      errors.push({ 
        field: "child_birthday", 
        messageAr: "عمر الطفل يجب أن يكون بين 6 و 12 سنة",
        messageEn: "Child age must be between 6 and 12 years"
      })
    }
  }

  if (!child_gender) {
    errors.push({ 
      field: "child_gender", 
      messageAr: "جنس الطفل مطلوب",
      messageEn: "Child gender is required"
    })
  } else if (!["Male", "Female"].includes(child_gender)) {
    errors.push({ 
      field: "child_gender", 
      messageAr: "جنس الطفل غير صحيح",
      messageEn: "Invalid child gender"
    })
  }

  // Parent information validation
  if (!parent_first_name) {
    errors.push({ 
      field: "parent_first_name", 
      messageAr: "الاسم الأول لولي الأمر مطلوب",
      messageEn: "Parent first name is required"
    })
  } else if (parent_first_name.length < 2) {
    errors.push({ 
      field: "parent_first_name", 
      messageAr: "الاسم الأول يجب أن يكون حرفين على الأقل",
      messageEn: "Parent first name must be at least 2 characters"
    })
  }

  if (!parent_last_name) {
    errors.push({ 
      field: "parent_last_name", 
      messageAr: "اسم العائلة لولي الأمر مطلوب",
      messageEn: "Parent last name is required"
    })
  } else if (parent_last_name.length < 2) {
    errors.push({ 
      field: "parent_last_name", 
      messageAr: "اسم العائلة يجب أن يكون حرفين على الأقل",
      messageEn: "Parent last name must be at least 2 characters"
    })
  }

  if (!parent_phone) {
    errors.push({ 
      field: "parent_phone", 
      messageAr: "رقم هاتف ولي الأمر مطلوب",
      messageEn: "Parent phone number is required"
    })
  } else if (!/^\+?[\d\s-]{8,}$/.test(parent_phone)) {
    errors.push({ 
      field: "parent_phone", 
      messageAr: "رقم الهاتف غير صحيح",
      messageEn: "Invalid phone number format"
    })
  }

  if (!parent_nationality) {
    errors.push({ 
      field: "parent_nationality", 
      messageAr: "جنسية ولي الأمر مطلوبة",
      messageEn: "Parent nationality is required"
    })
  } else if (parent_nationality.length < 2) {
    errors.push({ 
      field: "parent_nationality", 
      messageAr: "الجنسية يجب أن تكون حرفين على الأقل",
      messageEn: "Nationality must be at least 2 characters"
    })
  }

  // Score validation
  if (isNaN(initial_quiz_score) || initial_quiz_score < 0) {
    errors.push({ 
      field: "initial_quiz_score", 
      messageAr: "النتيجة غير صحيحة",
      messageEn: "Invalid quiz score"
    })
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  const supabase = await createSupabaseAdminServerClient()

  let authId: string | undefined
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      console.error(error)
      if (error.message.includes("already") || error.message.includes("already been taken")) {
        errors.push({ 
          field: "email", 
          messageAr: "هذا البريد الإلكتروني مسجل بالفعل",
          messageEn: "This email is already registered"
        })
      } else {
        errors.push({ 
          field: "general", 
          messageAr: "حدث خطأ أثناء إنشاء الحساب",
          messageEn: error.message || "An error occurred while creating the account"
        })
      }
      return { success: false, errors }
    }

    authId = data.user?.id
  } catch (error: any) {
    console.error(error)
    errors.push({ 
      field: "general", 
      messageAr: "حدث خطأ أثناء إنشاء الحساب",
      messageEn: error.message || "An error occurred while creating the account"
    })
    return { success: false, errors }
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
      auth_id: authId,
      initial_quiz_score,
      inattention_score,
      hyperactivity_score,
      impulsivity_score,
    })
    .select()
    .single()

  if (userError) {
    console.error("Error creating user:", userError)
    errors.push({ 
      field: "general", 
      messageAr: "حدث خطأ أثناء حفظ البيانات",
      messageEn: "An error occurred while saving data"
    })
    return { success: false, errors }
  }

  return { success: true, userId: authId }
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

/**
 * Update user's quiz score
 */
export async function updateQuizScore(
  initial_quiz_score: number,
  inattention_score: number,
  hyperactivity_score: number,
  impulsivity_score: number
) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Get user profile
  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single()

  if (profileError || !userProfile) {
    throw new Error("User profile not found")
  }

  // Update quiz scores
  const { error: updateError } = await supabase
    .from("users")
    .update({
      initial_quiz_score,
      inattention_score,
      hyperactivity_score,
      impulsivity_score,
      category_scores: {
        inattention: inattention_score,
        hyperactivity: hyperactivity_score,
        impulsivity: impulsivity_score,
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", userProfile.id)

  if (updateError) {
    throw new Error(updateError.message || "Failed to update quiz score")
  }

  return { success: true }
}
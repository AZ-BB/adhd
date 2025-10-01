"use server"
import { createSupabaseServerClient } from "@/lib/server"

export default async function getInitialQuiz() {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.from('quizzes').select('*').eq('type', 'INITIAL')
    if(data) {
        const { data: quizQuestions, error: quizQuestionsError } = await supabase.from('quiz_questions').select('*').eq('quiz_id', data[0].id)
        if(quizQuestions) {
            return { data: quizQuestions, error: quizQuestionsError }
        } else {
            return { data: null, error: quizQuestionsError }
        }
    }
    return { data: null, error: error }
}
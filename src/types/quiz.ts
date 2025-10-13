export interface QuizQuestion {
    id: number
    question: string
    question_ar: string
    category?: string
    category_ar?: string
    options?: string[]
}
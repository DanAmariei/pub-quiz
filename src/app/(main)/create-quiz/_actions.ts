'use server'

import { getProfile } from "@/utils/get-profile"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

interface QuizQuestion {
  question: string
  song?: string
  image?: string
  video?: string
  correct_answer: string
  incorrect_answers: string[]
}

interface QuestionsData {
  questions: QuizQuestion[]
}

export async function getCategories() {
  const supabase = createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  return categories || []
}

export async function createQuiz(formData: FormData) {
  const { user, profile } = await getProfile() || {}
  
  if (!user || (!profile?.is_host && !profile?.is_admin)) {
    return { error: 'Unauthorized' }
  }

  const supabase = createClient()
  
  const title = formData.get('name') as string
  const description = formData.get('description') as string
  const categoryId = formData.get('category') as string
  const difficulty = formData.get('difficulty') as string
  const questionsJson = formData.get('questions') as string
  
  try {
    // 1. Creăm quiz-ul
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title,
        description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (quizError) {
      throw new Error(`Error creating quiz: ${quizError.message}`)
    }

    // 2. Parsăm JSON-ul cu întrebări
    const questionsData = JSON.parse(questionsJson) as QuestionsData

    // 3. Inserăm fiecare întrebare și creăm relația cu quiz-ul
    for (const [index, q] of questionsData.questions.entries()) {
      // Inserăm întrebarea fără order
      const { data: question, error: questionError } = await supabase
        .from('questions')
        .insert({
          category_id: categoryId,
          question: q.question,
          song: q.song || null,
          image: q.image || null,
          video: q.video || null,
          correct_answer: q.correct_answer,
          incorrect_answers: q.incorrect_answers,
          difficulty
        })
        .select()
        .single()

      if (questionError) {
        throw new Error(`Error creating question: ${questionError.message}`)
      }

      // Creăm relația între quiz și întrebare, incluzând order aici
      const { error: relationError } = await supabase
        .from('quiz_questions')
        .insert({
          quiz_id: quiz.id,
          question_id: question.id,
          order: index // Adăugăm order în relație
        })

      if (relationError) {
        throw new Error(`Error linking question to quiz: ${relationError.message}`)
      }
    }

    revalidatePath('/quizes')
    return { success: true }
    
  } catch (error) {
    console.error('Error:', error)
    return { error: error instanceof Error ? error.message : 'An error occurred' }
  }
} 
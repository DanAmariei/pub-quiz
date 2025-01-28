'use server'

import { getProfile } from "@/utils/get-profile"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

interface QuizQuestion {
  question: string
  correct_answer: string
  incorrect_answers: string[]
}

interface QuestionsData {
  questions: QuizQuestion[]
}

export async function updateQuiz(id: string, formData: FormData) {
  const { user, profile } = await getProfile() || {}
  
  if (!user || (!profile?.is_host && !profile?.is_admin)) {
    return { error: 'Unauthorized' }
  }

  const supabase = createClient()
  
  try {
    // 1. Actualizăm quiz-ul
    const { error: quizError } = await supabase
      .from('quizzes')
      .update({
        title: formData.get('name'),
        description: formData.get('description'),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (quizError) {
      throw new Error(`Error updating quiz: ${quizError.message}`)
    }

    // 2. Actualizăm fiecare întrebare editată
    const entries = Array.from(formData.entries())
    const questionUpdates = new Map()

    // Grupăm toate datele pentru fiecare întrebare
    for (const [key, value] of entries) {
      if (key.startsWith('question-')) {
        const questionId = key.substring('question-'.length)
        if (!questionUpdates.has(questionId)) {
          questionUpdates.set(questionId, {})
        }
        questionUpdates.get(questionId).question = value
      }
      else if (key.startsWith('correct-')) {
        const questionId = key.substring('correct-'.length)
        if (!questionUpdates.has(questionId)) {
          questionUpdates.set(questionId, {})
        }
        questionUpdates.get(questionId).correct_answer = value
      }
      else if (key.startsWith('incorrect-')) {
        const [_, questionId] = key.split('-')
        if (!questionUpdates.has(questionId)) {
          questionUpdates.set(questionId, {})
        }
      }
      else if (key.startsWith('difficulty-')) {
        const questionId = key.substring('difficulty-'.length)
        if (!questionUpdates.has(questionId)) {
          questionUpdates.set(questionId, {})
        }
        questionUpdates.get(questionId).difficulty = value
      }
    }

    // Colectăm toate răspunsurile incorecte pentru fiecare întrebare
    for (const questionId of questionUpdates.keys()) {
      const incorrectAnswers = []
      let index = 0
      while (formData.has(`incorrect-${questionId}-${index}`)) {
        incorrectAnswers.push(formData.get(`incorrect-${questionId}-${index}`))
        index++
      }
      if (incorrectAnswers.length > 0) {
        questionUpdates.get(questionId).incorrect_answers = incorrectAnswers
      }
    }

    // Actualizăm fiecare întrebare
    for (const [questionId, updates] of questionUpdates) {
      console.log('Updating question:', questionId, updates)

      const { error: updateError } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', questionId)

      if (updateError) {
        console.error('Update error:', updateError)
        throw new Error(`Error updating question: ${updateError.message}`)
      }
    }

    revalidatePath('/quizes')
    revalidatePath(`/quizes/${id}`)
    return { success: true }
    
  } catch (error) {
    console.error('Error:', error)
    return { error: error instanceof Error ? error.message : 'An error occurred' }
  }
} 
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
      // Extragem ID-ul întrebării din cheie (ex: "question-0c5e3584-1234-5678-90ab-cd1234567890")
      const questionId = key.split('-').slice(1).join('-'); // Aceasta va păstra UUID-ul complet
      
      if (key.startsWith('question-') && questionId) {
        if (!questionUpdates.has(questionId)) {
          questionUpdates.set(questionId, {})
        }
        questionUpdates.get(questionId).question = value
      }
      else if (key.startsWith('correct-') && questionId) {
        if (!questionUpdates.has(questionId)) {
          questionUpdates.set(questionId, {})
        }
        questionUpdates.get(questionId).correct_answer = value
      }
      else if (key.startsWith('incorrect-') && questionId) {
        if (!questionUpdates.has(questionId)) {
          questionUpdates.set(questionId, {})
        }
      }
      else if (key.startsWith('difficulty-') && questionId) {
        if (!questionUpdates.has(questionId)) {
          questionUpdates.set(questionId, {})
        }
        questionUpdates.get(questionId).difficulty = value
      }
      else if (key.startsWith('order-') && questionId) {
        if (!questionUpdates.has(questionId)) {
          questionUpdates.set(questionId, {})
        }
        questionUpdates.get(questionId).order = parseInt(value as string)
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

    // Actualizăm întrebările și ordinea lor
    for (const [questionId, updates] of questionUpdates) {
      // Actualizăm textul întrebării în tabelul questions
      if (updates.question) {
        const { error: updateError } = await supabase
          .from('questions')
          .update({
            question: updates.question,
            correct_answer: updates.correct_answer,
            incorrect_answers: updates.incorrect_answers,
            difficulty: updates.difficulty
          })
          .eq('id', questionId)

        if (updateError) {
          throw new Error(`Error updating question: ${updateError.message}`)
        }
      }

      // Actualizăm ordinea în tabelul quiz_questions
      if (typeof updates.order === 'number') {
        const { error: orderError } = await supabase
          .from('quiz_questions')
          .update({ order: updates.order })
          .eq('quiz_id', id)
          .eq('question_id', questionId)

        if (orderError) {
          throw new Error(`Error updating question order: ${orderError.message}`)
        }
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
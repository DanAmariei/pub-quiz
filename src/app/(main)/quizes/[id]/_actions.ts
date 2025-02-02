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

    // 2. Extragem toate ID-urile întrebărilor din formData
    const questionIds = Array.from(formData.keys())
      .filter(key => key.startsWith('question-'))
      .map(key => key.replace('question-', ''))

    // Pentru fiecare întrebare
    for (const questionId of questionIds) {
      const question = formData.get(`question-${questionId}`) as string
      const correctAnswer = formData.get(`correct-${questionId}`) as string
      const incorrectAnswers = Array.from(formData.keys())
        .filter(key => key.startsWith(`incorrect-${questionId}-`))
        .map(key => formData.get(key)) as string[]
      const order = parseInt(formData.get(`order-${questionId}`) as string)
      const difficulty = formData.get(`difficulty-${questionId}`) as string

      // Actualizăm întrebarea în tabelul questions
      const { error: questionError } = await supabase
        .from('questions')
        .update({
          question,
          correct_answer: correctAnswer,
          incorrect_answers: incorrectAnswers,
          difficulty
        })
        .eq('id', questionId)

      if (questionError) {
        throw new Error(`Error updating question: ${questionError.message}`)
      }

      // Generăm o nouă ordine aleatorie pentru răspunsuri
      const allAnswers = [correctAnswer, ...incorrectAnswers].sort(() => Math.random() - 0.5)

      // Actualizăm relația și ordinea răspunsurilor în quiz_questions
      const { error: relationError } = await supabase
        .from('quiz_questions')
        .update({ 
          order,
          answers_order: allAnswers
        })
        .eq('quiz_id', id)
        .eq('question_id', questionId)

      if (relationError) {
        throw new Error(`Error updating question order: ${relationError.message}`)
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

export async function updateQuestion(
  quizId: string,
  questionId: string,
  formData: FormData
) {
  const { user, profile } = await getProfile() || {}
  
  if (!user || (!profile?.is_host && !profile?.is_admin)) {
    return { error: 'Unauthorized' }
  }

  const supabase = createClient()
  
  const question = formData.get('question') as string
  const correctAnswer = formData.get('correct_answer') as string
  const incorrectAnswers = JSON.parse(formData.get('incorrect_answers') as string)

  try {
    // 1. Actualizăm întrebarea în tabelul questions
    const { error: questionError } = await supabase
      .from('questions')
      .update({
        question,
        correct_answer: correctAnswer,
        incorrect_answers: incorrectAnswers,
      })
      .eq('id', questionId)

    if (questionError) {
      throw new Error(`Error updating question: ${questionError.message}`)
    }

    // 2. Obținem ordinea curentă a răspunsurilor din quiz_questions
    const { data: quizQuestion } = await supabase
      .from('quiz_questions')
      .select('answers_order')
      .eq('quiz_id', quizId)
      .eq('question_id', questionId)
      .single()

    if (!quizQuestion) {
      throw new Error('Quiz question relation not found')
    }

    // 3. Actualizăm ordinea răspunsurilor în quiz_questions folosind aceeași ordine
    // dar cu noile valori ale răspunsurilor
    const oldAnswers = quizQuestion.answers_order
    const updatedOrder = oldAnswers.map(oldAnswer => {
      // Dacă răspunsul era cel corect, îl înlocuim cu noul răspuns corect
      const oldCorrectAnswer = oldAnswers[oldAnswers.indexOf(correctAnswer)]
      if (oldAnswer === oldCorrectAnswer) {
        return correctAnswer
      }
      
      // Pentru răspunsurile incorecte, le înlocuim în ordinea în care apar
      const incorrectIndex = oldAnswers.indexOf(oldAnswer)
      if (incorrectIndex < incorrectAnswers.length) {
        return incorrectAnswers[incorrectIndex]
      }
      
      return oldAnswer
    })

    console.log('!!!!!!!! updateOrder ', updatedOrder)

    // 4. Actualizăm ordinea răspunsurilor în quiz_questions
    const { error: orderError } = await supabase
      .from('quiz_questions')
      .update({
        answers_order: updatedOrder
      })
      .eq('quiz_id', quizId)
      .eq('question_id', questionId)

    if (orderError) {
      throw new Error(`Error updating answers order: ${orderError.message}`)
    }

    revalidatePath(`/quizes/${quizId}`)
    return { success: true }
    
  } catch (error) {
    console.error('Error:', error)
    return { error: error instanceof Error ? error.message : 'An error occurred' }
  }
} 
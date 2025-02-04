'use server'

import { createClient } from "@/utils/supabase/server"
import { getProfile } from "@/utils/get-profile"
import oldQuizzes from './data/old-quizzes.json'

interface QuestionOld {
  question: string
  answers: string[]
  correct_answer: string
  _id: { $oid: string }
}

interface QuizOld {
  _id: { $oid: string }
  title: string
  questions: QuestionOld[]
  difficulty: string
  category: string
  createdAt: { $date: string }
}

export async function importQuizzes() {
  const { profile } = await getProfile() || {}
  
  if (!profile?.is_admin) {
    throw new Error('Unauthorized')
  }

  const supabase = createClient()
  const status = {
    total: oldQuizzes.length,
    processed: 0,
    success: 0,
    errors: [] as string[]
  }

  for (const oldQuiz of oldQuizzes) {
    try {
      // Verificăm dacă quiz-ul există deja
      const { data: existingQuiz } = await supabase
        .from('quizzes')
        .select('id')
        .eq('title', oldQuiz.title)
        .single()

      if (existingQuiz) {
        status.errors.push(`Quiz "${oldQuiz.title}": Quiz-ul există deja`)
        status.processed++
        continue
      }

      // Inserăm quiz-ul
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title: oldQuiz.title,
          description: oldQuiz.difficulty,
          created_at: oldQuiz.createdAt.$date
        })
        .select()
        .single()

      if (quizError) throw new Error(`Quiz error: ${quizError.message}`)

      // Inserăm întrebările și legăturile
      for (const oldQuestion of oldQuiz.questions) {
        // Verificăm dacă întrebarea există deja
        const { data: existingQuestion } = await supabase
          .from('questions')
          .select('id')
          .eq('question', oldQuestion.question)
          .single()

        let questionId: string

        if (existingQuestion) {
          questionId = existingQuestion.id
        } else {
          // Extragem răspunsurile incorecte
          const incorrect_answers = oldQuestion.answers
            .filter(a => a !== oldQuestion.correct_answer)

          // Inserăm întrebarea
          const { data: question, error: questionError } = await supabase
            .from('questions')
            .insert({
              question: oldQuestion.question,
              correct_answer: oldQuestion.correct_answer,
              incorrect_answers,
              category_id: '91fffaa0-098c-468e-aca0-af2e0f962e78',
              difficulty: oldQuiz.difficulty,
              created_at: new Date().toISOString()
            })
            .select()
            .single()

          if (questionError) throw new Error(`Question error: ${questionError.message}`)
          questionId = question.id
        }

        // Creăm legătura quiz-întrebare
        const { error: linkError } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: quiz.id,
            question_id: questionId,
            order: oldQuiz.questions.indexOf(oldQuestion),
            answers_order: oldQuestion.answers,
          })

        if (linkError) throw new Error(`Link error: ${linkError.message}`)
      }

      status.success++
    } catch (error) {
      status.errors.push(`Quiz "${oldQuiz.title}": ${error.message}`)
    }

    status.processed++
  }

  return status
} 
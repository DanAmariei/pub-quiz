'use server'

import { createClient } from "@/utils/supabase/server"
import { getProfile } from "@/utils/get-profile"
import oldQuizzes from './data/old-quizzes.json' assert { type: 'json' }

const BATCH_SIZE = 5 // Reducem mărimea batch-ului pentru mai multă stabilitate

interface QuestionOld {
  question: string
  answers: string[]
  correct_answer: string
  _id: { $oid: string }
  song?: string
  image?: string
  video?: string
}

interface QuizOld {
  _id: { $oid: string }
  title: string
  questions: QuestionOld[]
  difficulty: string
  category: string
  createdAt: { $date: string }
}

// Adăugăm asertiunea de tip pentru array-ul importat
const quizzes = oldQuizzes as unknown as QuizOld[]

export async function importQuizzes() {
  const { profile } = await getProfile() || {}

  if (!profile?.is_admin) {
    throw new Error('Unauthorized')
  }

  const supabase = createClient()
  const status = {
    total: quizzes.length,
    processed: 0,
    success: 0,
    errors: [] as string[]
  }

  // Împărțim quiz-urile în loturi mai mici
  for (let i = 0; i < quizzes.length; i += BATCH_SIZE) {
    const batch = quizzes.slice(i, i + BATCH_SIZE)

    // Procesăm fiecare quiz din lot
    for (const oldQuiz of batch) {
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

        // Procesăm întrebările secvențial pentru stabilitate
        for (const [index, oldQuestion] of oldQuiz.questions.entries()) {
          // Inserăm întrebarea nouă
          const { data: question, error: questionError } = await supabase
            .from('questions')
            .insert({
              question: oldQuestion.question,
              correct_answer: oldQuestion.correct_answer,
              incorrect_answers: oldQuestion.answers.filter(a => a !== oldQuestion.correct_answer),
              category_id: '91fffaa0-098c-468e-aca0-af2e0f962e78',
              song: oldQuestion?.song || '',
              image: oldQuestion?.image || '',
              video: oldQuestion?.video || '',
              difficulty: oldQuiz.difficulty,
              created_at: new Date().toISOString()
            })
            .select()
            .single()

          if (questionError) throw new Error(`Question error: ${questionError.message}`)
          // Creăm legătura quiz-întrebare
          const { error: linkError } = await supabase
            .from('quiz_questions')
            .insert({
              quiz_id: quiz.id,
              question_id: question.id,
              order: index,
              answers_order: oldQuestion.answers
            })

          if (linkError) throw new Error(`Link error: ${linkError.message}`)
        }

        status.success++
      } catch {
        status.errors.push(`Quiz "${oldQuiz.title}"`)
      }

      status.processed++
    }

    // Pauză mai lungă între loturi
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return status
} 
'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import LoadingSpinner from "./loading-spinner"

interface Question {
  id: string
  question: string
  correct_answer: string
  incorrect_answers: string[]
  answers_order: string[]
}

interface UserAnswer {
  question_id: string
  answer: string
  is_correct: boolean
}

interface GameAnswersProps {
  gameId: string
  userId: string
  className?: string
  isHost?: boolean
}

const ANSWER_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export default function GameAnswers({ gameId, userId, className, isHost }: GameAnswersProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Obținem toate întrebările din quiz
        const { data: gameData } = await supabase
          .from('games')
          .select(`
            quiz:quizzes (
              questions:quiz_questions (
                question:questions (
                  id,
                  question,
                  correct_answer,
                  incorrect_answers
                ),
                answers_order,
                order
              )
            )
          `)
          .eq('id', gameId)
          .single()

        if (gameData?.quiz?.questions) {
          // Sortăm întrebările după order înainte de a le formata
          const sortedQuestions = gameData.quiz.questions
            .sort((a, b) => a.order - b.order)
            .map(q => ({
              id: q.question.id,
              question: q.question.question,
              correct_answer: q.question.correct_answer,
              incorrect_answers: q.question.incorrect_answers,
              answers_order: q.answers_order || [
                q.question.correct_answer,
                ...q.question.incorrect_answers
              ]
            }))
          setQuestions(sortedQuestions)
        }

        // Obținem răspunsurile userului
        const { data: answers } = await supabase
          .from('participant_answers')
          .select('question_id, answer, is_correct')
          .eq('game_id', gameId)
          .eq('participant_id', userId)

        if (answers) {
          setUserAnswers(answers)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [gameId, userId])

  return (
    <Card className={cn("p-6", className)}>
      <h3 className="text-lg font-semibold mb-6">
        {isHost ? "Răspunsurile Corecte" : "Răspunsurile Tale"}
      </h3>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-8">
          {questions.map((question, qIndex) => {
            const userAnswer = !isHost ? userAnswers.find(a => a.question_id === question.id) : null
            
            return (
              <div key={question.id} className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h4 className="font-medium">
                    Întrebarea {qIndex + 1}: {question.question}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {question.answers_order.map((answer, index) => {
                    const isCorrect = answer === question.correct_answer
                    const isUserAnswer = !isHost && answer === userAnswer?.answer
                    
                    return (
                      <div
                        key={index}
                        className={cn(
                          "p-4 border rounded-lg relative",
                          // Pentru host, afișăm doar răspunsurile corecte cu verde
                          isHost && isCorrect && "bg-green-100 dark:bg-green-900/30 border-green-500",
                          // Pentru participanți, păstrăm logica existentă
                          !isHost && isCorrect && "bg-green-100 dark:bg-green-900/30 border-green-500",
                          !isHost && isUserAnswer && !isCorrect && "bg-red-100 dark:bg-red-900/30 border-red-500"
                        )}
                      >
                        {/* Badge doar pentru participanți când au răspuns corect */}
                        {!isHost && isUserAnswer && isCorrect && (
                          <Badge 
                            variant="secondary"
                            className="absolute top-2 right-2 bg-green-500 text-white"
                          >
                            <Check className="h-4 w-4" />
                          </Badge>
                        )}
                        
                        <span className={cn(
                          "text-gray-900 dark:text-gray-100",
                          "flex items-center gap-2"
                        )}>
                          <span className="font-semibold">
                            {ANSWER_LETTERS[index]}.
                          </span>
                          {answer}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
} 
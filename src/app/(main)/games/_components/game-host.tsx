'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

interface Question {
  id: string
  question: string
  correct_answer: string
  incorrect_answers: string[]
}

interface Game {
  id: string
  host_id: string
  quiz: {
    id: string
    title: string
    questions: Array<{
      question: Question
    }>
  }
  active_question_id: string | null
  is_finished: boolean
}

export default function GameHost({ 
  game: initialGame,
  user 
}: { 
  game: Game
  user: { id: string }
}) {
  const [game, setGame] = useState(initialGame)
  const supabase = createClient()

  // Procesăm întrebările pentru a fi mai ușor de folosit
  const questions = game?.quiz?.questions?.map(q => q.question) || []
  const activeQuestionIndex = questions.findIndex(q => q.id === game.active_question_id)
  
  useEffect(() => {
    const channel = supabase
      .channel(`game_${game.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${game.id}`
        },
        async (payload) => {
          console.log('Game updated:', payload)
          
          if (payload.eventType === 'UPDATE') {
            const { data: updatedGame } = await supabase
              .from('games')
              .select(`
                id,
                host_id,
                quiz_id,
                active_question_id,
                is_finished,
                created_at,
                quiz:quizzes(
                  id,
                  title,
                  questions:quiz_questions(
                    question:questions(
                      id,
                      question,
                      correct_answer,
                      incorrect_answers
                    )
                  )
                )
              `)
              .eq('id', game.id)
              .single()

            if (updatedGame) {
              console.log('Setting updated game:', updatedGame)
              setGame(updatedGame)
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    return () => {
      console.log('Cleaning up subscription')
      supabase.removeChannel(channel)
    }
  }, [game.id])

  async function handleNextQuestion() {
    if (!questions.length) return

    const nextIndex = activeQuestionIndex + 1
    
    if (nextIndex >= questions.length) {
      // Terminăm jocul
      const { error, data } = await supabase
        .from('games')
        .update({ 
          is_finished: true,
          active_question_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', game.id)
        .select(`
          id,
          host_id,
          quiz_id,
          active_question_id,
          is_finished,
          created_at,
          quiz:quizzes(
            id,
            title,
            questions:quiz_questions(
              question:questions(
                id,
                question,
                correct_answer,
                incorrect_answers
              )
            )
          )
        `)
        .single()

      if (error) {
        toast.error("Eroare la finalizarea jocului")
        return
      }

      setGame(data)
      toast.success("Joc finalizat!")
      return
    }

    // Actualizăm întrebarea activă
    const { error, data } = await supabase
      .from('games')
      .update({ 
        active_question_id: questions[nextIndex].id,
        updated_at: new Date().toISOString()
      })
      .eq('id', game.id)
      .select(`
        id,
        host_id,
        quiz_id,
        active_question_id,
        is_finished,
        created_at,
        quiz:quizzes(
          id,
          title,
          questions:quiz_questions(
            question:questions(
              id,
              question,
              correct_answer,
              incorrect_answers
            )
          )
        )
      `)
      .single()

    if (error) {
      toast.error("Eroare la schimbarea întrebării")
      return
    }

    setGame(data)
  }

  if (!game?.quiz) {
    return <div>Loading...</div>
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8 max-w-2xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{game.quiz.title}</h1>
            <p className="text-muted-foreground">Tu ești host-ul acestui joc</p>
          </div>
          {!game.is_finished && (
            <Button onClick={handleNextQuestion}>
              {activeQuestionIndex === -1 ? "Start" : 
               activeQuestionIndex === questions.length - 1 ? "Finalizează" : 
               "Următoarea Întrebare"}
            </Button>
          )}
        </div>

        {game.active_question_id && questions[activeQuestionIndex] && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Întrebarea {activeQuestionIndex + 1}
            </h2>
            <p>{questions[activeQuestionIndex].question}</p>
          </Card>
        )}

        {game.is_finished && (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold">Joc Finalizat!</h2>
            <p className="text-muted-foreground">
              Verifică clasamentul pentru rezultate.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 
'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import GameRankings from "./game-rankings"
import { cn } from "@/lib/utils"
import QuestionDisplay from "./question-display"

interface Question {
  id: string
  question: string
  correct_answer: string
  incorrect_answers: string[]
}

interface QuizQuestion {
  question: Question
  answers_order: string[]
}

interface Game {
  id: string
  host_id: string
  quiz: {
    id: string
    title: string
    questions: QuizQuestion[]
  }
  active_question_id: string | null
  is_finished: boolean
}

interface Ranking {
  points: number
  rank: number
  participant_id: string
  profiles: {
    username: string
    avatar_url: string | null
  }
}

export default function GameHost({ 
  game: initialGame,
  user 
}: { 
  game: Game
  user: { id: string }
}) {
  const [game, setGame] = useState(initialGame)
  const [rankings, setRankings] = useState<Ranking[]>([])
  const supabase = createClient()

  // Procesăm întrebările pentru a fi mai ușor de folosit
  const questions = game?.quiz?.questions?.map(q => q.question) || []
  const activeQuestionIndex = questions.findIndex(q => q.id === game.active_question_id)
  
  // Funcție pentru a obține clasamentul
  const fetchRankings = async () => {
    const { data, error } = await supabase
      .from('game_rankings')
      .select<string, Ranking>(`
        points,
        rank,
        participant_id,
        profiles (
          username,
          avatar_url
        )
      `)
      .eq('game_id', game.id)
      .order('points', { ascending: false })

    if (error) {
      console.error('Error fetching rankings:', error)
      return
    }

    console.log('Rankings fetched:', data)
    setRankings(data)
  }

  useEffect(() => {
    // Fetch rankings if the game is finished on mount
    if (game.is_finished) {
      fetchRankings()
    }

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
              .select<string, Game>(`
                id,
                host_id,
                active_question_id,
                is_finished,
                quiz:quizzes!inner (
                  id,
                  title,
                  questions:quiz_questions (
                    question:questions (
                      id,
                      question,
                      correct_answer,
                      incorrect_answers
                    ),
                    answers_order
                  )
                )
              `)
              .eq('id', game.id)
              .single()

            if (updatedGame) {
              console.log('Setting updated game:', updatedGame)
              setGame(updatedGame)

              // Fetch rankings if the game has just finished
              if (updatedGame.is_finished) {
                fetchRankings()
              }
            }
          }
        }
      )
      .subscribe()

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
      const { data, error } = await supabase
        .from('games')
        .update({ 
          is_finished: true,
          active_question_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', game.id)
        .select<string, Game>(`
          id,
          host_id,
          active_question_id,
          is_finished,
          quiz:quizzes!inner (
            id,
            title,
            questions:quiz_questions (
              question:questions (
                id,
                question,
                correct_answer,
                incorrect_answers
              ),
              answers_order
            )
          )
        `)
        .single()

      if (error) {
        toast.error("Eroare la finalizarea jocului")
        return
      }

      if (data) {
        setGame(data)
        toast.success("Joc finalizat!")
      }
      return
    }

    // Actualizăm întrebarea activă
    const { data, error } = await supabase
      .from('games')
      .update({ 
        active_question_id: questions[nextIndex].id,
        updated_at: new Date().toISOString()
      })
      .eq('id', game.id)
      .select<string, Game>(`
        id,
        host_id,
        active_question_id,
        is_finished,
        quiz:quizzes!inner (
          id,
          title,
          questions:quiz_questions (
            question:questions (
              id,
              question,
              correct_answer,
              incorrect_answers
            ),
            answers_order
          )
        )
      `)
      .single()

    if (error) {
      toast.error("Eroare la schimbarea întrebării")
      return
    }

    if (data) {
      setGame(data)
    }
  }

  // Extrage toate răspunsurile pentru întrebarea curentă
  const questionData = game.quiz.questions.find(
    q => q.question.id === game.active_question_id
  );

  const allAnswers = questionData?.answers_order || 
    (questionData?.question ? [
      questionData.question.correct_answer,
      ...questionData.question.incorrect_answers
    ].sort(() => Math.random() - 0.5) : []);

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
          <QuestionDisplay
            questionNumber={activeQuestionIndex + 1}
            question={questions[activeQuestionIndex].question}
            answers={allAnswers}
            isInteractive={false}
          />
        )}

        {game.is_finished && (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold">Joc Finalizat!</h2>
            <p className="text-muted-foreground">
              Clasamentul și răspunsurile corecte:
            </p>
            <GameRankings 
              rankings={rankings}
              className="mt-6"
              isFinished={game.is_finished}
            />
          </div>
        )}
      </div>
    </div>
  )
} 
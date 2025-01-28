'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

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

export default function GameParticipant({ 
  game: initialGame,
  user,
  isParticipant
}: { 
  game: Game
  user: { id: string }
  isParticipant: boolean
}) {
  const [game, setGame] = useState(initialGame)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [hasAnswered, setHasAnswered] = useState(false)
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([])
  const supabase = createClient()

  // Găsim întrebarea activă
  const questions = game.quiz.questions.map(q => q.question)
  const activeQuestion = questions.find(q => q.id === game.active_question_id)
  const activeQuestionIndex = questions.findIndex(q => q.id === game.active_question_id)

  // Amestecăm răspunsurile când se schimbă întrebarea activă
  useEffect(() => {
    if (activeQuestion) {
      const answers = [
        activeQuestion.correct_answer,
        ...activeQuestion.incorrect_answers
      ].sort(() => Math.random() - 0.5)
      setShuffledAnswers(answers)
    }
  }, [activeQuestion?.id])

  // Ascultăm pentru modificări în joc
  useEffect(() => {
    const channel = supabase
      .channel('game_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'games',
          filter: `id=eq.${game.id}`
        }, 
        async (payload) => {
          // Reîncărcăm datele jocului
          const { data } = await supabase
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

          if (data) {
            setGame(data)
            // Resetăm starea răspunsului când se schimbă întrebarea
            setSelectedAnswer('')
            setHasAnswered(false)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [game.id])

  async function handleJoinGame() {
    const { error } = await supabase
      .from('game_participants')
      .insert({
        game_id: game.id,
        participant_id: user.id
      })

    if (error) {
      toast.error("Eroare la înscrierea în joc")
      return
    }

    toast.success("Te-ai alăturat jocului!")
    window.location.reload() // Reîncărcăm pagina pentru a actualiza starea
  }

  async function handleSubmitAnswer() {
    if (!activeQuestion || !selectedAnswer) return

    const { error } = await supabase
      .from('participant_answers')
      .insert({
        game_id: game.id,
        participant_id: user.id,
        question_id: activeQuestion.id,
        answer: selectedAnswer,
        is_correct: selectedAnswer === activeQuestion.correct_answer
      })

    if (error) {
      toast.error("Eroare la trimiterea răspunsului")
      return
    }

    setHasAnswered(true)
    toast.success("Răspuns trimis cu succes!")
  }

  if (!isParticipant) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">{game.quiz.title}</h1>
          <p className="text-muted-foreground mb-8">
            Alătură-te acestui joc pentru a participa
          </p>
          <Button onClick={handleJoinGame}>
            Alătură-te Jocului
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8 max-w-2xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold">{game.quiz.title}</h1>
        </div>

        {activeQuestion ? (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Întrebarea {activeQuestionIndex + 1}
            </h2>
            <p className="mb-6">{activeQuestion.question}</p>

            <RadioGroup
              value={selectedAnswer}
              onValueChange={setSelectedAnswer}
              className="space-y-4"
              disabled={hasAnswered}
            >
              {shuffledAnswers.map((answer) => (
                <div key={answer} className="flex items-center space-x-2">
                  <RadioGroupItem value={answer} id={answer} />
                  <Label htmlFor={answer}>{answer}</Label>
                </div>
              ))}
            </RadioGroup>

            <Button 
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer || hasAnswered}
              className="mt-6"
            >
              Trimite Răspunsul
            </Button>
          </Card>
        ) : game.is_finished ? (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold">Joc Finalizat!</h2>
            <p className="text-muted-foreground">
              Verifică clasamentul pentru rezultate.
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Așteptăm începerea jocului...
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 
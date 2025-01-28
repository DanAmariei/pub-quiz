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
  const [rankings, setRankings] = useState([])
  const supabase = createClient()

  // Găsim întrebarea activă
  const questions = game?.quiz?.questions?.map(q => q.question) || []
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
      setSelectedAnswer('')
      setHasAnswered(false)
    }
  }, [activeQuestion?.id])

  // Funcție pentru a obține clasamentul
  const fetchRankings = async () => {
    const { data, error } = await supabase
      .from('game_rankings')
      .select(`
        points,
        rank,
        participant_id,
        profiles(username, avatar_url)
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

  // Funcție pentru a reîncărca datele jocului
  const reloadGameData = async () => {
    const { data: updatedGame, error } = await supabase
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

    if (error) {
      console.error('Error reloading game data:', error)
      return
    }

    console.log('Game data reloaded:', updatedGame)
    setGame(updatedGame)

    if (updatedGame.is_finished) {
      fetchRankings()
    }
  }

  // Ascultăm pentru modificări în joc
  useEffect(() => {
    const channelId = `game_${game.id}`
    console.log('Setting up realtime subscription on channel:', channelId)

    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
        },
        (payload) => {
          console.log('Received payload:', payload)
          
          if (payload.eventType === 'UPDATE') {
            console.log('Game update received:', {
              old: payload.old,
              new: payload.new
            })
            
            if (payload.new.active_question_id !== payload.old.active_question_id ||
                payload.new.is_finished !== payload.old.is_finished) {
              console.log('Relevant changes detected, reloading game data')
              reloadGameData()
            }
          }
        }
      )
      .subscribe()

    return () => {
      console.log('Cleaning up subscription for channel:', channelId)
      supabase.removeChannel(channel)
    }
  }, [game.id])

  // Verificăm dacă jocul este finalizat la montare
  useEffect(() => {
    if (game.is_finished) {
      fetchRankings()
    }
  }, [game.is_finished])

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
    reloadGameData()
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

  if (!game?.quiz) {
    return <div>Loading...</div>
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
            <div className="mt-4">
              {rankings.length > 0 ? (
                <ul>
                  {rankings.map((ranking) => (
                    <li key={ranking.participant_id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        {ranking.profiles.avatar_url && (
                          <img src={ranking.profiles.avatar_url} alt={ranking.profiles.username} className="w-8 h-8 rounded-full mr-2" />
                        )}
                        <span>{ranking.profiles.username}</span>
                      </div>
                      <span>{ranking.points} puncte</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nu există clasamente disponibile.</p>
              )}
            </div>
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
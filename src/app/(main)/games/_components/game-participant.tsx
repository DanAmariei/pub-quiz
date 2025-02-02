'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Ranking } from "@/types/database"
import GameRankings from "./game-rankings"
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
  quiz_id: string
  active_question_id: string | null
  is_finished: boolean
  quiz: {
    id: string
    title: string
    questions: {
      question: Question
      answers_order: string[]
    }[]
  }
}

export default function GameParticipant({ 
  game: initialGame,
  user,
  isParticipant: initialIsParticipant
}: { 
  game: Game
  user: any
  isParticipant: boolean
}) {
  const [game, setGame] = useState(initialGame)
  const [isParticipant, setIsParticipant] = useState(initialIsParticipant)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [hasAnswered, setHasAnswered] = useState(false)
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([])
  const [rankings, setRankings] = useState<Ranking[]>([])
  const supabase = createClient()

  // Găsim întrebarea activă și o definim o singură dată
  const activeQuestion = game.quiz.questions.find(
    q => q.question.id === game.active_question_id
  )?.question

  // Amestecăm răspunsurile când se schimbă întrebarea activă
  useEffect(() => {
    if (activeQuestion) {
      const questionData = game.quiz.questions.find(
        q => q.question.id === game.active_question_id
      );

      // Folosim direct answers_order dacă există
      if (questionData?.answers_order) {
        setShuffledAnswers(questionData.answers_order);
      } else {
        // Fallback la randomizare doar dacă nu avem answers_order
        const answers = [
          activeQuestion.correct_answer,
          ...activeQuestion.incorrect_answers
        ].sort(() => Math.random() - 0.5);
        setShuffledAnswers(answers);
      }

      setSelectedAnswer('');
      setHasAnswered(false);
    }
  }, [activeQuestion?.id, game.active_question_id]);

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
      .select<string, Game>(`
        id,
        host_id,
        quiz_id,
        active_question_id,
        is_finished,
        created_at,
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
          if (payload.eventType === 'UPDATE') {
            // Actualizăm starea jocului când se modifică
            const { data: updatedGame } = await supabase
              .from('games')
              .select<string, Game>(`
                id,
                host_id,
                quiz_id,
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
              setGame(updatedGame)
            }
          }
        }
      )
      .subscribe()

    // Subscrie la modificări în tabelul game_participants pentru acest participant
    const participantChannel = supabase
      .channel(`participant_${game.id}_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_participants',
          filter: `game_id=eq.${game.id} AND participant_id=eq.${user.id}`
        },
        () => {
          setIsParticipant(true)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(participantChannel)
    }
  }, [game.id, user.id])

  // Verificăm dacă jocul este finalizat la montare
  useEffect(() => {
    if (game.is_finished) {
      fetchRankings()
    }
  }, [game.is_finished])

  const handleJoin = async () => {
    const { error } = await supabase
      .from('game_participants')
      .insert({
        game_id: game.id,
        participant_id: user.id
      })

    if (error) {
      toast.error("Nu am putut să te alătur jocului")
      return
    }

    // Actualizăm starea imediat după ce ne-am alăturat cu succes
    setIsParticipant(true)
    toast.success("Te-ai alăturat jocului cu succes!")
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

  if (game.is_finished) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">{game.quiz.title}</h1>
            <p className="text-muted-foreground">Jocul s-a încheiat</p>
          </div>

          <GameRankings 
            rankings={rankings}
            title="Clasament Final"
          />
        </div>
      </div>
    )
  }

  if (!isParticipant) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h1 className="text-2xl font-bold">{game.quiz.title}</h1>
          <div className="space-y-4">
            <Button onClick={handleJoin}>
              Alătură-te Jocului
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!game.active_question_id) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h1 className="text-2xl font-bold">{game.quiz.title}</h1>
          <Card className="p-6">
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Te-ai alăturat cu succes!
              </p>
              <p className="text-muted-foreground">
                Așteptăm ca gazda să înceapă jocul...
              </p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (!activeQuestion) return null

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8 max-w-2xl mx-auto">
        {activeQuestion && (
          <QuestionDisplay
            question={activeQuestion.question}
            answers={shuffledAnswers}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={setSelectedAnswer}
            isInteractive={!hasAnswered}
          />
        )}

        {activeQuestion && !hasAnswered && (
          <Button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
            className="ml-auto"
          >
            Trimite Răspunsul
          </Button>
        )}

        {game.is_finished && (
          <GameRankings 
            rankings={rankings}
            title="Clasament Final"
          />
        )}
      </div>
    </div>
  )
} 
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
import GameHeader from "./game-header"
import GameAnswers from "./game-answers"
import type { Game, UserAnswer, Question } from '@/types/database'

interface QuizQuestion {
  question: Question
  answers_order: string[]
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

  // La începutul componentei, după useState-uri
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(() => {
    // Găsim întrebarea activă și luăm order-ul ei
    const activeQuestion = game.quiz.questions.find(
      q => q.question.id === game.active_question_id
    )
    return activeQuestion?.order ?? 0
  })

  // Găsim întrebarea activă și o definim o singură dată
  const activeQuestion = game.quiz.questions.find(
    q => q.question.id === game.active_question_id
  )?.question

  // Adăugăm un efect pentru a verifica răspunsul existent
  useEffect(() => {
    async function checkExistingAnswer() {
      if (activeQuestion) {
        // Reset state first
        setSelectedAnswer('')
        setHasAnswered(false)

        const { data, error } = await supabase
          .from('participant_answers')
          .select('answer')
          .eq('game_id', game.id)
          .eq('participant_id', user.id)
          .eq('question_id', activeQuestion.id)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 este codul pentru "nu s-a găsit niciun răspuns"
          console.error('Error checking existing answer:', error)
          return
        }

        if (data) {
          setSelectedAnswer(data.answer)
          setHasAnswered(true)
        }
      }
    }

    checkExistingAnswer()
  }, [activeQuestion?.id, game.id, user.id])

  // Modificăm useEffect-ul pentru answers_order să nu mai gestioneze starea răspunsului
  useEffect(() => {
    if (activeQuestion) {
      const questionData = game.quiz.questions.find(
        q => q.question.id === game.active_question_id
      );

      if (questionData?.answers_order) {
        setShuffledAnswers(questionData.answers_order);
      } else {
        const answers = [
          activeQuestion.correct_answer,
          ...activeQuestion.incorrect_answers
        ].sort(() => Math.random() - 0.5);
        setShuffledAnswers(answers);
      }
    }
  }, [activeQuestion?.id, game.active_question_id]);

  // Funcție pentru a obține clasamentul
  const fetchRankings = async () => {
    const { data, error } = await supabase
      .from('game_rankings')
      .select<string, Ranking>(`
        points,
        rank,
        participant_id,
        profiles:profiles!inner (
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
        title,
        quiz:quizzes!inner(
          id,
          title,
          questions:quiz_questions(
            question:questions(
              id,
              question,
              correct_answer,
              incorrect_answers,
              image,
              song,
              video
            ),
            answers_order,
            order
          )
        )
      `)
      .eq('id', game.id)
      .single()

    if (error) {
      console.error('Error reloading game data:', error)
      return
    }

    // Sortăm întrebările
    if (updatedGame.quiz?.questions) {
      updatedGame.quiz.questions = updatedGame.quiz.questions.sort((a, b) => a.order - b.order)
    }

    // Actualizăm indexul și resetăm starea dacă s-a schimbat întrebarea activă
    if (updatedGame.active_question_id !== game.active_question_id) {
      const newActiveQuestion = updatedGame.quiz.questions.find(
        q => q.question.id === updatedGame.active_question_id
      )
      setActiveQuestionIndex(newActiveQuestion?.order ?? 0)
      setSelectedAnswer('')
      setHasAnswered(false)
      setShuffledAnswers([])
    }

    setGame(updatedGame)

    if (updatedGame.is_finished) {
      fetchRankings()
    }
  }

  // În efectul de realtime
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
            const { data: updatedGame } = await supabase
              .from('games')
              .select(`
                id,
                host_id,
                quiz_id,
                active_question_id,
                is_finished,
                created_at,
                title,
                quiz:quizzes!inner(
                  id,
                  title,
                  questions:quiz_questions(
                    question:questions(
                      id,
                      question,
                      correct_answer,
                      incorrect_answers,
                      image,
                      song,
                      video
                    ),
                    answers_order,
                    order
                  )
                )
              `)
              .eq('id', game.id)
              .single()

            if (updatedGame) {
              // Sortăm întrebările
              if (updatedGame.quiz?.questions) {
                updatedGame.quiz.questions = updatedGame.quiz.questions.sort((a, b) => a.order - b.order)
              }

              // Actualizăm indexul doar dacă s-a schimbat întrebarea activă
              if (updatedGame.active_question_id !== game.active_question_id) {
                const newActiveQuestion = updatedGame.quiz.questions.find(
                  q => q.question.id === updatedGame.active_question_id
                )
                setActiveQuestionIndex(newActiveQuestion?.order ?? 0)
                
                // Reset state pentru răspunsuri
                setSelectedAnswer('')
                setHasAnswered(false)
                setShuffledAnswers([])
              }

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
      <div className="">
        <div className="flex flex-col gap-6 sm:gap-8 max-w-2xl mx-auto">
          <GameHeader
            gameId={game.id}
            quizTitle={game.quiz.title}
            currentQuestionNumber={activeQuestionIndex + 1}
            gameTitle={game.title}
            totalQuestions={game.quiz.questions.length}
            isHost={false}
            isFinished={game.is_finished}
          />

          <GameRankings 
            gameId={game.id}
            title="Clasament Final"
          />
          <GameAnswers
            gameId={game.id}
            userId={user.id}
            className="mt-6"
          />
        </div>
      </div>
    )
  }

  if (!isParticipant) {
    return (
      <div className="">
        <div className="flex flex-col gap-6 sm:gap-8 max-w-2xl mx-auto text-center space-y-4">
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
      <div className="">
        <div className="flex flex-col gap-6 sm:gap-8 max-w-2xl mx-auto text-center space-y-4">
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
    <div className="">
      <div className="flex flex-col gap-6 sm:gap-8 max-w-2xl mx-auto">
        <GameHeader
          gameId={game.id}
          quizTitle={game.quiz.title}
          currentQuestionNumber={activeQuestionIndex + 1}
          totalQuestions={game.quiz.questions.length}
          isHost={false}
          isFinished={game.is_finished}
        />

        {activeQuestion && (
          <QuestionDisplay
            key={activeQuestion.id}
            questionNumber={activeQuestionIndex + 1}
            totalQuestions={game.quiz.questions.length}
            question={activeQuestion.question}
            answers={shuffledAnswers}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={setSelectedAnswer}
            isInteractive={!hasAnswered}
            image={activeQuestion.image}
            song={activeQuestion.song}
            video={activeQuestion.video}
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
          <>
            <GameRankings 
              gameId={game.id}
              title="Clasament Final"
            />
            <GameAnswers
              gameId={game.id}
              userId={user.id}
              className="mt-6"
            />
          </>
        )}
      </div>
    </div>
  )
} 
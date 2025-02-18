import { getProfile } from "@/utils/get-profile"
import { createClient } from "@/utils/supabase/server"
import MyGamesClient from "./_components/my-games-client"
import { Database } from "@/types/database"

interface GameWithHost {
  id: string
  title: string
  is_finished: boolean
  created_at: string
  host_id: string
  quiz_id: string
  active_question_id: string | null
  host: {
    username: string
  }
  quiz: {
    id: string
    title: string
    description: string
    questions: {
      question: {
        id: string
        question: string
        correct_answer: string
        incorrect_answers: string[]
      }
      answers_order: string[]
      order: number
    }[]
  }
  participants: {
    count: number
  }[]
}

interface ParticipatedGame {
  game: GameWithHost
}

async function getGames() {
  const { user } = await getProfile() || {}
  if (!user) return []

  const supabase = createClient()

  // Jocurile găzduite
  const { data: hostedGames, error: hostedError } = await supabase
    .from('games')
    .select<string, GameWithHost>(`
      id,
      title,
      is_finished,
      created_at,
      host_id,
      quiz_id,
      active_question_id,
      host:profiles!host_id!inner(username),
      quiz:quizzes!inner(
        id, 
        title, 
        description,
        questions:quiz_questions(
          question:questions(
            id,
            question,
            correct_answer,
            incorrect_answers
          ),
          answers_order,
          order
        )
      ),
      participants:game_participants(count)
    `)
    .eq('host_id', user.id)

  // Jocurile în care participă
  const { data: participatedGames, error: participatedError } = await supabase
    .from('game_participants')
    .select<string, ParticipatedGame>(`
      game:games!inner(
        id,
        title,
        is_finished,
        created_at,
        host_id,
        quiz_id,
        active_question_id,
        host:profiles!host_id!inner(username),
        quiz:quizzes!inner(
          id, 
          title, 
          description,
          questions:quiz_questions(
            question:questions(
              id,
              question,
              correct_answer,
              incorrect_answers
            ),
            answers_order,
            order
          )
        ),
        participants:game_participants(count)
      )
    `)
    .eq('participant_id', user.id)

  if (hostedError) console.error('Error fetching hosted games:', hostedError)
  if (participatedError) console.error('Error fetching participated games:', participatedError)

  const hosted = hostedGames?.map(game => ({
    ...game,
    isHost: true
  })) || []

  const participated = participatedGames?.map(({ game }) => ({
    ...game,
    isHost: false
  })) || []

  // Combinăm și sortăm
  const allGames = [...hosted, ...participated]
    .map(game => ({
      ...game,
      isHost: game.host_id === user.id
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  console.log('All games:', allGames)

  return allGames
}

export default async function MyGamesPage() {
  const games = await getGames()
  return <MyGamesClient initialGames={games} />
} 
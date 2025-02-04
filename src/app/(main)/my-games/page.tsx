import { getProfile } from "@/utils/get-profile"
import { createClient } from "@/utils/supabase/server"
import MyGamesClient from "./_components/my-games-client"
import { Database } from "@/types/database"

type GameWithQuiz = {
  id: string
  created_at: string
  is_finished: boolean
  title: string
  quiz: {
    title: string
    description: string
  }
}

async function getGames() {
  const { user } = await getProfile() || {}
  if (!user) return []

  const supabase = createClient()

  // Obținem jocurile găzduite
  const { data: hostedGames } = await supabase
    .from('games')
    .select<string, GameWithQuiz>(`
      id,
      created_at,
      is_finished,
      title,
      quiz:quizzes!inner (
        title,
        description
      )
    `)
    .eq('host_id', user.id)

  // Obținem jocurile în care a participat
  const { data: participatedGames } = await supabase
    .from('game_participants')
    .select<string, GameWithQuiz>(`
      game:games!inner (
        id,
        created_at,
        is_finished,
        title,
        quiz:quizzes!inner (
          title,
          description
        )
      )
    `)
    .eq('participant_id', user.id)

  // Formatăm rezultatele
  const hostedGamesList = (hostedGames || []).map(game => ({
    ...game,
    role: 'host' as const
  }))

  const participatedGamesList = (participatedGames || []).map((participant) => ({
    id: participant.game.id,
    created_at: participant.game.created_at,
    is_finished: participant.game.is_finished,
    title: participant.game.title,
    quiz: participant.game.quiz,
    role: 'participant' as const
  }))

  // Combinăm și sortăm toate jocurile
  return [...hostedGamesList, ...participatedGamesList]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export default async function MyGamesPage() {
  const games = await getGames()
  return <MyGamesClient initialGames={games} />
} 
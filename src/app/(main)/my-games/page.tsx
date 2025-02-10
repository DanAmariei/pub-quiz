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

  // Jocurile găzduite
  const { data: hostedGames, error: hostedError } = await supabase
    .from('games')
    .select(`
      id,
      title,
      is_finished,
      created_at,
      host_id,
      quiz_id,
      host:profiles!host_id(
        username
      ),
      quiz:quizzes!inner(
        id,
        title,
        description
      ),
      participants:game_participants(count)
    `)
    .eq('host_id', user.id)
    .order('created_at', { ascending: false })

  // Jocurile în care participă
  const { data: participatedGames, error: participatedError } = await supabase
    .from('game_participants')
    .select(`
      game:games!inner(
        id,
        title,
        is_finished,
        created_at,
        host_id,
        quiz_id,
        host:profiles!host_id(
          username
        ),
        quiz:quizzes!inner(
          id,
          title,
          description
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
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  console.log('All games:', allGames)

  return allGames
}

export default async function MyGamesPage() {
  const games = await getGames()
  return <MyGamesClient initialGames={games} />
} 
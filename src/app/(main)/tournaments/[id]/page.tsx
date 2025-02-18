import { getProfile } from "@/utils/get-profile"
import { createClient } from "@/utils/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Users, Trophy } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { statusColors, statusLabels } from "@/lib/constants"
import GameCard from "@/components/game-card"
import TournamentRankings from "../_components/tournament-rankings"

interface GameResponse {
  id: string
  title: string
  created_at: string
  is_finished: boolean
  host_id: string
  quiz_id: string
  host: {
    username: string
  }
  quiz: {
    id: string
    title: string
    description: string
  }
  participants: {
    count: number
  }[]
}

export default async function TournamentPage({
  params: { id }
}: {
  params: { id: string }
}) {
  const { user, profile } = await getProfile() || {}
  if (!user) return null

  const supabase = createClient()
  
  // Mai întâi luăm datele despre turneu
  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select(`
      id,
      name,
      description,
      start_date,
      stages,
      status
    `)
    .eq('id', id)
    .single()

  if (error || !tournament) {
    console.error('Error fetching tournament:', error)
    notFound()
  }

  // Verificăm dacă userul are acces la acest turneu
  const canAccess = profile?.is_host || profile?.is_admin
  
  if (!canAccess) {
    // Verificăm dacă userul a participat la vreun joc din acest turneu
    const { data: participations } = await supabase
      .from('games')
      .select(`
        id,
        game_participants!inner(participant_id)
      `)
      .eq('tournament_id', id)
      .eq('game_participants.participant_id', user.id)
      .limit(1)

    if (!participations?.length) {
      // Userul nu a participat la niciun joc din acest turneu
      redirect('/')
    }
  }

  // Apoi luăm jocurile asociate turneului
  const { data: games } = await supabase
    .from('games')
    .select<string, GameResponse>(`
      id,
      title,
      is_finished,
      created_at,
      host_id,
      quiz_id,
      host:profiles!host_id!inner(
        username
      ),
      quiz:quizzes!inner(
        id,
        title,
        description
      ),
      participants:game_participants(count)
    `)
    .eq('tournament_id', id)

  // Luăm numărul de participanți
  const { count: playersCount } = await supabase
    .from('game_participants')
    .select('*', { count: 'exact', head: true })
    .in('game_id', games?.map(g => g.id) || [])

  // Transformăm datele pentru a se potrivi cu interfața Game
  const formattedGames = games?.map(game => ({
    ...game,
    host_id: game.host_id,
    quiz_id: game.quiz_id,
    active_question_id: null,
    host: {
      name: game.host?.username
    },
    quiz: {
      id: game.quiz?.id,
      title: game.quiz?.title,
      description: game.quiz?.description,
      questions: []
    }
  })) || []

  console.log(formattedGames)

  return (
    <main className="">
      <div className="flex flex-col gap-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{tournament.name}</h1>
            <p className="text-muted-foreground mt-1">
              {tournament.description}
            </p>
          </div>
        </div>
        {/* Adăugăm clasamentul aici */}
        <TournamentRankings 
          tournamentId={tournament.id} 
          className="mt-4"
        />

        <div className="grid gap-4 mt-8">
          <h2 className="text-xl font-semibold">Jocuri în acest turneu</h2>
          {formattedGames.map((game) => (
            <GameCard 
              key={game.id}
              game={game}
              showHost={true}
            />
          ))}
          {formattedGames.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              Nu există jocuri în acest turneu.
            </p>
          )}
        </div>
      </div>
    </main>
  )
} 
import { getProfile } from "@/utils/get-profile"
import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Users, Trophy } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { statusColors, statusLabels } from "@/lib/constants"
import GameCard from "@/components/game-card"

interface TournamentMatch {
  id: string
  round: number
  status: string
  player1: {
    id: string
    username: string
  }
  player2: {
    id: string
    username: string
  }
  winner_id: string | null
}

interface Tournament {
  id: string
  name: string
  description: string
  start_date: string
  stages: number
  status: 'upcoming' | 'active' | 'completed'
  participants: Array<{
    id: string
    profiles: {
      username: string
      avatar_url: string | null
    }
  }>
  matches: TournamentMatch[]
  games: Array<{
    id: string
    title: string
    description: string
    is_finished: boolean
    host: {
      id: string
      name: string
    }
  }>
}

export default async function TournamentPage({
  params: { id }
}: {
  params: { id: string }
}) {
  const { user } = await getProfile() || {}
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

  if (error) {
    console.error('Error fetching tournament:', error)
    notFound()
  }

  if (!tournament) {
    console.log('Tournament not found:', id)
    notFound()
  }

  // Apoi luăm jocurile asociate turneului
  const { data: games } = await supabase
    .from('games')
    .select(`
      id,
      title,
      is_finished,
      created_at,
      host:profiles!host_id(
        id,
        username,
        avatar_url
      ),
      quiz:quizzes(
        id,
        title,
        description
      ),
      participants:game_participants(count)
    `)
    .eq('tournament_id', id)

  // Luăm numărul de participanți
  const { data: playersCount } = await supabase
    .from('game_participants')
    .select('id', { count: 'exact' })
    .in('game_id', games?.map(g => g.id) || [])
    .single()

  // Transformăm datele pentru a se potrivi cu interfața Game
  const formattedGames = games?.map(game => ({
    ...game,
    host: {
      name: game.host.username
    },
    quiz: {
      ...game.quiz,
      questions: []
    }
  })) || []

  return (
    <main className="container py-8">
      <div className="flex flex-col gap-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{tournament.name}</h1>
            <p className="text-muted-foreground mt-1">
              {tournament.description}
            </p>
          </div>
          <Badge className={statusColors[tournament.status as keyof typeof statusColors]}>
            {statusLabels[tournament.status as keyof typeof statusLabels]}
          </Badge>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Data Începerii</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(tournament.start_date)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Etape</p>
                <p className="text-sm text-muted-foreground">
                  {tournament.stages} runde
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Participanți</p>
                <p className="text-sm text-muted-foreground">
                  {playersCount?.participants?.[0]?.count || 0} jucători
                </p>
              </div>
            </div>
          </Card>
        </div>

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
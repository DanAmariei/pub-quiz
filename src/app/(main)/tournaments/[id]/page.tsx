import { getProfile } from "@/utils/get-profile"
import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Users, Trophy } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { statusColors, statusLabels } from "@/lib/constants"

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
}

export default async function TournamentPage({
  params: { id }
}: {
  params: { id: string }
}) {
  const { user } = await getProfile() || {}
  if (!user) return null

  const supabase = createClient()
  
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

  const { data: playersCount } = await supabase
    .from('games')
    .select('participants:game_participants(count)', { count: 'exact' })
    .eq('tournament_id', id)
    .single()

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
      </div>
    </main>
  )
} 
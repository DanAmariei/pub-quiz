import { getProfile } from "@/utils/get-profile"
import { createClient } from "@/utils/supabase/server"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDistanceToNow } from 'date-fns'
import { ro } from 'date-fns/locale'

export default async function MyGamesPage() {
  const { user } = await getProfile() || {}
  if (!user) return null

  const supabase = createClient()

  // Obținem jocurile găzduite
  const { data: hostedGames } = await supabase
    .from('games')
    .select(`
      id,
      created_at,
      is_finished,
      quiz:quizzes (
        title,
        description
      )
    `)
    .eq('host_id', user.id)
    .order('created_at', { ascending: false })

  // Obținem jocurile în care a participat
  const { data: participatedGames } = await supabase
    .from('game_participants')
    .select(`
      game:games (
        id,
        created_at,
        is_finished,
        quiz:quizzes (
          title,
          description
        )
      )
    `)
    .eq('participant_id', user.id)
    .order('created_at', { ascending: false })

  const games = [
    ...(hostedGames || []).map(game => ({ ...game, role: 'host' as const })),
    ...(participatedGames || []).map(({ game }) => ({ ...game, role: 'participant' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Jocurile Mele</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <Link key={game.id} href={`/games/${game.id}`}>
            <Card className="p-4 hover:bg-accent transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <h2 className="font-semibold">{game.quiz.title}</h2>
                <Badge variant={game.role === 'host' ? 'default' : 'secondary'}>
                  {game.role === 'host' ? 'Gazdă' : 'Participant'}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {game.quiz.description}
              </p>
              
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <Badge variant={game.is_finished ? 'outline' : 'default'}>
                  {game.is_finished ? 'Finalizat' : 'În desfășurare'}
                </Badge>
                <span>
                  {formatDistanceToNow(new Date(game.created_at), { 
                    addSuffix: true,
                    locale: ro 
                  })}
                </span>
              </div>
            </Card>
          </Link>
        ))}

        {games.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center py-8">
            Nu ai participat la niciun joc încă.
          </p>
        )}
      </div>
    </div>
  )
} 
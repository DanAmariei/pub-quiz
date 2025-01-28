import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CalendarIcon, Trophy, Users } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import type { Tournament } from "@/types/database"

// Mutăm constantele în fișierul de utils sau într-un fișier separat de constante
const statusColors = {
  upcoming: "bg-blue-500",
  active: "bg-green-500",
  completed: "bg-gray-500"
} as const

const statusLabels = {
  upcoming: "În curând",
  active: "Activ",
  completed: "Finalizat"
} as const

export default async function TournamentDetailsPage({
  params: { id }
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  
  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select(`
      *,
      participants:profiles(username),
      quiz_sessions (
        id,
        name,
        status,
        created_at,
        quiz:quizes (
          name,
          category,
          difficulty
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !tournament) {
    console.error('Error fetching tournament:', error)
    notFound()
  }

  const typedTournament = tournament as Tournament

  return (
    <main className="flex-1 container py-8">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-4 w-full max-w-3xl">
          <Button variant="outline" size="icon" asChild>
            <Link href="/turnee">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{typedTournament.name}</h1>
              <Badge className={statusColors[typedTournament.status]}>
                {statusLabels[typedTournament.status]}
              </Badge>
            </div>
            <p className="mt-2 text-muted-foreground">
              {typedTournament.description}
            </p>
          </div>
        </div>

        <div className="grid gap-6 w-full max-w-3xl">
          <div className="grid gap-4">
            <h2 className="text-xl font-semibold">Detalii Turneu</h2>
            <div className="grid gap-4 p-6 border rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="w-4 h-4" />
                <span>Începe pe {formatDate(typedTournament.start_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Trophy className="w-4 h-4" />
                <span>{typedTournament.stages} etape</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{typedTournament.participants?.length || 0} participanți</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <h2 className="text-xl font-semibold">Quiz-uri în Turneu</h2>
            <div className="grid gap-4">
              {typedTournament.quiz_sessions?.map((session) => (
                <div 
                  key={session.id}
                  className="p-4 rounded-lg border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{session.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {session.quiz.name} ({session.quiz.category} - {
                          session.quiz.difficulty === 'easy' ? 'Ușor' : 
                          session.quiz.difficulty === 'medium' ? 'Mediu' : 'Dificil'
                        })
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Creat pe {formatDate(session.created_at)}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {session.status === 'waiting' ? 'În așteptare' :
                       session.status === 'active' ? 'În desfășurare' : 'Finalizat'}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!typedTournament.quiz_sessions || typedTournament.quiz_sessions.length === 0) && (
                <p className="text-muted-foreground text-center py-4">
                  Nu există quiz-uri adăugate încă.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 
import { getProfile } from "@/utils/get-profile"
import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { Plus } from "lucide-react"

export default async function GamesPage() {
  const { profile } = await getProfile() || {}
  const canHostGame = profile?.is_host || profile?.is_admin

  const supabase = createClient()
  const { data: games } = await supabase
    .from('games')
    .select(`
      id,
      created_at,
      quiz_id,
      host_id,
      quiz:quizzes(title)
    `)
    .eq('is_finished', false)
    .order('created_at', { ascending: false })

  return (
    <main className="flex-1 container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Jocuri Active</h1>
            <p className="text-muted-foreground">
              Alătură-te unui joc sau creează unul nou
            </p>
          </div>
          {canHostGame && (
            <Button asChild>
              <Link href="/">
                <Plus className="w-4 h-4 mr-2" />
                Joc Nou
              </Link>
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {games?.map((game) => (
            <Card key={game.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle>{game.quiz.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p>Creat: {formatDate(game.created_at)}</p>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/games/${game.id}`}>
                      Alătură-te
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!games || games.length === 0) && (
            <p className="text-muted-foreground col-span-full text-center py-8">
              Nu există jocuri active momentan.
            </p>
          )}
        </div>
      </div>
    </main>
  )
} 
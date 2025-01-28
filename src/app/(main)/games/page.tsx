import { getProfile } from "@/utils/get-profile"
import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import RealTimeGames from "./_components/real-time-games"

export default async function GamesPage() {
  const { profile } = await getProfile() || {}
  const canHostGame = profile?.is_host || profile?.is_admin

  const supabase = createClient()
  const { data: initialGames } = await supabase
    .from('games')
    .select(`
      *,
      host:profiles(name),
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
        </div>

        <RealTimeGames initialGames={initialGames || []} />
      </div>
    </main>
  )
} 
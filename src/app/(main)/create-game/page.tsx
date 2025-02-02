import { createClient } from "@/utils/supabase/server"
import { getProfile } from "@/utils/get-profile"
import { redirect } from "next/navigation"
import CreateGameForm from "./_components/create-game-form"
import type { Quiz, Tournament } from "@/types/database"

export default async function CreateGamePage() {
  const { profile } = await getProfile() || {}
  if (!profile?.is_host && !profile?.is_admin) {
    redirect('/')
  }

  const supabase = createClient()
  
  // Fetch quizzes și tournaments
  const [quizzesResult, tournamentsResult] = await Promise.all([
    supabase.from('quizzes').select('*').order('created_at', { ascending: false }),
    supabase.from('tournaments')
      .select('id, name')
      .eq('status', 'upcoming')
      .order('start_date', { ascending: true })
  ])

  const quizzes = quizzesResult.data || []
  const tournaments = tournamentsResult.data || []

  return (
    <main className="flex-1 container py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Creează Joc Nou</h1>
          <p className="text-muted-foreground mt-2">
            Completează detaliile pentru noul joc
          </p>
        </div>

        <CreateGameForm 
          quizzes={quizzes}
          tournaments={tournaments}
        />
      </div>
    </main>
  )
} 
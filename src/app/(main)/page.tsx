import { getProfile } from "@/utils/get-profile"
import { createClient } from "@/utils/supabase/server"
import HostQuizForm from "./_components/host-quiz-form"
import type { Quiz } from "@/types/database"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface Tournament {
  id: string
  name: string
}

export default async function HomePage() {
  const { profile } = await getProfile() || {}
  const canHostQuiz = profile?.is_host || profile?.is_admin

  const supabase = createClient()
  
  // Fetch quizes și turnee doar dacă utilizatorul poate hosta
  let quizes: Quiz[] = []
  let tournaments: Tournament[] = []
  
  if (canHostQuiz) {
    const [quizesResult, tournamentsResult] = await Promise.all([
      supabase.from('quizzes').select('*').order('created_at', { ascending: false }),
      supabase.from('tournaments').select('id, name').eq('status', 'upcoming')
    ])
    
    quizes = quizesResult.data || []
    tournaments = tournamentsResult.data || []
  }

  return (
    <main className="flex-1 container py-8">
      <div className="flex flex-col items-center gap-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Quiz Game</h1>
          <p className="text-muted-foreground mt-2">
            Testează-ți cunoștințele și distrează-te!
          </p>
        </div>

        {canHostQuiz && (
          <div className="w-full max-w-md">
            <HostQuizForm 
              quizes={quizes}
              tournaments={tournaments}
            />
          </div>
        )}

        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Jocuri Active</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/games" className="flex items-center gap-2">
                Vezi toate
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
} 
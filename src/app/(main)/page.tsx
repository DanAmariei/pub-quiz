import { getProfile } from "@/utils/get-profile"
import { createClient } from "@/utils/supabase/server"
import type { Quiz } from "@/types/database"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface Tournament {
  id: string
  name: string
}

export default async function HomePage() {

  return (
    <main className="flex-1 container py-8">
      <div className="flex flex-col items-center gap-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Quiz Game</h1>
          <p className="text-muted-foreground mt-2">
            Testează-ți cunoștințele și distrează-te!
          </p>
        </div>

        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-center mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/games" className="flex items-center gap-2">
                Vezi pagina de jocuri
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
} 
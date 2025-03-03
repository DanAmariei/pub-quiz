'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDistanceToNow } from 'date-fns'
import { ro } from 'date-fns/locale'
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Game } from '@/types/database'
// import RealTimeGames from "@/components/real-time-games"
// import { getProfile } from "@/utils/supabase/auth"
import RealTimeGames from "./_components/real-time-games"
import { getProfile } from "@/utils/get-profile"
import GameCard from "@/components/game-card"
import { ColourfulText } from "@/components/ui/colourful-text"

interface GameResponse {
  id: string
  title: string
  created_at: string
  is_finished: boolean
  host_id: string
  quiz_id: string
  active_question_id: string | null
  host: {
    id: string
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

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [isHost, setIsHost] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Verificăm dacă utilizatorul este host sau admin
    async function checkUserRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_host, is_admin')
          .eq('id', user.id)
          .single()

        if (profile) {
          setIsHost(profile.is_host)
          setIsAdmin(profile.is_admin)
        }
      }
    }

    // Încărcăm jocurile existente
    async function fetchGames() {
      const { data } = await supabase
        .from('games')
        .select<string, GameResponse>(`
          id,
          title,
          created_at,
          is_finished,
          host_id,
          quiz_id,
          active_question_id,
          host:profiles!host_id(
            id,
            username
          ),
          quiz:quizzes(
            id,
            title,
            description
          ),
          participants:game_participants(count)
        `)
        .eq('is_finished', false)
        .order('created_at', { ascending: false })

      if (data) {
        setGames(data as unknown as Game[])
      }
    }

    checkUserRole()
    fetchGames()

    // Subscrie la modificări în tabelul games
    const channel = supabase
      .channel('games_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games'
        },
        (payload) => {
          fetchGames() // Reîncărcăm jocurile la orice modificare
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <main className="flex-1">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-center text-white relative z-2 font-sans">
               <ColourfulText text="Terenul de joacă" /> <br />
            </h1>
            <p className="text-muted-foreground">
              Vezi jocurile disponibile
            </p>
          </div>
          {(isHost || isAdmin) && (
            <Button asChild>
              <Link href="/create-game">
                <Plus className="w-4 h-4 mr-2" />
                Creează Joc Nou
              </Link>
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              showHost={true}
            />

          ))}

          {games.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              Nu există jocuri active în acest moment.
            </p>
          )}
        </div>
      </div>
    </main>
  )
} 
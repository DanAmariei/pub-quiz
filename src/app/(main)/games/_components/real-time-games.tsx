'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import type { Game } from '@/types/database'
import GameCard from "@/components/game-card"

interface RealTimeGamesProps {
  initialGames: Game[]
  isHost?: boolean
  isAdmin?: boolean
}

interface GameResponse {
  id: string
  title: string
  is_finished: boolean
  created_at: string
  host_id: string
  quiz_id: string
  host: {
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

export default function RealTimeGames({ initialGames, isHost, isAdmin }: RealTimeGamesProps) {
  const [games, setGames] = useState(initialGames)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('games')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'games',
          filter: 'is_finished=eq.false'
        }, 
        async (payload) => {
          const { data } = await supabase
            .from('games')
            .select<string, GameResponse>(`
              id,
              title,
              is_finished,
              created_at,
              host_id,
              quiz_id,
              host:profiles!host_id!inner(
                username
              ),
              quiz:quizzes!inner(
                id,
                title,
                description
              ),
              participants:game_participants(count)
            `)
            .eq('is_finished', false)
            .order('created_at', { ascending: false })

          if (data) {
            const formattedGames = data.map(game => ({
              ...game,
              host_id: game.host_id,
              quiz_id: game.quiz_id,
              active_question_id: null,
              host: {
                name: game.host.username
              },
              quiz: {
                id: game.quiz.id,
                title: game.quiz.title,
                description: game.quiz.description,
                questions: []
              }
            }))
            setGames(formattedGames)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Jocuri Active</h1>
          <p className="text-muted-foreground">
            Vezi jocurile disponibile sau creează unul nou
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

      <div className="flex flex-col gap-4 max-w-2xl mx-auto">
        {games.map((game) => (
          <Link key={game.id} href={`/games/${game.id}`}>
            <GameCard 
              game={game}
              showHost={true}
            />
          </Link>
        ))}
        {games.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            Nu există jocuri active momentan.
          </p>
        )}
      </div>
    </div>
  )
} 
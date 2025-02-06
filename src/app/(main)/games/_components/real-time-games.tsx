'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import type { Game } from '@/types/database'
import GameCard from "@/components/game-card"

export default function RealTimeGames({ initialGames }: { initialGames: Game[] }) {
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
          // Refetch games when there's a change
          const { data } = await supabase
            .from('games')
            .select(`
              *,
              host:profiles(name),
              quiz:quizzes(title)
            `)
            .eq('is_finished', false)
            .order('created_at', { ascending: false })

          setGames(data || [])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {games.map((game) => (
        <GameCard 
          key={game.id}
          game={game}
          showHost={true}
        />
      ))}
      {games.length === 0 && (
        <p className="text-muted-foreground col-span-full text-center py-8">
          Nu există jocuri active momentan.
        </p>
      )}
    </div>
  )
} 
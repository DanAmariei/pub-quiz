'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import type { Game } from '@/types/database'

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
        <Card key={game.id}>
          <CardHeader>
            <CardTitle>{game.quiz.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Host: {game.host.name}
                <br />
                Creat: {formatDate(game.created_at)}
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
      {games.length === 0 && (
        <p className="text-muted-foreground col-span-full text-center py-8">
          Nu există jocuri active momentan.
        </p>
      )}
    </div>
  )
} 
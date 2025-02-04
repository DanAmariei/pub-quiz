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

interface Game {
  id: string
  created_at: string
  is_finished: boolean
  title: string
  host: {
    username: string
  }
  quiz: {
    title: string
    description: string
  }
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
        .select(`
          id,
          created_at,
          is_finished,
          title,
          host:profiles!games_host_id_fkey(username),
          quiz:quizzes(
            title,
            description
          )
        `)
        .eq('is_finished', false)
        .order('created_at', { ascending: false })

      if (data) {
        setGames(data)
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
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data: newGame } = await supabase
              .from('games')
              .select(`
                id,
                created_at,
                is_finished,
                title,
                host:profiles!games_host_id_fkey(username),
                quiz:quizzes(
                  title,
                  description
                )
              `)
              .eq('id', payload.new.id)
              .single()

            if (newGame && !newGame.is_finished) {
              setGames(current => [newGame, ...current])
            }
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.is_finished) {
              setGames(current => current.filter(game => game.id !== payload.new.id))
            }
          } else if (payload.eventType === 'DELETE') {
            setGames(current => current.filter(game => game.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <main className="flex-1 container py-8">
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
              <Card className="p-4 hover:bg-accent transition-colors cursor-pointer w-full">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="font-semibold">{game.title || game.quiz.title}</h2>
                    {game.title && (
                      <p className="text-sm text-muted-foreground">
                        Quiz: {game.quiz.title}
                      </p>
                    )}
                  </div>
                  <Badge>
                    Gazdă: {game.host.username}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {game.quiz.description}
                </p>
                
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <Badge variant="outline">
                    {game.is_finished ? 'Finalizat' : 'În desfășurare'}
                  </Badge>
                  <span>
                    {formatDistanceToNow(new Date(game.created_at), { 
                      addSuffix: true,
                      locale: ro 
                    })}
                  </span>
                </div>
              </Card>
            </Link>
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
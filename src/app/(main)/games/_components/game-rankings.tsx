'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import LoadingSpinner from "./loading-spinner"

interface Ranking {
  points: number
  rank: number
  participant_id: string
  profiles: {
    username: string
    avatar_url: string | null
  }
}

interface GameRankingsProps {
  gameId: string
  title?: string
  className?: string
}

export default function GameRankings({ 
  gameId,
  title = "Clasament",
  className 
}: GameRankingsProps) {
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchRankings = async () => {
    setIsLoading(true)
    try {
      // Mai întâi luăm toți participanții
      const { data: participants, error: participantsError } = await supabase
        .from('game_participants')
        .select(`
          participant_id,
          profiles:participant_id (
            username,
            avatar_url
          )
        `)
        .eq('game_id', gameId)

      if (participantsError) {
        console.error('Error fetching participants:', participantsError)
        return
      }

      // Apoi luăm rankingurile existente
      const { data: rankings, error: rankingsError } = await supabase
        .from('game_rankings')
        .select(`
          points,
          rank,
          participant_id
        `)
        .eq('game_id', gameId)

      if (rankingsError) {
        console.error('Error fetching rankings:', rankingsError)
        return
      }

      // Combinăm datele
      const combinedRankings = participants.map(participant => {
        const ranking = rankings?.find(r => r.participant_id === participant.participant_id)
        return {
          participant_id: participant.participant_id,
          points: ranking?.points || 0,
          rank: 0, // vom actualiza mai jos
          profiles: participant.profiles
        }
      })

      // Sortăm după puncte și actualizăm rank-ul
      const sortedRankings = combinedRankings
        .sort((a, b) => b.points - a.points)
        .map((ranking, index) => ({
          ...ranking,
          rank: index + 1
        }))

      setRankings(sortedRankings)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRankings()

    // Subscrie la modificări în game_rankings
    const channel = supabase
      .channel(`game_rankings_${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rankings',
          filter: `game_id=eq.${gameId}`
        },
        () => {
          fetchRankings()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId])

  return (
    <Card className={className}>
      <div className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-3">
            {rankings.map((ranking) => (
              <div
                key={ranking.participant_id}
                className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-accent/50"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-6 sm:w-8 text-center font-medium shrink-0">
                    #{ranking.rank}
                  </div>
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0">
                    <AvatarImage
                      src={ranking.profiles.avatar_url || ''}
                      alt={ranking.profiles.username}
                    />
                    <AvatarFallback>
                      {ranking.profiles.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">
                    {ranking.profiles.username}
                  </span>
                </div>
                <div className="font-semibold whitespace-nowrap">
                  {ranking.points} puncte
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
} 
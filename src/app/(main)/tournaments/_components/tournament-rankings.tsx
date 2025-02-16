'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Medal } from "lucide-react"
import LoadingSpinner from "@/app/(main)/games/_components/loading-spinner"

interface TournamentRanking {
  participant_id: string
  username: string
  avatar_url: string | null
  total_points: number
  rank: number
}

interface TournamentRankingsProps {
  tournamentId: string
  title?: string
  className?: string
}

const getMedalColor = (rank: number) => {
  switch (rank) {
    case 1:
      return "text-yellow-500"
    case 2:
      return "text-gray-400"
    case 3:
      return "text-amber-700"
    default:
      return ""
  }
}

export default function TournamentRankings({ 
  tournamentId,
  title = "Clasament Turneu",
  className 
}: TournamentRankingsProps) {
  const [rankings, setRankings] = useState<TournamentRanking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchRankings = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('games')
        .select(`
          id,
          game_rankings(
            participant_id,
            points,
            profiles(
              username,
              avatar_url
            )
          )
        `)
        .eq('tournament_id', tournamentId)

      if (error) {
        console.error('Error fetching rankings:', error)
        return
      }

      // Agregăm punctele pentru fiecare participant
      const pointsByParticipant = data.reduce((acc: Record<string, TournamentRanking>, game) => {
        game.game_rankings?.forEach(ranking => {
          const participantId = ranking.participant_id
          const profile = ranking.profiles
          if (!acc[participantId]) {
            acc[participantId] = {
              participant_id: participantId,
              username: profile.username,
              avatar_url: profile.avatar_url,
              total_points: 0,
              rank: 0
            }
          }
          acc[participantId].total_points += ranking.points
        })
        return acc
      }, {})

      // Convertim în array și sortăm după puncte
      const sortedRankings = Object.values(pointsByParticipant)
        .sort((a, b) => b.total_points - a.total_points)
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

    // Subscrie la modificări în game_rankings pentru jocurile din turneu
    const channel = supabase
      .channel(`tournament_rankings_${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rankings',
          filter: `game_id=in.(select id from games where tournament_id=${tournamentId})`
        },
        () => {
          fetchRankings()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tournamentId])

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
                  <div className="w-6 sm:w-8 text-center font-medium shrink-0 flex items-center justify-center">
                    {ranking.rank <= 3 ? (
                      <div className="relative">
                        <Medal className={`h-5 w-5 ${getMedalColor(ranking.rank)}`} />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                          {ranking.rank}
                        </span>
                      </div>
                    ) : (
                      `#${ranking.rank}`
                    )}
                  </div>
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0">
                    <AvatarImage
                      src={ranking.avatar_url || ''}
                      alt={ranking.username}
                    />
                    <AvatarFallback>
                      {ranking.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">
                    {ranking.username}
                  </span>
                </div>
                <div className="font-semibold whitespace-nowrap">
                  {ranking.total_points} puncte
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Users } from "lucide-react"
import Link from "next/link"
import type { Game } from '@/types/database'

interface GameCardProps {
  game: Game & {
    participants?: { count: number }[]
    isHost?: boolean
  }
  showHost?: boolean
  showDelete?: boolean
  onDelete?: (gameId: string) => void
  className?: string
}

export default function GameCard({ 
  game, 
  showHost = false,
  showDelete = false,
  onDelete,
  className 
}: GameCardProps) {
  return (
    <Link href={`/games/${game.id}`}>
      <Card className={`p-4 hover:bg-accent transition-colors cursor-pointer w-full ${className}`}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="font-semibold">{game.title || game.quiz.title}</h2>
            {game.title && (
              <p className="text-sm text-muted-foreground">
                Quiz: {game.quiz.title}
              </p>
            )}
          </div>
          {game.isHost && (
            <Badge>
              Gazdă
            </Badge>
          )}
        </div>
        
        {game.quiz.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {game.quiz.description}
          </p>
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary"
              className={game.is_finished ? "bg-muted" : "bg-green-500/15 text-green-600 dark:text-green-400"}
            >
              {game.is_finished ? "Finalizat" : "În desfășurare"}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {game.participants?.[0]?.count || 0}
            </Badge>
          </div>

          {showDelete && game.isHost && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={(e) => {
                e.preventDefault()
                onDelete(game.id)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </Link>
  )
} 
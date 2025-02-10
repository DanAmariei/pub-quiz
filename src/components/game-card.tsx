'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
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
        
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex gap-2 items-center">
            <Badge variant={game.is_finished ? 'outline' : 'default'}>
              {game.is_finished ? 'Finalizat' : 'În desfășurare'}
            </Badge>
            {game.participants && (
              <Badge variant="secondary">
                {game.participants[0]?.count || 0}
                {' '}
                {game.participants[0]?.count === 1 ? 'participant' : 'participanți'}
              </Badge>
            )}
          </div>

          <div className="flex gap-2 items-center">
            {game.created_at && (
              <span>Creat: {formatDate(game.created_at)}</span>
            )}
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
        </div>
      </Card>
    </Link>
  )
} 
'use client'

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteGame } from "../../_actions"

interface Game {
  id: string
  title: string
  created_at: string
  is_finished: boolean
  role: 'host' | 'participant'
  quiz: {
    title: string
    description: string
  }
}

export default function MyGamesClient({ initialGames }: { initialGames: Game[] }) {
  const [games, setGames] = useState(initialGames)
  const [gameToDelete, setGameToDelete] = useState<string | null>(null)

  const handleDeleteGame = async () => {
    if (!gameToDelete) return

    const result = await deleteGame(gameToDelete)
    
    if (result.error) {
      toast.error(result.error)
      return
    }

    setGames(current => current.filter(game => game.id !== gameToDelete))
    toast.success("Jocul a fost șters cu succes!")
    setGameToDelete(null)
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Jocurile Mele</h1>
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
                <Badge variant={game.role === 'host' ? 'default' : 'secondary'}>
                  {game.role === 'host' ? 'Gazdă' : 'Participant'}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {game.quiz.description}
              </p>
              
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <Badge variant={game.is_finished ? 'outline' : 'default'}>
                  {game.is_finished ? 'Finalizat' : 'În desfășurare'}
                </Badge>
                {game.role === 'host' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={(e) => {
                      e.preventDefault()
                      setGameToDelete(game.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          </Link>
        ))}

        {games.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            Nu ai participat la niciun joc încă.
          </p>
        )}
      </div>

      <AlertDialog open={!!gameToDelete} onOpenChange={() => setGameToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ești sigur?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune nu poate fi anulată. Jocul va fi șters definitiv.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGame}
              className="bg-destructive hover:bg-destructive/90"
            >
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 
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
import { toast } from "sonner"
import { deleteGame } from "../../_actions"
import type { Game } from '@/types/database'
import GameCard from "@/components/game-card"

interface MyGamesClientProps {
  initialGames: (Game & {
    isHost: boolean
  })[]
}

export default function MyGamesClient({ initialGames }: MyGamesClientProps) {
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
          <GameCard 
            key={game.id}
            game={game}
            showDelete={true}
            onDelete={(id) => setGameToDelete(id)}
          />
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
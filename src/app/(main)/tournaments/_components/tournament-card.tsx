'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Users, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
import { useState } from "react"
import { deleteTournament } from "@/app/(main)/_actions"
import { formatDate } from "@/lib/utils"
import type { Tournament } from "@/types/database"

interface TournamentCardProps {
  tournament: Tournament
  canDelete?: boolean
  userId?: string
}

export default function TournamentCard({ tournament, canDelete, userId }: TournamentCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()
  const isParticipant = userId && tournament.participant_ids?.includes(userId)

  const handleDelete = async () => {
    const result = await deleteTournament(tournament.id)
    
    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success("Turneul a fost șters cu succes!")
    setShowDeleteDialog(false)
  }

  return (
    <>
      <Link href={`/tournaments/${tournament.id}`}>
        <Card className="relative">
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{tournament.name}</h3>
              <p className="text-muted-foreground mb-4 line-clamp-3">
              {tournament.description}
            </p>
              <div className="flex items-center gap-2">
                {tournament.host_username && (
                  <Badge variant="secondary" className="flex items-center gap-2">
                    {tournament.host_avatar_url ? (
                      <img 
                        src={tournament.host_avatar_url} 
                        alt={tournament.host_username}
                        className="w-4 h-4 rounded-full"
                      />
                    ) : (
                      <Users className="w-4 h-4" />
                    )}
                    {tournament.host_username}
                  </Badge>
                )}
                {isParticipant && (
                  <Badge variant="default" className="bg-green-500">
                    Participant
                  </Badge>
                )}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowDeleteDialog(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>


            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge variant="outline">
                {tournament.number_of_games || 0} jocuri
              </Badge>
              <Badge variant="outline">
                {tournament.number_of_participants || 0} participanți
              </Badge>
            </div>
          </div>
        </Card>
      </Link>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ești sigur?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune nu poate fi anulată. Turneul va fi șters definitiv.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 
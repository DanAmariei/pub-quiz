'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { PlayCircle } from "lucide-react"
import type { Quiz } from "@/types/database"
import { toast } from "sonner"
import { createGame } from "../_actions"
import { useRouter } from "next/navigation"

interface HostQuizFormProps {
  quizes: Quiz[]
  tournaments: Array<{
    id: string
    name: string
  }>
}

export default function HostQuizForm({ quizes, tournaments }: HostQuizFormProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlayCircle className="mr-2 h-4 w-4" />
          Host Quiz
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Creează Joc Nou</DialogTitle>
        </DialogHeader>
        <form 
          action={async (formData) => {
            const result = await createGame(formData)
            if (result.error) {
              toast.error(result.error)
              return
            }
            setOpen(false)
            router.push(`/games/${result.gameId}`)
          }}
          className="space-y-4 pt-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nume Joc</Label>
            <Input
              id="name"
              name="name"
              placeholder="ex: Quiz Night #1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quiz_id">Alege Quiz</Label>
            <Select name="quiz_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Selectează un quiz" />
              </SelectTrigger>
              <SelectContent>
                {quizes.map((quiz) => (
                  <SelectItem key={quiz.id} value={quiz.id}>
                    {quiz.title} ({quiz.category} - {
                      quiz.difficulty === 'easy' ? 'Ușor' : 
                      quiz.difficulty === 'medium' ? 'Mediu' : 'Dificil'
                    })
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tournament_id">Turneu (Opțional)</Label>
            <Select name="tournament_id">
              <SelectTrigger>
                <SelectValue placeholder="Selectează un turneu" />
              </SelectTrigger>
              <SelectContent>
                {tournaments.map((tournament) => (
                  <SelectItem key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Anulează
            </Button>
            <Button type="submit">
              Creează Joc
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
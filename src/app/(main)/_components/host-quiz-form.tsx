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
  const [selectedQuiz, setSelectedQuiz] = useState("")
  const [title, setTitle] = useState("")
  const [selectedTournament, setSelectedTournament] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.set('quiz_id', selectedQuiz)
    formData.set('name', title)
    formData.set('tournament_id', selectedTournament)

    const result = await createGame(formData)

    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    router.push(`/games/${result.gameId}`)
  }

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
          onSubmit={handleSubmit}
          className="space-y-4 pt-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nume Joc</Label>
            <Input
              id="name"
              name="name"
              placeholder="ex: Quiz Night #1"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quiz_id">Alege Quiz</Label>
            <Select
              value={selectedQuiz}
              onValueChange={setSelectedQuiz}
              required
            >
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
            <Select
              value={selectedTournament}
              onValueChange={setSelectedTournament}
            >
              <SelectTrigger>
                <SelectValue placeholder="Alege un turneu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Fără turneu</SelectItem>
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
            <Button type="submit" disabled={isLoading}>
              Creează Joc
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
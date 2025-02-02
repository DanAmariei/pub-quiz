'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { createGame } from "@/app/(main)/_actions"
import type { Quiz, Tournament } from "@/types/database"

interface CreateGameFormProps {
  quizzes: Quiz[]
  tournaments: Tournament[]
}

export default function CreateGameForm({ quizzes, tournaments }: CreateGameFormProps) {
  const [title, setTitle] = useState("")
  const [selectedQuiz, setSelectedQuiz] = useState("")
  const [selectedTournament, setSelectedTournament] = useState("none")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.set('name', title)
    formData.set('quiz_id', selectedQuiz)
    formData.set('tournament_id', selectedTournament === 'none' ? null : selectedTournament)

    const result = await createGame(formData)
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success("Joc creat cu succes!")
    router.push(`/games/${result.gameId}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Titlu
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Introdu titlul jocului"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="quiz" className="text-sm font-medium">
            Quiz
          </label>
          <Select
            value={selectedQuiz}
            onValueChange={setSelectedQuiz}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selectează un quiz" />
            </SelectTrigger>
            <SelectContent>
              {quizzes.map((quiz) => (
                <SelectItem key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="tournament" className="text-sm font-medium">
            Turneu (opțional)
          </label>
          <Select
            value={selectedTournament}
            onValueChange={setSelectedTournament}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selectează un turneu" />
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
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Anulează
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Se creează..." : "Creează Joc"}
        </Button>
      </div>
    </form>
  )
} 
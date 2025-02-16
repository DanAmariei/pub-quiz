'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
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
  const [quizOpen, setQuizOpen] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.set('name', title)
    formData.set('quiz_id', selectedQuiz)
    
    // Adăugăm tournament_id doar dacă este selectat un turneu
    if (selectedTournament !== 'none') {
      formData.set('tournament_id', selectedTournament)
    }

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
          <label className="text-sm font-medium">
            Quiz
          </label>
          <Popover open={quizOpen} onOpenChange={setQuizOpen}>
            <div className="relative w-full">
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={quizOpen}
                  className="w-full justify-between rounded-md"
                >
                  {selectedQuiz
                    ? quizzes.find((quiz) => quiz.id === selectedQuiz)?.title
                    : "Selectează un quiz..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Caută quiz..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>Nu am găsit niciun quiz.</CommandEmpty>
                    <CommandGroup>
                      {quizzes.map((quiz) => (
                        <CommandItem
                          key={quiz.id}
                          value={quiz.title}
                          onSelect={() => {
                            setSelectedQuiz(quiz.id)
                            setQuizOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedQuiz === quiz.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {quiz.title}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </div>
          </Popover>
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
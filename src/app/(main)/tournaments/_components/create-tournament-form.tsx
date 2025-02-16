'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { createTournament } from "../../_actions"
import { Plus } from "lucide-react"
import { toast } from "sonner"

export default function CreateTournamentForm() {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    const result = await createTournament(formData)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success("Turneul a fost creat cu succes!")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Turneu Nou
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Creează Turneu Nou</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nume Turneu</Label>
            <Input
              id="name"
              name="name"
              placeholder="ex: Campionatul de Iarnă 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descriere</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Descriere despre turneu, reguli, premii etc."
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Anulează
            </Button>
            <Button type="submit">
              Creează Turneu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
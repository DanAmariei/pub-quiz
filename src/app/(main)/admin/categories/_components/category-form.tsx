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
import { createCategory, updateCategory } from "../_actions"

interface CategoryFormProps {
  children: React.ReactNode
  category?: {
    id: string
    name: string
    description: string
  }
}

export default function CategoryForm({ children, category }: CategoryFormProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string>()

  async function handleSubmit(formData: FormData) {
    const result = category 
      ? await updateCategory(category.id, formData)
      : await createCategory(formData)

    if (result && result.error) {
      setError(result.error)
      return
    }

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? 'Editează Categoria' : 'Categorie Nouă'}
          </DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nume</Label>
            <Input
              id="name"
              name="name"
              defaultValue={category?.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descriere</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={category?.description}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Anulează
            </Button>
            <Button type="submit">
              {category ? 'Salvează' : 'Creează'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
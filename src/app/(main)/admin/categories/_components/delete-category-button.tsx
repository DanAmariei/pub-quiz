'use client'

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DeleteCategoryButtonProps {
  id: string
  name: string
}

export default function DeleteCategoryButton({ id, name }: DeleteCategoryButtonProps) {
  async function handleDelete(formData: FormData) {
    const response = await fetch('/api/categories/delete', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (data.error) {
      toast.error(data.error)
    } else {
      toast.success('Categoria a fost ștearsă cu succes!')
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="ghost" className="text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Șterge categoria
          </AlertDialogTitle>
          <AlertDialogDescription>
            Ești sigur că vrei să ștergi categoria &quot;{name}&quot;?
            Această acțiune nu poate fi anulată.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anulează</AlertDialogCancel>
          <form action={handleDelete}>
            <input type="hidden" name="id" value={id} />
            <AlertDialogAction type="submit" className="bg-destructive hover:bg-destructive/90">
              Șterge
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 
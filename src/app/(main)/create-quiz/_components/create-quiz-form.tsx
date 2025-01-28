'use client'

import { Button } from "@/components/ui/button"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function CreateQuizButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Se creează..." : "Creează Quiz"}
    </Button>
  )
} 
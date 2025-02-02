'use client'

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-center py-8", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
} 
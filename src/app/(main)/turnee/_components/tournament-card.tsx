'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Users } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import type { Tournament } from "@/types/database"

const statusColors = {
  upcoming: "bg-blue-500",
  active: "bg-green-500",
  completed: "bg-gray-500"
} as const

const statusLabels = {
  upcoming: "În curând",
  active: "Activ",
  completed: "Finalizat"
} as const

export default function TournamentCard({ tournament }: { tournament: Tournament }) {
  const router = useRouter()

  return (
    <Card 
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={() => router.push(`/turnee/${tournament.id}`)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">{tournament.name}</CardTitle>
        <Badge className={statusColors[tournament.status]}>
          {statusLabels[tournament.status]}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {tournament.description}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              {formatDate(tournament.start_date)}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {tournament.stages} etape
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
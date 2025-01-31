import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Ranking } from "@/types/database"

interface GameRankingsProps {
  rankings: Ranking[]
  title?: string
  className?: string
}

export default function GameRankings({ 
  rankings,
  title = "Clasament",
  className = ""
}: GameRankingsProps) {
  return (
    <Card className={`p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-4">
        {rankings.map((rank, index) => (
          <div 
            key={rank.participant_id}
            className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
          >
            <div className="flex items-center gap-3">
              <span className="font-medium w-6">
                {index + 1}.
              </span>
              <Avatar className="h-8 w-8">
                <AvatarImage src={rank.profiles.avatar_url || undefined} />
                <AvatarFallback>
                  {rank.profiles.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">
                {rank.profiles.username}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {rank.points}
              </span>
              <span className="text-sm text-muted-foreground">
                puncte
              </span>
            </div>
          </div>
        ))}

        {rankings.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            Se calculează rezultatele...
          </p>
        )}
      </div>
    </Card>
  )
} 
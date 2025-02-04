'use client'

import { Card } from "@/components/ui/card"
import ParticipantAvatars from "./participant-avatars"
import { useGameParticipants } from "../_hooks/use-game-participants"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface GameHeaderProps {
  gameId: string
  gameTitle?: string
  quizTitle: string
  currentQuestionNumber?: number
  totalQuestions: number
  isHost?: boolean
  isFinished?: boolean
}

export default function GameHeader({
  gameId,
  gameTitle,
  quizTitle,
  currentQuestionNumber,
  totalQuestions,
  isHost = false,
  isFinished = false,
}: GameHeaderProps) {
  const participants = useGameParticipants(gameId)

  return (
    <div className="space-y-2 w-full">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{quizTitle}</h1>
          {gameTitle && (
            <p className="text-muted-foreground">
              Joc: {gameTitle}
            </p>
          )}
          <p className="text-muted-foreground">
            <span className="font-medium">{participants.length}</span>
            {' '}{participants.length !== 1 ? 'participanți' : 'participant'} în acest joc
          </p>
          {participants.length > 0 && (
            <ParticipantAvatars participants={participants} />
          )}
        </div>
        {isFinished && (
          <Button variant="outline" asChild className="ml-auto">
            <Link href="/games" className="flex items-center gap-2 ml-auto">
              <ArrowLeft className="w-4 h-4" />
              Înapoi la jocuri
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
} 
'use client'

import { Card } from "@/components/ui/card"
import ParticipantAvatars from "./participant-avatars"
import { useGameParticipants } from "../_hooks/use-game-participants"

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
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{quizTitle}</h1>
          {gameTitle && (
            <p className="text-muted-foreground">
              Joc: {gameTitle}
            </p>
          )}
          <p className="text-muted-foreground">
            {isHost ? "Tu ești host-ul acestui joc" : "Tu ești participant"}
          </p>
          {participants.length > 0 && (
            <ParticipantAvatars participants={participants} />
          )}
        </div>

        {currentQuestionNumber !== undefined && !isFinished && (
          <Card className="px-4 py-2">
            <p className="text-sm font-medium">
              Întrebarea {currentQuestionNumber}/{totalQuestions}
            </p>
          </Card>
        )}
      </div>
    </div>
  )
} 
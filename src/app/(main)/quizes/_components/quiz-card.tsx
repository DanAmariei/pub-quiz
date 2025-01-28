'use client'

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import type { Quiz } from "@/types/database"

const difficultyColors = {
  easy: "bg-green-500",
  medium: "bg-yellow-500",
  hard: "bg-red-500"
} as const

interface QuizCardProps {
  quiz: Quiz
}

export default function QuizCard({ quiz }: QuizCardProps) {
  const router = useRouter()

  return (
    <Card 
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={() => router.push(`/quizes/${quiz.id}`)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">{quiz.name}</CardTitle>
        <Badge className={difficultyColors[quiz.difficulty]}>
          {quiz.difficulty === 'easy' ? 'Ușor' : 
           quiz.difficulty === 'medium' ? 'Mediu' : 'Dificil'}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Categorie: {quiz.category}
          </p>
          <p className="text-sm text-muted-foreground">
            Întrebări: {quiz.questions.questions.length}
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 
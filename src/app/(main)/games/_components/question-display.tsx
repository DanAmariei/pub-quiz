'use client'

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface QuestionDisplayProps {
  questionNumber?: number
  question: string
  answers: string[]
  selectedAnswer?: string
  onAnswerSelect?: (answer: string) => void
  isInteractive?: boolean
}

export default function QuestionDisplay({
  questionNumber,
  question,
  answers,
  selectedAnswer,
  onAnswerSelect,
  isInteractive = false
}: QuestionDisplayProps) {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          {questionNumber ? `Întrebarea ${questionNumber}` : 'Întrebare'}
        </h2>
        <p>{question}</p>
      </Card>

      <div 
        role="radiogroup" 
        aria-labelledby="question"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {answers.map((answer, index) => (
          <div
            key={index}
            onClick={() => isInteractive && onAnswerSelect?.(answer)}
            className={cn(
              "p-4 border rounded-lg transition-colors",
              isInteractive && "cursor-pointer",
              "bg-white hover:bg-gray-50",
              "dark:bg-gray-800 dark:hover:bg-gray-700",
              "border-gray-200 dark:border-gray-700",
              selectedAnswer === answer && "bg-accent border-primary"
            )}
          >
            <span className="text-gray-900 dark:text-gray-100">
              {answer}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
} 
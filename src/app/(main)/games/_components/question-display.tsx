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

// Array cu literele pentru variante
const ANSWER_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

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
              // Bază și border
              "border-gray-200 dark:border-gray-700",
              // Stare normală
              "bg-white dark:bg-gray-800",
              // Hover doar când e interactiv
              isInteractive && "hover:bg-green-50 dark:hover:bg-green-900/30",
              // Cursor pointer doar când e interactiv
              isInteractive ? "cursor-pointer" : "cursor-default",
              // Răspuns selectat
              selectedAnswer === answer && "bg-green-100 dark:bg-green-900 border-green-500",
              // Disabled state (când nu e interactiv)
              !isInteractive && "opacity-80"
            )}
          >
            <span className={cn(
              "text-gray-900 dark:text-gray-100",
              !isInteractive && "select-none"
            )}>
              <span className="font-semibold mr-2">{ANSWER_LETTERS[index]}.</span>
              {answer}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
} 
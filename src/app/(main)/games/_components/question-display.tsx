'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface QuestionDisplayProps {
  questionNumber?: number
  totalQuestions?: number
  question: string
  answers: string[]
  selectedAnswer?: string
  onAnswerSelect?: (answer: string) => void
  isInteractive?: boolean
  image?: string | null
  song?: string | null
  video?: string | null
}

// Array cu literele pentru variante
const ANSWER_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export default function QuestionDisplay({
  questionNumber,
  totalQuestions,
  question,
  answers,
  selectedAnswer,
  onAnswerSelect,
  isInteractive = false,
  image,
  song,
  video
}: QuestionDisplayProps) {
  return (
    <div className="space-y-4">
      <Card className="p-6 relative">
        {questionNumber && totalQuestions && (
          <Badge 
            variant="secondary" 
            className="absolute top-4 right-4"
          >
            {questionNumber}/{totalQuestions}
          </Badge>
        )}
        <p className="font-semibold mb-4">
          {questionNumber ? `Întrebarea ${questionNumber}` : 'Întrebare'}
        </p>
        <h2 className="text-xl font-semibold mb-4">{question}</h2>

        {image && (
          <div className="mt-4 relative aspect-video w-full overflow-hidden rounded-lg">
            <img
              src={image}
              alt="Question image"
              className="object-cover w-full h-full"
            />
          </div>
        )}

        {song && (
          <div className="mt-4 w-full">
            <audio 
              controls 
              className="w-full"
              key={`audio-${question}`}
            >
              <source src={song} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {video && (
          <div className="mt-4 relative aspect-video w-full overflow-hidden rounded-lg">
            <video 
              controls 
              playsInline 
              controlsList="nodownload nofullscreen"
              className="w-full"
            >
              <source src={video} type="video/mp4" />
              Your browser does not support the video element.
            </video>
          </div>
        )}
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
              "border-gray-200 dark:border-gray-700",
              "bg-white dark:bg-gray-800",
              "border-gray-200 dark:border-gray-700",
              // Toate stările folosesc exact aceeași culoare
              isInteractive && "hover:bg-green-100 dark:hover:bg-green-900",
              isInteractive ? "cursor-pointer" : "cursor-default",
              selectedAnswer === answer && "bg-green-100 dark:bg-green-900 border-green-500",
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
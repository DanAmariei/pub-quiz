'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { updateQuiz } from "../_actions"
import { Card } from "@/components/ui/card"
import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Category {
  id: string
  name: string
}

interface Question {
  id: string
  question: string
  correct_answer: string
  incorrect_answers: string[]
  category: Category
  difficulty: 'easy' | 'medium' | 'hard'
}

interface Quiz {
  id: string
  title: string
  description: string
  questions: Array<{
    question: Question
  }>
}

export default function EditQuizForm({ 
  quiz,
  categories 
}: { 
  quiz: Quiz
  categories: Category[]
}) {
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [questions, setQuestions] = useState(quiz.questions)

  const handleQuestionUpdate = (questionId: string, updates: Partial<Question>) => {
    setQuestions(prevQuestions => 
      prevQuestions.map(q => 
        q.question.id === questionId 
          ? { question: { ...q.question, ...updates } }
          : q
      )
    )
  }

  return (
    <form 
      action={async (formData) => {
        questions.forEach(({ question }) => {
          console.log('Question ID:', question.id)
          formData.append(`question-${question.id}`, question.question)
          formData.append(`correct-${question.id}`, question.correct_answer)
          question.incorrect_answers.forEach((answer, index) => {
            formData.append(`incorrect-${question.id}-${index}`, answer)
          })
          formData.append(`difficulty-${question.id}`, question.difficulty)
        })

        const result = await updateQuiz(quiz.id, formData)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success("Quiz-ul a fost actualizat cu succes!")
          setEditingQuestion(null)
        }
      }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Nume Quiz</Label>
        <Input
          id="name"
          name="name"
          defaultValue={quiz.title}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descriere</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={quiz.description}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Categorie</Label>
        <Select 
          name="category" 
          defaultValue={quiz.questions[0]?.question.category.id}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selectează o categorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label>Întrebări</Label>
        {questions.map(({ question }, index) => (
          <Card key={question.id} className="p-4">
            {editingQuestion === question.id ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Întrebare</Label>
                  <Input
                    value={question.question}
                    onChange={(e) => handleQuestionUpdate(question.id, { question: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Răspuns Corect</Label>
                  <Input
                    value={question.correct_answer}
                    onChange={(e) => handleQuestionUpdate(question.id, { correct_answer: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Răspunsuri Incorecte</Label>
                  {question.incorrect_answers.map((answer, i) => (
                    <Input
                      key={i}
                      value={answer}
                      onChange={(e) => {
                        const newIncorrectAnswers = [...question.incorrect_answers]
                        newIncorrectAnswers[i] = e.target.value
                        handleQuestionUpdate(question.id, { incorrect_answers: newIncorrectAnswers })
                      }}
                      required
                    />
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Dificultate</Label>
                  <RadioGroup 
                    value={question.difficulty}
                    onValueChange={(value) => handleQuestionUpdate(question.id, { 
                      difficulty: value as 'easy' | 'medium' | 'hard' 
                    })}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="easy" id={`easy-${question.id}`} />
                      <Label htmlFor={`easy-${question.id}`}>Ușor</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id={`medium-${question.id}`} />
                      <Label htmlFor={`medium-${question.id}`}>Mediu</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hard" id={`hard-${question.id}`} />
                      <Label htmlFor={`hard-${question.id}`}>Dificil</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button 
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                >
                  Salvează Întrebarea
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {index + 1}. {question.question}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Răspuns corect: {question.correct_answer}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setEditingQuestion(question.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          Salvează Modificările
        </Button>
      </div>
    </form>
  )
} 
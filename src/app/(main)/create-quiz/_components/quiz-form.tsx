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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import TemplateButton from "./template-button"
import { CreateQuizButton } from "./create-quiz-form"

interface Category {
  id: string
  name: string
  description?: string
}

export default function QuizForm({ 
  createQuiz, 
  categories 
}: { 
  createQuiz: any,
  categories: Category[]
}) {
  return (
    <form 
      action={async (formData) => {
        const result = await createQuiz(formData)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success("Quiz-ul a fost creat cu succes!")
          // Reset form
          const form = document.querySelector('form') as HTMLFormElement
          form.reset()
          // Reset textarea
          const textarea = document.getElementById('questions') as HTMLTextAreaElement
          textarea.value = ''
        }
      }} 
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Nume Quiz</Label>
        <Input
          id="name"
          name="name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descriere</Label>
        <Textarea
          id="description"
          name="description"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Categorie</Label>
        <Select name="category" required>
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

      <div className="space-y-2">
        <Label>Dificultate</Label>
        <RadioGroup name="difficulty" className="flex gap-4" defaultValue="medium">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="easy" id="easy" />
            <Label htmlFor="easy">Ușor</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="medium" />
            <Label htmlFor="medium">Mediu</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hard" id="hard" />
            <Label htmlFor="hard">Dificil</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="questions">Întrebări (Format JSON)</Label>
        <div className="space-y-2">
          <TemplateButton />
          <Textarea
            id="questions"
            name="questions"
            className="font-mono h-[400px]"
            placeholder="Adaugă întrebările în format JSON..."
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <CreateQuizButton />
      </div>
    </form>
  )
} 
import { getProfile } from "@/utils/get-profile"
import { createClient } from "@/utils/supabase/server"
import { notFound, redirect } from "next/navigation"
import EditQuizForm from "./_components/edit-quiz-form"

export default async function EditQuizPage({
  params: { id }
}: {
  params: { id: string }
}) {
  const { profile } = await getProfile() || {}
  
  if (!profile?.is_host && !profile?.is_admin) {
    redirect('/')
  }

  const supabase = createClient()
  
  // Preluăm quiz-ul cu întrebările și categoria
  const { data: quiz } = await supabase
    .from('quizzes')
    .select(`
      *,
      questions:quiz_questions(
        order,
        question:questions(
          *,
          category:categories(*)
        )
      )
    `)
    .eq('id', id)
    .single()

  if (!quiz) {
    notFound()
  }

  // Sortăm întrebările după order înainte de a le trimite la EditQuizForm
  if (quiz.questions) {
    quiz.questions = quiz.questions.sort((a: any, b: any) => a.order - b.order)
  }

  // Preluăm toate categoriile pentru dropdown
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <main className="flex-1 container py-8">
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Editare Quiz</h1>
          <p className="text-muted-foreground">
            Modifică detaliile quiz-ului și întrebările
          </p>
        </div>

        <EditQuizForm 
          quiz={quiz} 
          categories={categories || []} 
        />
      </div>
    </main>
  )
} 
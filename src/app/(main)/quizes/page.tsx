import { getProfile } from "@/utils/get-profile"
import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus, Pencil } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import DeleteQuizButton from "./_components/delete-quiz-button"

export default async function QuizesPage() {
  const { profile } = await getProfile() || {}
  const canManageQuizes = profile?.is_host || profile?.is_admin

  const supabase = createClient()
  const { data: quizes } = await supabase
    .from('quizzes')
    .select(`
      *,
      questions:quiz_questions(
        question:questions(
          category:categories(name)
        )
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <main className="flex-1 container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Quiz-uri</h1>
            <p className="text-muted-foreground">
              Administrează quiz-urile disponibile
            </p>
          </div>
          {canManageQuizes && (
            <Button asChild>
              <Link href="/create-quiz">
                <Plus className="w-4 h-4 mr-2" />
                Quiz Nou
              </Link>
            </Button>
          )}
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titlu</TableHead>
                <TableHead>Descriere</TableHead>
                <TableHead>Întrebări</TableHead>
                <TableHead>Creat</TableHead>
                <TableHead>Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizes?.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">
                    {quiz.title}
                  </TableCell>
                  <TableCell>{quiz.description}</TableCell>
                  <TableCell>{quiz.questions?.length || 0}</TableCell>
                  <TableCell>{formatDate(quiz.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="ghost" asChild>
                        <Link href={`/quizes/${quiz.id}`}>
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </Button>
                      <DeleteQuizButton id={quiz.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!quizes || quizes.length === 0) && (
                <TableRow>
                  <TableCell 
                    colSpan={5} 
                    className="text-center text-muted-foreground h-24"
                  >
                    Nu există quiz-uri încă
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  )
} 
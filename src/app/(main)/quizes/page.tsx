import { getProfile } from "@/utils/get-profile"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Search } from "lucide-react"
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"

const ITEMS_PER_PAGE = 10

export default async function QuizesPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string }
}) {
  const { profile } = await getProfile() || {}
  const canManageQuizes = profile?.is_host || profile?.is_admin

  const currentPage = Number(searchParams.page) || 1
  const searchQuery = searchParams.search || ''
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  const supabase = createClient()

  // Query de bază cu search
  let query = supabase
    .from('quizzes')
    .select('*', { count: 'exact' })

  // Adăugăm filtrul de căutare dacă există
  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`)
  }

  // Obținem numărul total de quiz-uri pentru paginare
  const { count } = await query

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE)

  // Obținem quiz-urile pentru pagina curentă
  let quizQuery = supabase
    .from('quizzes')
    .select(`
      *,
      questions:quiz_questions(count)
    `)

  // Aplicăm același filtru de căutare
  if (searchQuery) {
    quizQuery = quizQuery.ilike('title', `%${searchQuery}%`)
  }

  const { data: quizes } = await quizQuery
    .range(offset, offset + ITEMS_PER_PAGE - 1)
    .order('created_at', { ascending: false })

  return (
    <main className="flex-1 container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Quiz-uri</h1>
            <p className="text-muted-foreground">
              Gestionează quiz-urile disponibile
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

        {/* Adăugăm câmpul de căutare */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <form>
              <Input
                placeholder="Caută după titlu..."
                name="search"
                defaultValue={searchQuery}
                className="pl-8"
              />
            </form>
          </div>
          {searchQuery && (
            <Button variant="ghost" asChild>
              <Link href="/quizes">
                Resetează
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

        <Pagination className="mt-4">
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious 
                  href={`/quizes?page=${currentPage - 1}${searchQuery ? `&search=${searchQuery}` : ''}`} 
                />
              </PaginationItem>
            )}

            {/* Prima pagină */}
            {currentPage > 2 && (
              <PaginationItem>
                <PaginationLink href={`/quizes?page=1${searchQuery ? `&search=${searchQuery}` : ''}`}>
                  1
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Ellipsis pentru paginile din stânga */}
            {currentPage > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Pagina anterioară */}
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationLink href={`/quizes?page=${currentPage - 1}${searchQuery ? `&search=${searchQuery}` : ''}`}>
                  {currentPage - 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Pagina curentă */}
            <PaginationItem>
              <PaginationLink href={`/quizes?page=${currentPage}${searchQuery ? `&search=${searchQuery}` : ''}`} isActive>
                {currentPage}
              </PaginationLink>
            </PaginationItem>

            {/* Pagina următoare */}
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationLink href={`/quizes?page=${currentPage + 1}${searchQuery ? `&search=${searchQuery}` : ''}`}>
                  {currentPage + 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Ellipsis pentru paginile din dreapta */}
            {currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Ultima pagină */}
            {currentPage < totalPages - 1 && (
              <PaginationItem>
                <PaginationLink href={`/quizes?page=${totalPages}${searchQuery ? `&search=${searchQuery}` : ''}`}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}

            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext 
                  href={`/quizes?page=${currentPage + 1}${searchQuery ? `&search=${searchQuery}` : ''}`} 
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>

        {quizes?.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            {searchQuery ? (
              <p>Nu s-au găsit quiz-uri pentru căutarea "{searchQuery}"</p>
            ) : (
              <p>Nu există quiz-uri disponibile</p>
            )}
          </div>
        )}
      </div>
    </main>
  )
} 
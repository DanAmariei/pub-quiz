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
import { Badge } from "@/components/ui/badge"
import DeleteSessionButton from "./_components/delete-session-button"

export default async function SessionsPage() {
  const { profile } = await getProfile() || {}
  const canManageSessions = profile?.is_host || profile?.is_admin

  const supabase = createClient()
  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      *,
      quiz:quizzes(
        title,
        questions:quiz_questions(
          question:questions(*)
        )
      ),
      host:profiles(name)
    `)
    .order('created_at', { ascending: false })

  return (
    <main className="flex-1 container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Sesiuni</h1>
            <p className="text-muted-foreground">
              Gestionează sesiunile de quiz
            </p>
          </div>
          {canManageSessions && (
            <Button asChild>
              <Link href="/sessions/create">
                <Plus className="w-4 h-4 mr-2" />
                Sesiune Nouă
              </Link>
            </Button>
          )}
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cod</TableHead>
                <TableHead>Quiz</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Participanți</TableHead>
                <TableHead>Creat</TableHead>
                <TableHead>Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions?.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-mono font-medium">
                    {session.code}
                  </TableCell>
                  <TableCell>{session.quiz?.title}</TableCell>
                  <TableCell>{session.host?.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={session.status === 'active' ? 'default' : 'secondary'}
                    >
                      {session.status === 'active' ? 'Activă' : 'Închisă'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {session.participants_count || 0}
                  </TableCell>
                  <TableCell>
                    {formatDate(session.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="ghost" asChild>
                        <Link href={`/sessions/${session.id}`}>
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </Button>
                      <DeleteSessionButton id={session.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!sessions || sessions.length === 0) && (
                <TableRow>
                  <TableCell 
                    colSpan={7} 
                    className="text-center text-muted-foreground h-24"
                  >
                    Nu există sesiuni încă
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
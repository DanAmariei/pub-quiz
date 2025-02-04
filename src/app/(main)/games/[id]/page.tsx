import { getProfile } from "@/utils/get-profile"
import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import GameHost from "../_components/game-host"
import GameParticipant from "../_components/game-participant"

export default async function GamePage({
  params: { id }
}: {
  params: { id: string }
}) {
  const { user, profile } = await getProfile() || {}
  if (!user) return null

  const supabase = createClient()
  
  const { data: game, error } = await supabase
    .from('games')
    .select(`
      id,
      host_id,
      quiz_id,
      active_question_id,
      is_finished,
      created_at,
      title,
      quiz:quizzes(
        id,
        title,
        questions:quiz_questions(
          question:questions(
            id,
            question,
            correct_answer,
            incorrect_answers
          ),
          answers_order
        )
      )
    `)
    .eq('id', id)
    .single()

  if (!game || error) {
    console.log('Game not found or error:', { id, error })
    notFound()
  }

  const isHost = game.host_id === user.id
  
  // Verificăm dacă utilizatorul este deja participant
  const { data: participant } = await supabase
    .from('game_participants')
    .select('*')
    .eq('game_id', id)
    .eq('participant_id', user.id)
    .maybeSingle()

  const isParticipant = !!participant

  if (isHost) {
    return <GameHost game={game} user={user} />
  }

  return <GameParticipant 
    game={game} 
    user={user} 
    isParticipant={isParticipant}
  />
} 
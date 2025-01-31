'use server'

import { getProfile } from "@/utils/get-profile"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"


export async function createTournament(formData: FormData) {
  const { user, profile } = await getProfile() || {}
  
  if (!user || (!profile?.is_host && !profile?.is_admin)) {
    return { error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const start_date = formData.get('start_date') as string
  const stages = parseInt(formData.get('stages') as string)

  const supabase = createClient()
  
  const { error } = await supabase
    .from('tournaments')
    .insert({
      name,
      description,
      start_date,
      stages,
      status: 'upcoming',
      created_by: user.id
    })

  if (error) {
    console.error('Error creating tournament:', error)
    return { error: error.message }
  }

  revalidatePath('/tournaments')
  return { success: true }
}

export async function startQuizGame(formData: FormData) {
  const { user, profile } = await getProfile() || {}
  
  if (!user || (!profile?.is_host && !profile?.is_admin)) {
    return { error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const quizId = formData.get('quiz_id') as string
  const tournamentId = formData.get('tournament_id') as string || null

  const supabase = createClient()
  
  try {
    // Creăm jocul nou
    const { data: game, error } = await supabase
      .from('games')
      .insert({
        host_id: user.id,
        quiz_id: quizId,
        tournament_id: tournamentId,
        is_finished: false,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    revalidatePath('/games')
    return { success: true, gameId: game.id }
  } catch (error) {
    console.error('Error creating game:', error)
    return { error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

export async function createGame(formData: FormData) {
  const { user } = await getProfile() || {}
  if (!user) return { error: 'Unauthorized' }

  const supabase = createClient()

  try {
    const { data: game, error } = await supabase
      .from('games')
      .insert({
        quiz_id: formData.get('quiz_id'),
        host_id: user.id,
        title: formData.get('name')
      })
      .select('id')
      .single()

    if (error) {
      throw new Error(`Error creating game: ${error.message}`)
    }

    revalidatePath('/games')
    return { gameId: game.id }
    
  } catch (error) {
    console.error('Error:', error)
    return { error: error instanceof Error ? error.message : 'An error occurred' }
  }
} 
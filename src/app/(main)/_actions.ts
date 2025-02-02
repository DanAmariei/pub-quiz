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
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data: game, error: gameError } = await supabase
    .from('games')
    .insert({
      host_id: user.id,
      quiz_id: formData.get('quiz_id'),
      title: formData.get('name'),
      tournament_id: formData.get('tournament_id') === 'none' ? null : formData.get('tournament_id')
    })
    .select()
    .single()

  if (gameError) {
    return { error: 'Error creating game' }
  }

  revalidatePath('/')
  revalidatePath('/games')
  revalidatePath('/my-games')

  return { gameId: game.id }
}

export async function deleteGame(gameId: string) {
  const { user } = await getProfile() || {}
  if (!user) return { error: 'Unauthorized' }

  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', gameId)
      .eq('host_id', user.id) // Ne asigurăm că doar host-ul poate șterge jocul

    if (error) {
      throw new Error(`Error deleting game: ${error.message}`)
    }

    revalidatePath('/my-games')
    return { success: true }
    
  } catch (error) {
    console.error('Error:', error)
    return { error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

export async function deleteTournament(tournamentId: string) {
  const { user } = await getProfile() || {}
  if (!user) return { error: 'Unauthorized' }

  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', tournamentId)
      .eq('created_by', user.id) // Ne asigurăm că doar creatorul poate șterge turneul

    if (error) {
      throw new Error(`Error deleting tournament: ${error.message}`)
    }

    revalidatePath('/tournaments')
    return { success: true }
    
  } catch (error) {
    console.error('Error:', error)
    return { error: error instanceof Error ? error.message : 'An error occurred' }
  }
} 
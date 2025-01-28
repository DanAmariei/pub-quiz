'use server'

import { getProfile } from "@/utils/get-profile"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function startQuizSession(formData: FormData) {
  const { user, profile } = await getProfile() || {}
  
  if (!user || (!profile?.is_host && !profile?.is_admin)) {
    return { error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const quizId = formData.get('quiz_id') as string
  const tournamentId = formData.get('tournament_id') as string

  const supabase = createClient()
  
  const { error } = await supabase
    .from('quiz_sessions')
    .insert({
      name,
      quiz_id: quizId,
      tournament_id: tournamentId || null,
      host_id: user.id,
      status: 'waiting' // waiting, active, completed
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

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
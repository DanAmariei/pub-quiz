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
  const startDate = formData.get('start_date') as string
  const stages = parseInt(formData.get('stages') as string)

  const supabase = createClient()
  
  const { error } = await supabase
    .from('tournaments')
    .insert({
      name,
      start_date: startDate,
      stages,
      created_by: user.id,
      status: 'upcoming'
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/tournaments')
  revalidatePath('/my-tournaments')
} 
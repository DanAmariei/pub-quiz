'use server'

import { getProfile } from "@/utils/get-profile"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteSession(id: string) {
  const { user, profile } = await getProfile() || {}
  
  if (!user || (!profile?.is_host && !profile?.is_admin)) {
    return { error: 'Unauthorized' }
  }

  const supabase = createClient()
  
  try {
    // Ștergem sesiunea
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Error deleting session: ${error.message}`)
    }

    revalidatePath('/sessions')
    return { success: true }
    
  } catch (error) {
    console.error('Error:', error)
    return { error: error instanceof Error ? error.message : 'An error occurred' }
  }
} 
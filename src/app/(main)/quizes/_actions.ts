'use server'

import { getProfile } from "@/utils/get-profile"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteQuiz(id: string) {
  const { user, profile } = await getProfile() || {}
  
  if (!user || (!profile?.is_host && !profile?.is_admin)) {
    return { error: 'Unauthorized' }
  }

  const supabase = createClient()
  
  try {
    // Mai întâi ștergem relațiile din quiz_questions
    const { error: relationsError } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('quiz_id', id)

    if (relationsError) {
      throw new Error(`Error deleting quiz relations: ${relationsError.message}`)
    }

    // Apoi ștergem quiz-ul
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Error deleting quiz: ${error.message}`)
    }

    revalidatePath('/quizes')
    return { success: true }
    
  } catch (error) {
    console.error('Error:', error)
    return { error: error instanceof Error ? error.message : 'An error occurred' }
  }
} 
import { createClient } from "@/utils/supabase/client"
import type { Profile } from "@/types/database"

export async function getProfileClient() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    user,
    profile,
  }
} 
'use server'

import { getProfile } from "@/utils/get-profile"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCategory(formData: FormData) {
  const { user, profile } = await getProfile() || {}
  
  if (!user || (!profile?.is_host && !profile?.is_admin)) {
    return { error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  const supabase = createClient()
  
  const { error } = await supabase
    .from('categories')
    .insert({ name, description })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
}

export async function updateCategory(id: string, formData: FormData) {
  const { user, profile } = await getProfile() || {}
  
  if (!user || (!profile?.is_host && !profile?.is_admin)) {
    return { error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  const supabase = createClient()
  
  const { error } = await supabase
    .from('categories')
    .update({ name, description })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
} 
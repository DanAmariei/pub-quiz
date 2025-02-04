import { createClient } from "@/utils/supabase/server"
import { getProfile } from "@/utils/get-profile"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  const { profile } = await getProfile() || {}
  
  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const id = formData.get('id') as string
  const supabase = createClient()
  
  // Verificăm dacă categoria este folosită în întrebări
  const { data: questions } = await supabase
    .from('questions')
    .select('id')
    .eq('category_id', id)
    .limit(1)

  if (questions && questions.length > 0) {
    return NextResponse.json({ 
      error: 'Această categorie nu poate fi ștearsă deoarece există întrebări asociate.' 
    })
  }
  
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message })
  }

  revalidatePath('/admin/categories')
  return NextResponse.json({ success: true })
} 
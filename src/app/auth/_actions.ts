import { createClient } from "@/utils/supabase/client"

export async function signUp(formData: FormData) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${baseUrl}/auth/callback`,
      // Adăugăm data pentru a crea profilul imediat
      data: {
        username: email.split('@')[0],
        full_name: '',
        avatar_url: '',
        is_host: false,
        is_admin: false
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  // Autentificăm utilizatorul imediat după creare
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (signInError) {
    return { error: signInError.message }
  }

  return { success: true }
} 
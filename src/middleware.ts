import { createClient } from '@/utils/supabase/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request);

    // Verifică dacă utilizatorul este autentificat
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Verifică dacă ruta curentă este login sau register
    const isAuthPage = request.nextUrl.pathname === '/login' || 
                      request.nextUrl.pathname === '/register';

    if (user && isAuthPage) {
      // Dacă utilizatorul este autentificat și încearcă să acceseze login/register
      // îl redirecționăm la pagina principală
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (user) {
      // Verifică dacă există un profil pentru acest utilizator
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Dacă nu există profil, creează unul nou
      if (!profile) {
        const { error } = await supabase.from('profiles').insert({
          id: user.id,
          username: user.email?.split('@')[0],
          full_name: '',
          avatar_url: '',
          is_host: false,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });

        if (error) {
          console.error('Error creating profile:', error);
        }
      }
    }

    return response;
  } catch (e) {
    // În caz de eroare, permitem cererii să continue
    return NextResponse.next();
  }
}

// Specifică pe ce rute să ruleze middleware-ul
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    '/login',
    '/register',
  ],
};

'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { cn } from "@/utils/cn"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { ModeToggle } from "./mode-toggle"
import { signOut } from "@/app/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Lock, User } from "lucide-react"

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isHost, setIsHost] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [username, setUsername] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url, is_host, is_admin')
          .eq('id', user.id)
          .single()

        if (profile) {
          setUsername(profile.username || user.email?.split('@')[0] || '')
          setAvatarUrl(profile.avatar_url || '')
          setIsHost(profile.is_host)
          setIsAdmin(profile.is_admin)
        }
      }
    }

    getProfile()
  }, [])

  const links = [
    { href: "/", label: "Acasă" },
    { href: "/games", label: "Jocuri" },
    // Afișăm link-ul Quiz-uri doar pentru host sau admin
    ...(isHost || isAdmin ? [{ href: "/quizes", label: "Quiz-uri" }] : []),
    ...(isHost || isAdmin ? [{ href: "/tournaments", label: "Turnee" }] : []),
  ]

  return (
    <header className="w-full">
      <div className="container p-4 sm:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Lock />
          <h5 className="mt-0.5">Quizmasters Hub</h5>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className="text-sm font-medium transition-colors hover:text-primary"
              aria-label={`Navigare către pagina ${link.label}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm font-medium hidden sm:block">
                {username}
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Contul meu</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      Profil
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/my-games" className="cursor-pointer">
                      Jocurile Mele
                    </Link>
                  </DropdownMenuItem>

                  {isHost && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/create-quiz" className="cursor-pointer">
                          Crează Quiz
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {(isHost || isAdmin) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin/categories" className="cursor-pointer">
                          Administrare Categorii
                        </Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin/import-quizzes" className="cursor-pointer">
                            Import Quiz-uri
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="p-0" asChild>
                    <form action={signOut}>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-sm w-full"
                        type="submit"
                      >
                        Deconectare
                      </Button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            </>
          )}

          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

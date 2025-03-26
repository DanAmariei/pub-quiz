'use client'

import { useEffect, useState } from "react"
import { getProfileClient } from "@/utils/get-profile-client"
import { cn } from "@/utils/cn"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
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
import type { Profile } from "@/types/database"

export default function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      const data = await getProfileClient()
      if (data?.profile) {
        setProfile(data.profile)
      }
    }

    loadProfile()
  }, [])

  const links = [
    { href: "/", label: "Acasă" },
    { href: "/games", label: "Jocuri" },
    // Afișăm link-ul Quiz-uri doar pentru host sau admin
    ...(profile?.is_host || profile?.is_admin ? [{ href: "/quizes", label: "Quiz-uri" }] : []),
    { href: "/tournaments", label: "Turnee" },
  ]

  const handleSignOut = async () => {
    await signOut()
    setProfile(null)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="w-full">
      <div className="container p-4 sm:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
         
          <h5 className="mt-0.5">www.quizmasters.app</h5>
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
          {profile ? (
            <>
              <span className="text-sm font-medium hidden sm:block">
                {profile.username}
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.username || ''}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="cursor-pointer">
                      Contul meu
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/games" className="cursor-pointer">
                      Jocuri
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/my-games" className="cursor-pointer">
                      Jocurile Mele
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/tournaments" className="cursor-pointer">
                      Turnee
                    </Link>
                  </DropdownMenuItem>

                  {profile.is_host && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/create-quiz" className="cursor-pointer">
                          Crează Quiz
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {(profile.is_host || profile.is_admin) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin/categories" className="cursor-pointer">
                          Administrare Categorii
                        </Link>
                      </DropdownMenuItem>
                      {profile.is_admin && (
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
                    <form action={handleSignOut}>
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

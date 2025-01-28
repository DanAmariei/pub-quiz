import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";

import { signOut } from "@/app/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lock, User } from "lucide-react";
import { getProfile } from '@/utils/get-profile';

const Navbar = async () => {
  const { user, profile } = await getProfile() || {};

  return (
    <header className="w-full">
      <div className="container p-4 sm:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Lock />
          <h5 className="mt-0.5">Quizmasters Hub</h5>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/" 
            className="text-sm font-medium transition-colors hover:text-primary"
            aria-label="Navigare către pagina principală"
          >
            Home
          </Link>
          <Link 
            href="/quizes" 
            className="text-sm font-medium transition-colors hover:text-primary"
            aria-label="Navigare către pagina de quizuri"
          >
            Quizes
          </Link>
          <Link 
            href="/games" 
            className="text-sm font-medium transition-colors hover:text-primary"
            aria-label="Navigare către pagina de games"
          >
            Games
          </Link>
          <Link 
            href="/tournaments" 
            className="text-sm font-medium transition-colors hover:text-primary"
            aria-label="Navigare către pagina de turnee"
          >
            Turnee
          </Link>
          <Link 
            href="/links" 
            className="text-sm font-medium transition-colors hover:text-primary"
            aria-label="Navigare către pagina de linkuri"
          >
            Link-uri
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm font-medium hidden sm:block">
                {profile?.username || user.email?.split('@')[0]}
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.username || "Avatar utilizator"}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent sideOffset={5}>
                  <DropdownMenuLabel>
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link 
                      href="/account" 
                      className="cursor-pointer w-full"
                      aria-label="Navigare către pagina contului meu"
                    >
                      Contul Meu
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link 
                      href="/my-games" 
                      className="cursor-pointer w-full"
                      aria-label="Navigare către jocurile mele"
                    >
                      Jocurile Mele
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link 
                      href="/my-tournaments" 
                      className="cursor-pointer w-full"
                      aria-label="Navigare către turneele mele"
                    >
                      Turneele Mele
                    </Link>
                  </DropdownMenuItem>

                  {profile?.is_host && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link 
                          href="/create-quiz" 
                          className="cursor-pointer w-full"
                          aria-label="Crează un quiz nou"
                        >
                          Crează Quiz
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {(profile?.is_host || profile?.is_admin) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link 
                          href="/admin/categories" 
                          className="cursor-pointer w-full"
                          aria-label="Administrare categorii"
                        >
                          Administrare Categorii
                        </Link>
                      </DropdownMenuItem>
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
  );
};

export default Navbar;

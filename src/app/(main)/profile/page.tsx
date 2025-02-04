import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/utils/supabase/server"
import Image from "next/image"
import { cn } from "@/utils/cn"

const ProfilePage = async () => {
  const supabase = createClient()
  
  // Fetch data
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_host, avatar_url, username, created_at, games_played, high_score')
    .eq('id', user?.id)
    .single()

  // Game statistics
  const { count: gamesPlayed } = await supabase
    .from('game_participants')
    .select('*', { count: 'exact' })
    .eq('user_id', user?.id)

  const { data: highScoreData } = await supabase
    .from('game_participants')
    .select('score')
    .eq('user_id', user?.id)
    .order('score', { ascending: false })
    .limit(1)
    .single()

  console.log('User Metadata:', user?.user_metadata)

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profilul meu</h1>
          <Button variant="outline" asChild>
            <Link 
              href="/account" 
              className="transition-all hover:scale-[1.02] active:scale-95"
            >
              Editează profil
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Avatar and Stats */}
          <div className="md:col-span-1 space-y-8">
            <div className="bg-card p-6 rounded-xl shadow-sm border transition-all hover:shadow-md">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="p-0 rounded-full hover:bg-accent/50 transition-all duration-300 w-full group"
                  >
                    <div className="relative w-full aspect-square">
                      <Image
                        src={profile?.avatar_url || '/default-avatar.png'}
                        alt="Avatar utilizator"
                        fill
                        className={cn(
                          "rounded-full object-cover border-4 border-primary",
                          "transition-transform duration-300 group-hover:scale-105"
                        )}
                        sizes="(max-width: 768px) 100vw, 768px"
                      />
                    </div>
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-[95vw] max-h-[90vh]">
                  <div className="relative w-full h-[70vh]">
                    <Image
                      src={profile?.avatar_url || '/default-avatar.png'}
                      alt="Avatar mărit"
                      fill
                      className="object-contain rounded-lg"
                      sizes="100vw"
                    />
                  </div>
                </DialogContent>
              </Dialog>

              <div className="mt-6 space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg transition-colors hover:bg-muted/70">
                  <p className="text-sm text-muted-foreground">Membru din</p>
                  <p className="font-medium">
                    {new Date(profile?.created_at || '').toLocaleDateString('ro-RO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Account Details */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-card p-6 rounded-xl shadow-sm border transition-all hover:shadow-md">
              <h2 className="text-2xl font-semibold mb-6">Informații cont</h2>
              
              <dl className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b transition-colors hover:bg-muted/50">
                  <dt className="text-muted-foreground">Nume utilizator</dt>
                  <dd className="font-medium">{profile?.username || 'Nesetat'}</dd>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b transition-colors hover:bg-muted/50">
                  <dt className="text-muted-foreground">Adresă email</dt>
                  <dd className="font-medium">{user?.email}</dd>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b transition-colors hover:bg-muted/50">
                  <dt className="text-muted-foreground">Cont verificat</dt>
                  <dd className="font-medium">
                    {user?.email_confirmed_at ? 'Da' : 'Nu'}
                  </dd>
                </div>

                <div className="flex items-center justify-between py-2 border-b transition-colors hover:bg-muted/50">
                  <dt className="text-muted-foreground">Rol</dt>
                  <dd>
                    {true ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                        Host
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                        Participant
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Statistics Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-100/50 dark:bg-blue-900/20 p-4 rounded-lg transition-all hover:shadow-md">
                <p className="text-sm text-muted-foreground">Jocuri jucate</p>
                <p className="text-2xl font-bold mt-2">
                  {gamesPlayed ?? 0}
                </p>
              </div>
              <div className="bg-green-100/50 dark:bg-green-900/20 p-4 rounded-lg transition-all hover:shadow-md">
                <p className="text-sm text-muted-foreground">Punctaj maxim</p>
                <p className="text-2xl font-bold mt-2">
                  {highScoreData?.score ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

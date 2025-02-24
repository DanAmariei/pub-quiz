import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { revalidatePath } from "next/cache";
import { getProfile } from "@/utils/get-profile";
import { Pencil } from "lucide-react";
import EditProfileForm from "./_components/edit-profile-form";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function getStats(userId: string) {
  const supabase = createClient();

  const [hostedGames, participatedGames, hostedTournaments, participatedTournaments] = await Promise.all([
    supabase
      .from('games')
      .select('id', { count: 'exact' })
      .eq('host_id', userId),
    supabase
      .from('game_participants')
      .select('id', { count: 'exact' })
      .eq('participant_id', userId),
    supabase
      .from('tournaments')
      .select('id', { count: 'exact' })
      .eq('host_id', userId),
    supabase
      .from('tournament_participants')
      .select('id', { count: 'exact' })
      .eq('participant_id', userId)
  ]);

  return {
    hostedGames: hostedGames.count || 0,
    participatedGames: participatedGames.count || 0,
    hostedTournaments: hostedTournaments.count || 0,
    participatedTournaments: participatedTournaments.count || 0
  };
}

export default async function AccountPage() {
  const { user, profile } = await getProfile() || {};

  if (!user) {
    return (
      <main className="flex-1 container py-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Acces interzis</h1>
          <p className="text-muted-foreground">
            Trebuie să fii autentificat pentru a accesa această pagină.
          </p>
        </div>
      </main>
    );
  }

  const stats = await getStats(user.id);

  async function updateProfile(formData: FormData) {
    "use server";
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) return;

    const username = formData.get("username") as string;
    const fullName = formData.get("full_name") as string;
    const avatarUrl = formData.get("avatar_url") as string;

    await supabase
      .from("profiles")
      .update({
        username,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    revalidatePath("/account");
  }

  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="container py-8 w-full max-w-2xl">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-3xl font-bold">Contul Meu</h1>
            <p className="text-muted-foreground">
              Gestionează-ți informațiile personale
            </p>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex flex-col items-center gap-4 mb-6">
              <Avatar className="w-16 h-16">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>
                  {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-xl font-semibold">Informații Profil</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Detaliile contului tău
                </p>
              </div>
            </div>

            <div className="flex justify-center mb-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Pencil className="w-4 h-4 mr-2" />
                    Editează
                  </Button>
                </DialogTrigger>
                <EditProfileForm profile={profile} />
              </Dialog>
            </div>

            <div className="space-y-6">
              {/* Informații profil */}
              <div className="grid gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Username - nume echipă</p>
                  <p className="font-medium">{profile?.username || "Nesetat"}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-sm font-medium mb-4">Informații Cont</h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {user.email}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Cont creat:</span>{" "}
                    {new Date(user.created_at).toLocaleDateString("ro-RO")}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Rol:</span>{" "}
                    {profile?.is_admin 
                      ? "Administrator" 
                      : profile?.is_host 
                        ? "Host" 
                        : "Utilizator"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 
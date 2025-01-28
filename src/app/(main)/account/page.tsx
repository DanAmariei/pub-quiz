import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { revalidatePath } from "next/cache";
import { getProfile } from "@/utils/get-profile";
import { Pencil } from "lucide-react";
import EditProfileForm from "./_components/edit-profile-form";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

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
    <main className="flex-1 container py-8 flex justify-center">
      <div className="flex flex-col gap-6 w-full max-w-2xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Contul Meu</h1>
          <p className="text-muted-foreground">
            Gestionează-ți informațiile personale
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start gap-4">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar utilizator"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl font-semibold text-muted-foreground">
                    {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold">Informații Profil</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Detaliile contului tău
                </p>
              </div>
            </div>
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
                <p className="text-sm text-muted-foreground">Echipa</p>
                <p className="font-medium">{profile?.username || "Nesetat"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Leader</p>
                <p className="font-medium">{profile?.full_name || "Nesetat"}</p>
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
    </main>
  );
} 
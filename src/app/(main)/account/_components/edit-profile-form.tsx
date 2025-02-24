'use client';

import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { updateProfile } from "../_actions";
import type { Profile } from "@/types/database";

import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface EditProfileFormProps {
  profile: Profile | null;
}

export default function EditProfileForm({ profile }: EditProfileFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState(profile?.username || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.set("username", username);
    formData.set("full_name", fullName);
    formData.set("avatar_url", avatarUrl);

    const result = await updateProfile(formData);
    
    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Profilul a fost actualizat cu succes!");
    router.refresh();

    const { error } = await supabase.auth.updateUser({
      data: { is_host: true }
    });

    if (error) {
      console.error('Eroare la actualizarea metadatelor:', error.message);
    }
  };

  async function handleFileUpload(file: File) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Imaginea trebuie să fie mai mică de 5MB");
      return;
    }

    toast.loading("Se încarcă imaginea...");
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch(`/api/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Eroare la încărcarea imaginii')
      }

      const data = await response.json()
      setAvatarUrl(data.secure_url)
      toast.success('Imaginea a fost încărcată cu succes!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Eroare la încărcarea imaginii')
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Editează Profilul</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarUrl || ''} />
              <AvatarFallback>
                {profile?.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="space-y-2">
                <Label>Încarcă o imagine de profil</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      try {
                        await handleFileUpload(file)
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : 'Eroare la încărcare')
                      }
                    }
                  }}
                />
                <p className="text-sm text-muted-foreground">
                  Formate acceptate: JPG, JPEG, PNG, WEBP (max. 5MB)
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Nume Utilizator/Echipă</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </div>

        <SubmitButton />
      </form>
    </DialogContent>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Se salvează..." : "Salvează modificările"}
    </Button>
  );
} 
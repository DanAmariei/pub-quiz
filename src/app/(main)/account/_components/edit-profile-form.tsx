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
import { ImagePlus } from "lucide-react";
import { resizeImage } from "@/lib/image-utils";
import { createClient } from "@/utils/supabase/client";

interface EditProfileFormProps {
  profile: Profile | null;
}

export default function EditProfileForm({ profile }: EditProfileFormProps) {
  const [error, setError] = useState<string>();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Imaginea trebuie să fie mai mică de 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const compressionLevel = file.size > 2 * 1024 * 1024 ? 0.7 : 0.85;
      const resizedBlob = await resizeImage(file, compressionLevel);
      
      // Convertim blob-ul înapoi în File pentru upload
      const optimizedFile = new File([resizedBlob], file.name, {
        type: 'image/jpeg'
      });

      // Folosim clientul Supabase pentru upload
      const supabase = createClient();
      
      // Generăm un nume de fișier unic
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${profile?.id}/${fileName}`;

      // Ștergem avatarul vechi dacă există
      if (profile?.avatar_url) {
        try {
          const oldPath = profile.avatar_url.split('/').pop();
          if (oldPath) {
            await supabase.storage
              .from('avatars')
              .remove([`${profile.id}/${oldPath}`]);
          }
        } catch (err) {
          console.error('Error removing old avatar:', err);
          // Continuăm chiar dacă ștergerea vechiului avatar eșuează
        }
      }

      // Upload-ul noii imagini
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, optimizedFile, {
          cacheControl: '3600',
          upsert: true // Schimbăm la true pentru a suprascrie dacă există
        });

      if (uploadError) throw uploadError;

      // Obținem URL-ul public
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      setAvatarPreview(publicUrl);
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError(`Eroare la încărcarea imaginii: ${err instanceof Error ? err.message : 'Eroare necunoscută'}`);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    if (avatarPreview) {
      formData.set('avatar_url', avatarPreview);
    }

    const result = await updateProfile(formData);

    if (result && result.error) {
      setError(result.error);
      return;
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Editează Profilul</DialogTitle>
      </DialogHeader>

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                  <ImagePlus className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                id="avatar-upload"
                onChange={handleAvatarChange}
                disabled={isUploading}
              />
              <Label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90"
              >
                <ImagePlus className="w-4 h-4" />
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Imaginea trebuie să fie mai mică de 5MB. Imaginile mari vor fi comprimate automat.
            </p>
          </div>

          {/* Restul câmpurilor rămân neschimbate */}
          <div className="space-y-2">
            <Label htmlFor="username">Echipa</Label>
            <Input
              id="username"
              name="username"
              defaultValue={profile?.username || ""}
              placeholder="Numele echipei tale"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Leader</Label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={profile?.full_name || ""}
              placeholder="Numele leader-ului echipei"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isUploading}>
              {isUploading ? 'Se încarcă...' : 'Salvează modificările'}
            </Button>
          </div>
        </div>
      </form>
    </DialogContent>
  );
} 
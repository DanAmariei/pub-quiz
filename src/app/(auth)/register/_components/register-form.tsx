"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/app/auth/_actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await signUp(formData);

    if (result?.error) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }

    // Redirecționăm direct către homepage
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="nume@exemplu.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Parolă</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Se creează contul..." : "Creează cont"}
      </Button>
    </form>
  );
}

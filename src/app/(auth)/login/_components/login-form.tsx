"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputForm } from "@/components/ui/input/input-form";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().email("Adresa de email nu este validă"),
  password: z.string().min(8, {
    message: "Parola trebuie să aibă minim 8 caractere.",
  }),
});

type LoginValuesType = z.infer<typeof loginFormSchema>;

const defaultValues: LoginValuesType = {
  email: "",
  password: "",
};

const LoginForm = () => {
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<LoginValuesType>({
    resolver: zodResolver(loginFormSchema),
    defaultValues,
  });

  async function handleLogin(values: LoginValuesType) {
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      const errorMessage = error.message === "Invalid login credentials"
        ? "Email sau parolă incorectă"
        : error.message === "Email not confirmed"
        ? "Adresa de email nu a fost confirmată"
        : "A apărut o eroare la autentificare. Încearcă din nou.";
      
      toast.error(errorMessage);
      return;
    }

    toast.success("Autentificare reușită!");
    
    // Redirecționăm către homepage și forțăm un refresh complet
    router.push('/');
    router.refresh();
    window.location.reload();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleLogin)}
        className="w-full flex flex-col gap-y-4"
      >
        <InputForm
          label="Email"
          name="email"
          placeholder="Adresa de email"
          description="Introdu adresa de email"
          required
        />

        <InputForm
          type="password"
          label="Parolă"
          name="password"
          description="Introdu parola contului tău"
          required
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Se autentifică..." : "Autentificare"}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { ChevronLeftCircle } from "lucide-react";
import Link from "next/link";
import LoginForm from "./_components/login-form";
import { getProfile } from "@/utils/get-profile";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const { user } = await getProfile() || {};

  if (user) {
    redirect('/');
  }

  return (
    <section className="container flex h-screen flex-col items-center justify-center">
      <Button variant="outline" asChild>
        <Link href="/" className={cn("absolute left-4 top-4")}>
          <ChevronLeftCircle className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>

      <div className="mx-auto max-w-80 flex flex-col justify-center space-y-6 ">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Bine ai revenit!
          </h1>

          <p className="text-sm text-muted-foreground">
            Introdu adresa de email și parola pentru a te autentifica
          </p>
        </div>

        <LoginForm />

        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href="/register"
            className="hover:text-brand underline underline-offset-4"
          >
            Nu ai cont? Înregistrează-te
          </Link>
        </p>
      </div>
    </section>
  );
}

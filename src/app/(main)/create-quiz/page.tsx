import { getProfile } from "@/utils/get-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import TemplateButton from "./_components/template-button";
import { revalidatePath } from "next/cache";
import { CreateQuizButton } from "./_components/create-quiz-form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import QuizForm from "./_components/quiz-form"
import { createQuiz, getCategories } from "./_actions"

const QUESTIONS_TEMPLATE = {
  "questions": [
    {
      "question": "xxx",
      "song": "",
      "image": "",
      "video": "",
      "correct_answer": "True",
      "incorrect_answers": [
        "False",
        "False",
        "False"
      ]
    }
  ]
};

export default async function CreateQuizPage() {
  const { user, profile } = await getProfile() || {};

  if (!user || (!profile?.is_host && !profile?.is_admin)) {
    redirect('/');
  }

  const categories = await getCategories();

  return (
    <main className="flex-1 container py-8">
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Creează Quiz Nou</h1>
          <p className="text-muted-foreground">
            Completează informațiile pentru noul quiz
          </p>
        </div>

        <QuizForm createQuiz={createQuiz} categories={categories} />
      </div>
    </main>
  );
} 
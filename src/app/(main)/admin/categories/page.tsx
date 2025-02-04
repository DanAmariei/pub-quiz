import { getProfile } from "@/utils/get-profile";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import CategoryForm from "./_components/category-form";
import { revalidatePath } from "next/cache";
import DeleteCategoryButton from "./_components/delete-category-button";

export default async function CategoriesPage() {
  const { user, profile } = await getProfile() || {};

  if (!user || (!profile?.is_host && !profile?.is_admin)) {
    redirect('/');
  }

  const supabase = createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return (
    <main className="flex-1 container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Administrare Categorii</h1>
            <p className="text-muted-foreground">
              Gestionează categoriile de quiz-uri
            </p>
          </div>
          <CategoryForm>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Categorie Nouă
            </Button>
          </CategoryForm>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nume</TableHead>
                <TableHead>Descriere</TableHead>
                <TableHead>Data Creării</TableHead>
                <TableHead className="w-[100px]">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    {new Date(category.created_at).toLocaleDateString('ro-RO')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CategoryForm category={category}>
                        <Button size="icon" variant="ghost">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </CategoryForm>
                      <DeleteCategoryButton 
                        id={category.id} 
                        name={category.name} 
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}

async function deleteCategory(formData: FormData) {
  'use server'
  
  const { user, profile } = await getProfile() || {};
  
  if (!user || (!profile?.is_host && !profile?.is_admin)) {
    return { error: 'Unauthorized' };
  }

  const id = formData.get('id') as string;
  const supabase = createClient();
  
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/categories');
} 
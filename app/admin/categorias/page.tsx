import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { CategoriesEditor } from "@/components/admin/CategoriesEditor";
import { getSession } from "@/lib/auth/session";
import { getContent } from "@/lib/content/store";

export default async function AdminCategoriesPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const content = await getContent();

  return (
    <AdminShell
      email={session.email}
      title="Categorías"
      description="Administra portadas, títulos y la cantidad de categorías (mínimo 3)."
    >
      <CategoriesEditor initial={content.categories} />
    </AdminShell>
  );
}

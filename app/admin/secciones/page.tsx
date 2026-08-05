import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { SectionsEditor } from "@/components/admin/SectionsEditor";
import { getSession } from "@/lib/auth/session";
import { getContent } from "@/lib/content/store";

export default async function AdminSectionsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const content = await getContent();

  return (
    <AdminShell
      email={session.email}
      title="Secciones"
      description="Muestra u oculta bloques, reordénalos o crea secciones nuevas."
    >
      <SectionsEditor initial={content.sections} />
    </AdminShell>
  );
}

import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ColumnsEditor } from "@/components/admin/ColumnsEditor";
import { getSession } from "@/lib/auth/session";
import { getContent } from "@/lib/content/store";

export default async function AdminColumnsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const content = await getContent();

  return (
    <AdminShell
      email={session.email}
      title="Columns (parallax)"
      description="Gestiona las 10 imágenes de la galería parallax de la home."
    >
      <ColumnsEditor initial={content.columns} />
    </AdminShell>
  );
}

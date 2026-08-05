import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { FeaturedEditor } from "@/components/admin/FeaturedEditor";
import { getSession } from "@/lib/auth/session";
import { getContent } from "@/lib/content/store";

export default async function AdminFeaturedPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const content = await getContent();

  return (
    <AdminShell
      email={session.email}
      title="Colecciones destacadas"
      description="Gestiona los looks y handles de la colección destacada."
    >
      <FeaturedEditor initial={content.featured} />
    </AdminShell>
  );
}

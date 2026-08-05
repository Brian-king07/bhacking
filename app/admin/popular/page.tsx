import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { PopularEditor } from "@/components/admin/PopularEditor";
import { getSession } from "@/lib/auth/session";
import { getContent } from "@/lib/content/store";

export default async function AdminPopularPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const content = await getContent();

  return (
    <AdminShell
      email={session.email}
      title="Popular este año"
      description="Cambia el retrato principal y los productos del carrusel."
    >
      <PopularEditor initial={content.popular} />
    </AdminShell>
  );
}

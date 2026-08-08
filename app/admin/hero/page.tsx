import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { HeroEditor } from "@/components/admin/HeroEditor";
import { getSession } from "@/lib/auth/session";
import { getContent } from "@/lib/content/store";

export default async function AdminHeroPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const content = await getContent();

  return (
    <AdminShell
      email={session.email}
      title="Hero"
      description="Imagen mobile y desktop, textos y llamadas a la acción del banner."
    >
      <HeroEditor initial={content.hero} />
    </AdminShell>
  );
}

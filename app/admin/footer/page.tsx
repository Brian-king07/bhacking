import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { FooterNavEditor } from "@/components/admin/FooterNavEditor";
import { getSession } from "@/lib/auth/session";
import { getContent } from "@/lib/content/store";

export default async function AdminFooterPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const content = await getContent();

  return (
    <AdminShell
      email={session.email}
      title="Footer, nav y contacto"
      description="WhatsApp, Instagram, marca, menú y textos del pie."
    >
      <FooterNavEditor
        brand={content.brand}
        navLinks={content.navLinks}
        footer={content.footer}
        contact={content.contact}
      />
    </AdminShell>
  );
}

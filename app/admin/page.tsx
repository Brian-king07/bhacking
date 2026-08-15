import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminCard, adminCardInteractive } from "@/lib/admin/styles";
import { getSession } from "@/lib/auth/session";
import { getContent } from "@/lib/content/store";
import { cn } from "@/lib/utils";

const cards = [
  {
    href: "/admin/productos",
    title: "Productos",
    desc: "Fotos, precios y nombres",
  },
  {
    href: "/admin/footer",
    title: "Header / Footer",
    desc: "Marca, menú, contacto y pie",
  },
];

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const content = await getContent();

  return (
    <AdminShell
      email={session.email}
      title="Panel de administración"
      description="Gestiona el catálogo y el header/footer del sitio."
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Stat label="Productos" value={String(content.products.items.length)} />
        <Stat label="Enlaces del menú" value={String(content.navLinks.length)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={cn(adminCardInteractive, "block p-5")}
          >
            <h2 className="font-display text-lg font-bold">{card.title}</h2>
            <p className="mt-2 text-sm text-neutral-500">{card.desc}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn(adminCard, "px-5 py-4")}>
      <p className="text-xs tracking-wide text-neutral-500 uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}

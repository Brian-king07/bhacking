import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSession } from "@/lib/auth/session";
import { getContent } from "@/lib/content/store";

const cards = [
  {
    href: "/admin/hero",
    title: "Hero",
    desc: "Imagen principal, titular y CTAs",
  },
  {
    href: "/admin/categorias",
    title: "Categorías",
    desc: "Portadas, altas y bajas (mín. 3)",
  },
  {
    href: "/admin/productos",
    title: "Productos nuevos",
    desc: "Fotos, precios y nombres",
  },
  {
    href: "/admin/colecciones",
    title: "Colecciones",
    desc: "Looks destacados de la comunidad",
  },
  {
    href: "/admin/popular",
    title: "Popular",
    desc: "Retrato y productos del carrusel",
  },
  {
    href: "/admin/secciones",
    title: "Secciones",
    desc: "Mostrar, ocultar, ordenar o crear",
  },
  {
    href: "/admin/footer",
    title: "Footer / Nav",
    desc: "Marca, menú y pie de página",
  },
];

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const content = await getContent();

  const visible = content.sections.filter((s) => s.visible).length;

  return (
    <AdminShell
      email={session.email}
      title="Panel de administración"
      description="Control total del catálogo bhacking: multimedia, productos y estructura de la home."
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Secciones visibles" value={String(visible)} />
        <Stat label="Categorías" value={String(content.categories.items.length)} />
        <Stat label="Productos" value={String(content.products.items.length)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md"
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
    <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-4">
      <p className="text-xs tracking-wide text-neutral-500 uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}

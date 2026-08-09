import Link from "next/link";
import { logoutAction } from "@/lib/auth/actions";

const links = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/hero", label: "Hero" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/colecciones", label: "Colecciones" },
  { href: "/admin/secciones", label: "Secciones" },
  { href: "/admin/footer", label: "Contacto / Footer" },
];

export function AdminShell({
  email,
  children,
  title,
  description,
}: {
  email: string;
  children: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <div className="mx-auto flex min-h-screen  flex-col lg:flex-row">
        <aside className="border-b border-neutral-200 bg-white lg:fixed lg:top-0 lg:left-0 lg:h-screen lg:w-64 lg:border-r lg:border-b-0">
          <div className="flex items-center justify-between px-5 py-5 lg:block">
            <div>
              <p className="font-display text-lg font-bold tracking-[0.12em]">BHACKING</p>
              <p className="mt-1 text-xs text-neutral-500">Admin · Owner</p>
            </div>
            <Link
              href="/"
              target="_blank"
              className="text-xs text-neutral-500 underline-offset-2 hover:underline lg:mt-4 lg:inline-block"
            >
              Ver sitio
            </Link>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-neutral-100 px-5 py-4">
            <p className="truncate text-xs text-neutral-500">{email}</p>
            <form action={logoutAction} className="mt-2">
              <button
                type="submit"
                className="text-sm font-medium text-neutral-900 underline-offset-2 hover:underline"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </aside>

        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 md:px-8 lg:ml-64">
          <header className="mb-8">
            <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
            {description ? (
              <p className="mt-2 max-w-2xl text-sm text-neutral-500">{description}</p>
            ) : null}
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

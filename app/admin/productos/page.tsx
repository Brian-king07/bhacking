import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductsEditor } from "@/components/admin/ProductsEditor";
import { getSession } from "@/lib/auth/session";
import { getContent } from "@/lib/content/store";

export default async function AdminProductsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const content = await getContent();

  return (
    <AdminShell
      email={session.email}
      title="Productos nuevos"
      description="Actualiza fotos, precios, nombres y filtros de los productos."
    >
      <ProductsEditor initial={content.products} />
    </AdminShell>
  );
}

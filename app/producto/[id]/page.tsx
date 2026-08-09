import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  InstagramButton,
  WhatsAppConsultButton,
} from "@/components/ContactButton";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { productWhatsAppUrl } from "@/lib/contact/whatsapp";
import { getContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const content = await getContent();
  const product = content.products.items.find((p) => p.id === id);
  if (!product) return { title: "Producto no encontrado — BHACKING" };
  return {
    title: `${product.name} — BHACKING`,
    description:
      product.description?.trim() ||
      `${product.name} · ${product.price}. Consulta por WhatsApp.`,
    openGraph: {
      title: product.name,
      description: product.description?.trim() || product.price,
      images: product.image ? [{ url: product.image }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const content = await getContent();
  const product = content.products.items.find((p) => p.id === id);
  if (!product) notFound();

  const categoryLabel = product.category === "men" ? "Hombre" : "Mujer";
  const waUrl = productWhatsAppUrl(content.contact, product);
  const description =
    product.description?.trim() ||
    "¿Te gusta esta pieza? Escríbenos por WhatsApp y te ayudamos con tallas, disponibilidad y envío.";

  return (
    <>
      <Header
        brand={content.brand}
        navLinks={content.navLinks}
        contact={content.contact}
        solid
      />
      <main className="flex-1 bg-background px-5 pt-28 pb-20 md:px-8 md:pt-32 md:pb-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-16 lg:items-start">
          <div className="relative aspect-square overflow-hidden rounded-md bg-soft">
            <Image
              src={product.image}
              alt={product.alt || product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
            />
          </div>

          <div className="flex flex-col lg:pt-4">
            <Link
              href="/#shop"
              className="text-sm tracking-wide text-muted-foreground underline-offset-4 transition-opacity hover:opacity-70 hover:underline"
            >
              ← Volver a productos
            </Link>
            <p className="mt-6 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              {categoryLabel}
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 text-xl text-muted-foreground md:text-2xl">
              {product.price}
            </p>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
              {description}
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <WhatsAppConsultButton
                href={waUrl}
                label={content.contact.whatsappCtaLabel}
              />
              {content.contact.instagramHandle ? (
                <InstagramButton
                  handle={content.contact.instagramHandle}
                  label={content.contact.instagramCtaLabel}
                />
              ) : null}
            </div>
          </div>
        </div>
      </main>
      <Footer
        brand={content.brand}
        content={content.footer}
        contact={content.contact}
      />
      <WhatsAppFloat contact={content.contact} />
    </>
  );
}

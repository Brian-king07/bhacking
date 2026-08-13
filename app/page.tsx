import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { NewestProducts } from "@/components/NewestProducts";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { getContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getContent();
  const sections = [...content.sections]
    .filter((s) => s.visible && s.type !== "popular")
    .sort((a, b) => a.order - b.order);

  return (
    <>
      <Header
        brand={content.brand}
        navLinks={content.navLinks}
        contact={content.contact}
      />
      <main className="flex-1 pt-20 md:pt-52">
        {sections.map((section) => {
          switch (section.type) {
            case "products":
              if (content.products.items.length === 0) return null;
              return (
                <Suspense key={section.id} fallback={null}>
                  <NewestProducts content={content.products} />
                </Suspense>
              );
            default:
              return null;
          }
        })}
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

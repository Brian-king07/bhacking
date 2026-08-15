import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { NewestProducts } from "@/components/NewestProducts";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { getContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getContent();

  return (
    <>
      <Header
        brand={content.brand}
        navLinks={content.navLinks}
        contact={content.contact}
      />
      <main id="home" className="flex-1 scroll-mt-24 pt-20 md:pt-52">
        {content.products.items.length > 0 ? (
          <Suspense fallback={null}>
            <NewestProducts content={content.products} />
          </Suspense>
        ) : null}
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

import { Suspense } from "react";
import { Categories } from "@/components/Categories";
import { CustomSection } from "@/components/CustomSection";
import { FeaturedCollection } from "@/components/FeaturedCollection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { NewestProducts } from "@/components/NewestProducts";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { getContent } from "@/lib/content/store";
import { COLUMNS_COUNT, MIN_CATEGORIES } from "@/lib/content/types";
import Columns from "@/components/Columns";

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
      <main className="flex-1">
        {sections.map((section) => {
          switch (section.type) {
            case "hero":
              return <Hero key={section.id} content={content.hero} />;
            case "columns": {
              const filled = content.columns.items.filter((i) => i.image).length;
              if (filled < COLUMNS_COUNT) return null;
              return <Columns key={section.id} content={content.columns} />;
            }
            case "categories":
              // Layout fijo: siempre 3 slots (garantizado en mergeWithDefaults).
              if (content.categories.items.length < MIN_CATEGORIES) return null;
              return (
                <Categories
                  key={section.id}
                  content={{
                    ...content.categories,
                    items: content.categories.items.slice(0, MIN_CATEGORIES),
                  }}
                />
              );
            case "products":
              if (content.products.items.length === 0) return null;
              return (
                <Suspense key={section.id} fallback={null}>
                  <NewestProducts content={content.products} />
                </Suspense>
              );
            case "featured":
              if (content.featured.items.length === 0) return null;
              return (
                <FeaturedCollection
                  key={section.id}
                  content={content.featured}
                />
              );
            case "custom":
              if (!section.custom?.image && !section.custom?.title) return null;
              return <CustomSection key={section.id} section={section} />;
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

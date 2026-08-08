import { Categories } from "@/components/Categories";
import { CustomSection } from "@/components/CustomSection";
import { FeaturedCollection } from "@/components/FeaturedCollection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { NewestProducts } from "@/components/NewestProducts";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { getContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getContent();
  const sections = [...content.sections]
    .filter((s) => s.visible)
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
            case "categories":
              return <Categories key={section.id} content={content.categories} />;
            case "products":
              return <NewestProducts key={section.id} content={content.products} />;
            case "featured":
              return (
                <FeaturedCollection key={section.id} content={content.featured} />
              );
            case "custom":
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

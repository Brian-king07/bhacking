import Image from "next/image";
import Link from "next/link";
import type { CategoriesSection, CategoryItem } from "@/lib/content/types";
import { shopHref } from "@/lib/content/hrefs";

export function Categories({ content }: { content: CategoriesSection }) {
  const large = content.items.find((c) => c.large) ?? content.items[0];
  const secondary = content.items.filter((c) => c.id !== large?.id);

  if (!large) return null;

  return (
    <section id="categories" className="bg-background px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              {content.title}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
              {content.description}
            </p>
          </div>
          <Link
            href={shopHref()}
            className="text-sm font-medium tracking-wide underline-offset-4 transition-opacity hover:opacity-60 hover:underline"
          >
            {content.viewAllLabel}
          </Link>
        </div>

        <div className="grid gap-4 lg:h-[90vh] md:grid-cols-2 md:gap-3 lg:grid-cols-[1fr_1fr]">
          <CategoryCard category={large} tall />
          <div className="grid gap-4 md:gap-3">
            {secondary.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  tall = false,
}: {
  category: CategoryItem;
  tall?: boolean;
}) {
  return (
    <Link
      href={shopHref()}
      className={`group relative block overflow-hidden rounded-md bg-soft ${
        tall ? "min-h-[550px] md:min-h-full md:h-full" : "min-h-[210px]"
      }`}
    >
      <div className="absolute w-full h-full inset-0 bg-black/30 z-30" />
      <Image
        src={category.image}
        alt={category.alt}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        sizes={tall ? "(max-width:768px) 100vw, 50vw" : "(max-width:768px) 100vw, 45vw"}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 md:p-6">
        <h3 className="font-display text-2xl font-bold text-white md:text-3xl z-40">
          {category.title}
        </h3>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 z-40 py-2 text-xs font-semibold tracking-wide text-foreground transition-transform duration-300 group-hover:translate-x-0.5">
          {category.cta}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}

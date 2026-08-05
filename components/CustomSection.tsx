import Image from "next/image";
import Link from "next/link";
import type { SectionConfig } from "@/lib/content/types";

export function CustomSection({ section }: { section: SectionConfig }) {
  if (!section.custom) return null;
  const { title, description, image, ctaLabel, ctaHref } = section.custom;

  return (
    <section className="bg-surface px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:items-center">
        <div className="relative min-h-[360px] overflow-hidden rounded-md bg-soft">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width:1024px) 100vw, 50vw"
          />
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {title}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted md:text-base">
            {description}
          </p>
          {ctaLabel ? (
            <Link
              href={ctaHref || "#"}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold tracking-wide text-white transition-transform duration-300 hover:scale-[1.03]"
            >
              {ctaLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

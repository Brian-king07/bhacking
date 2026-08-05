import Image from "next/image";
import Link from "next/link";
import type { FeaturedSection } from "@/lib/content/types";

export function FeaturedCollection({ content }: { content: FeaturedSection }) {
  return (
    <section id="history" className="bg-background px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              {content.title}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted md:text-base">
              {content.description}
            </p>
          </div>
          <Link
            href="#shop"
            className="text-sm font-medium tracking-wide underline-offset-4 transition-opacity hover:opacity-60 hover:underline"
          >
            {content.viewAllLabel}
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {content.items.map((item) => (
            <Link key={item.id} href="#shop" className="group block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-soft">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width:640px) 100vw, 33vw"
                />
              </div>
              <p className="mt-4 text-sm tracking-wide text-muted transition-colors group-hover:text-foreground">
                {item.handle}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

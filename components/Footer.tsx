"use client";

import Link from "next/link";
import type { FooterContent } from "@/lib/content/types";

export function Footer({
  brand,
  content,
}: {
  brand: string;
  content: FooterContent;
}) {
  const columns = [
    { title: content.sitemapTitle, links: content.sitemapLinks },
    { title: content.availableTitle, links: content.availableLinks },
    // { title: content.termsTitle, links: content.termsLinks },
  ];

  return (
    <footer className="relative overflow-hidden bg-background px-5 pt-20 pb-8 md:px-8 md:pt-28">
      <div className="pointer-events-none absolute inset-x-0 bottom-16 select-none overflow-hidden">
        <p className="font-display text-center text-[18vw] leading-none font-bold tracking-tight text-foreground/[0.04]">
          {brand}
        </p>
      </div>

      <div className="relative mx-auto flex flex-col lg:flex-row max-w-7xl justify-between gap-12  lg:gap-8">
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              {column.title}
            </h3>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm transition-opacity hover:opacity-60">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="font-display text-xl font-bold tracking-tight">
            {content.newsletterTitle}
          </h3>
          <div className="mt-5 flex items-center gap-4 text-foreground">
            <Social label="LinkedIn" />
            <Social label="Instagram" />
            <Social label="X" />
            <Social label="Dribbble" />
          </div>
          <form
            className="mt-6 flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <label className="sr-only" htmlFor="newsletter-email">
              Correo electrónico
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="Tu correo electrónico"
              className="w-full rounded-full border border-line bg-surface px-5 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-foreground px-6 py-3 text-sm font-semibold tracking-wide text-white transition-opacity hover:opacity-85"
            >
              Suscribirse
            </button>
          </form>
        </div>
      </div>

      <div className="relative mx-auto mt-16 max-w-7xl border-t border-line/80 pt-6">
        <p className="text-center text-xs tracking-wide text-muted-foreground">{content.copyright}</p>
      </div>
    </footer>
  );
}

function Social({ label }: { label: string }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-xs font-medium transition-colors hover:bg-foreground hover:text-white"
    >
      {label[0]}
    </a>
  );
}

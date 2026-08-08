"use client";

import Link from "next/link";
import type { ContactSettings, FooterContent } from "@/lib/content/types";
import { buildInstagramUrl, generalWhatsAppUrl } from "@/lib/contact/whatsapp";

export function Footer({
  brand,
  content,
  contact,
}: {
  brand: string;
  content: FooterContent;
  contact?: ContactSettings;
}) {
  const columns = [
    { title: content.sitemapTitle, links: content.sitemapLinks },
    { title: content.availableTitle, links: content.availableLinks },
  ];

  return (
    <footer className="relative overflow-hidden bg-background px-5 pt-20 pb-8 md:px-8 md:pt-28">
      <div className="pointer-events-none absolute inset-x-0 bottom-16 select-none overflow-hidden">
        <p className="font-display text-center text-[18vw] leading-none font-bold tracking-tight text-foreground/[0.04]">
          {brand}
        </p>
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col justify-between gap-12 lg:flex-row lg:gap-8">
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              {column.title}
            </h3>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-opacity hover:opacity-60"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="font-display text-xl font-bold tracking-tight">
            Contacto
          </h3>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Escríbenos y te atendemos por chat.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {contact?.whatsappNumber ? (
              <a
                href={generalWhatsAppUrl(contact)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                WhatsApp
              </a>
            ) : null}
            {contact?.instagramHandle ? (
              <a
                href={buildInstagramUrl(contact.instagramHandle)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full border border-line px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-foreground hover:text-white"
              >
                Instagram
              </a>
            ) : null}
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            {content.newsletterTitle}
          </p>
        </div>
      </div>

      <div className="relative mx-auto mt-16 max-w-7xl border-t border-line/80 pt-6">
        <p className="text-center text-xs tracking-wide text-muted-foreground">
          {content.copyright}
        </p>
      </div>
    </footer>
  );
}

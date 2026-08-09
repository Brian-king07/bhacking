"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ContactSettings, NavLink } from "@/lib/content/types";
import { siteHref } from "@/lib/content/hrefs";
import { generalWhatsAppUrl } from "@/lib/contact/whatsapp";

export function Header({
  brand,
  navLinks,
  contact,
  solid = false,
}: {
  brand: string;
  navLinks: NavLink[];
  contact?: ContactSettings;
  solid?: boolean;
}) {
  const [scrolled, setScrolled] = useState(solid);
  const [open, setOpen] = useState(false);
  const dark = solid || scrolled;

  useEffect(() => {
    if (solid) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [solid]);

  const waHref = contact ? generalWhatsAppUrl(contact) : null;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        dark
          ? "bg-white/90 py-4 shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-md"
          : "bg-transparent py-6"
      }`}
    >
      <div className="px-5 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/#home"
            className={`font-display text-2xl font-bold tracking-[0.08em] transition-colors duration-300 ${
              dark ? "text-foreground" : "text-white"
            }`}
          >
            {brand}
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {navLinks.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={siteHref(link.href)}
                className={`text-[13px] font-medium tracking-[0.14em] uppercase transition-opacity hover:opacity-70 ${
                  dark ? "text-foreground" : "text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {waHref ? (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={contact?.whatsappCtaLabel || "WhatsApp"}
                className={`transition-opacity hover:opacity-70 ${
                  dark ? "text-foreground" : "text-white"
                }`}
              >
                <WhatsAppIcon />
              </a>
            ) : null}
            <button
              type="button"
              aria-label="Menú"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className={`md:hidden ${dark ? "text-foreground" : "text-white"}`}
            >
              <MenuIcon open={open} />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden px-5 transition-all duration-300 md:px-8 ${
          open ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav
          className={`mx-auto mt-3 flex max-w-7xl flex-col gap-4 rounded-xl px-5 py-5 ${
            dark ? "bg-white" : "bg-black/50 backdrop-blur-md"
          }`}
        >
          {navLinks.map((link) => (
            <Link
              key={`m-${link.href}-${link.label}`}
              href={siteHref(link.href)}
              onClick={() => setOpen(false)}
              className={`text-sm tracking-[0.12em] uppercase ${
                dark ? "text-foreground" : "text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className={`text-sm tracking-[0.12em] uppercase ${
                dark ? "text-foreground" : "text-white"
              }`}
            >
              WhatsApp
            </a>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.15 6.42 2.15 11.88c0 1.75.46 3.45 1.34 4.95L2 22l5.3-1.39c1.44.79 3.06 1.2 4.74 1.2h.01c5.46 0 9.89-4.42 9.89-9.88C21.94 6.42 17.5 2 12.04 2zm0 18.06h-.01c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.15.82.84-3.07-.2-.31a8.2 8.2 0 01-1.26-4.39c0-4.54 3.7-8.23 8.25-8.23 4.54 0 8.24 3.69 8.24 8.23 0 4.55-3.7 8.28-8.21 8.28z" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      {open ? (
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

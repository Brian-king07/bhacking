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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const waHref = contact ? generalWhatsAppUrl(contact) : null;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        dark || open
          ? "bg-white/95 py-4 shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-md"
          : "bg-transparent py-5 md:py-6"
      }`}
    >
      <div className="px-5 md:px-8">
        {/* Mobile: brand left, menu right */}
        <div className="mx-auto flex max-w-7xl items-center justify-between md:hidden">
          <Link
            href="/#home"
            className="font-display text-[1.35rem] font-bold tracking-[0.06em] text-foreground"
            onClick={() => setOpen(false)}
          >
            {brand}
          </Link>
          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-end text-foreground"
          >
            <MenuIcon open={open} />
          </button>
        </div>

        {/* Desktop: three-column layout */}
        <div className="mx-auto hidden max-w-7xl grid-cols-3 items-start md:grid">
          <nav className="flex items-start gap-8">
            <p className="w-[36%] text-[13px] font-bold tracking-wide uppercase text-foreground">
              Creado con pasion y cuidado
            </p>
            {navLinks.slice(0, 2).map((link) => (
              <Link
                key={`d-l-${link.href}-${link.label}`}
                href={siteHref(link.href)}
                className="text-[13px] font-bold tracking-wide uppercase text-foreground transition-opacity hover:opacity-70"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="text-center">
            <Link
              href="/#home"
              className="font-display text-2xl font-bold tracking-[0.08em] text-foreground"
            >
              {brand}
            </Link>
          </div>

          <nav className="flex items-start justify-end gap-8">
            {navLinks.slice(2).map((link) => (
              <Link
                key={`d-r-${link.href}-${link.label}`}
                href={siteHref(link.href)}
                className="text-[13px] font-bold tracking-wide uppercase text-foreground transition-opacity hover:opacity-70"
              >
                {link.label}
              </Link>
            ))}
            <p className="w-[27%] text-right text-[13px] font-bold tracking-wide uppercase text-foreground">
              tu ropa única y personal
            </p>
          </nav>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl flex-col gap-1 border-t border-black/5 px-5 py-4">
          {navLinks.map((link) => (
            <Link
              key={`m-${link.href}-${link.label}`}
              href={siteHref(link.href)}
              onClick={() => setOpen(false)}
              className="py-3 text-sm font-medium tracking-[0.14em] uppercase text-foreground transition-opacity hover:opacity-60"
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
              className="py-3 text-sm font-medium tracking-[0.14em] uppercase text-foreground transition-opacity hover:opacity-60"
            >
              WhatsApp
            </a>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="24" height="16" viewBox="0 0 24 16" fill="none" aria-hidden>
      {open ? (
        <>
          <path
            d="M2 2l20 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M22 2L2 14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path
            d="M0 1.5h24"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
          <path
            d="M0 14.5h24"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </>
      )}
    </svg>
  );
}

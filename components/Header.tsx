"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { NavLink } from "@/lib/content/types";

export function Header({
  brand,
  navLinks,
}: {
  brand: string;
  navLinks: NavLink[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 py-4 shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-md"
          : "bg-transparent py-6"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-8">
        <Link
          href="#home"
          className={`font-display text-2xl font-bold tracking-[0.08em] transition-colors duration-300 ${
            scrolled ? "text-foreground" : "text-white"
          }`}
        >
          {brand}
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              className={`text-[13px] font-medium tracking-[0.14em] uppercase transition-opacity hover:opacity-70 ${
                scrolled ? "text-foreground" : "text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Buscar"
            className={`transition-opacity hover:opacity-70 ${
              scrolled ? "text-foreground" : "text-white"
            }`}
          >
            <SearchIcon />
          </button>
          <button
            type="button"
            aria-label="Carrito"
            className={`transition-opacity hover:opacity-70 ${
              scrolled ? "text-foreground" : "text-white"
            }`}
          >
            <BagIcon />
          </button>
          <button
            type="button"
            aria-label="Cuenta"
            className={`hidden transition-opacity hover:opacity-70 sm:inline-flex ${
              scrolled ? "text-foreground" : "text-white"
            }`}
          >
            <UserIcon />
          </button>
          <button
            type="button"
            aria-label="Menú"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={`md:hidden ${scrolled ? "text-foreground" : "text-white"}`}
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav
          className={`mx-5 mt-3 flex flex-col gap-4 rounded-xl px-5 py-5 ${
            scrolled ? "bg-white" : "bg-black/50 backdrop-blur-md"
          }`}
        >
          {navLinks.map((link) => (
            <Link
              key={`m-${link.href}-${link.label}`}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`text-sm tracking-[0.12em] uppercase ${
                scrolled ? "text-foreground" : "text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 8h12l-1 12H7L6 8z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 8V7a3 3 0 016 0v1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 19.5c1.8-3.2 4.2-4.5 7-4.5s5.2 1.3 7 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
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

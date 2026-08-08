"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { PopularSection } from "@/lib/content/types";

export function Popular({ content }: { content: PopularSection }) {
  const [index, setIndex] = useState(0);
  const items = content.items;
  if (!items.length) return null;
  const item = items[index % items.length];

  const prev = () => setIndex((i) => (i === 0 ? items.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === items.length - 1 ? 0 : i + 1));

  return (
    <section id="news" className="bg-surface px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:gap-12 lg:items-stretch">
        <div className="relative min-h-[480px] overflow-hidden rounded-md bg-soft lg:min-h-[640px]">
          <Image
            src={content.portraitImage}
            alt={content.portraitAlt}
            fill
            className="object-cover object-top"
            sizes="(max-width:1024px) 100vw, 50vw"
          />
        </div>

        <div className="flex flex-col justify-center rounded-md bg-background px-6 py-10 md:px-12 md:py-14">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {content.title}
          </h2>

          <div className="mt-10 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={prev}
              aria-label="Producto anterior"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line transition-colors hover:bg-soft"
            >
              <Chevron dir="left" />
            </button>

            <div
              key={item.id}
              className="relative h-40 w-40 overflow-hidden rounded-md bg-soft animate-fade-in sm:h-48 sm:w-48"
            >
              <Image
                src={item.image}
                alt={item.alt}
                fill
                className="object-cover"
                sizes="192px"
              />
            </div>

            <button
              type="button"
              onClick={next}
              aria-label="Producto siguiente"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line transition-colors hover:bg-soft"
            >
              <Chevron dir="right" />
            </button>
          </div>

          <div key={`${item.id}-copy`} className="mt-8 text-center animate-fade-up">
            <h3 className="font-display text-lg font-bold tracking-[0.08em] uppercase md:text-xl">
              {item.name}
            </h3>
            <p className="mt-2 text-base text-muted-foreground">{item.price}</p>
            <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
            <Link
              href="#shop"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold tracking-wide text-white transition-transform duration-300 hover:scale-[1.03]"
            >
              Ver detalles
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

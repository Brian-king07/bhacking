"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ProductItem, ProductsSection } from "@/lib/content/types";

const filters = [
  { id: "all", label: "Todos" },
  { id: "men", label: "Hombre" },
  { id: "women", label: "Mujer" },
] as const;

type FilterId = (typeof filters)[number]["id"];

export function NewestProducts({ content }: { content: ProductsSection }) {
  const [active, setActive] = useState<FilterId>("all");

  const visible =
    active === "all"
      ? content.items
      : content.items.filter((p) => p.category === active);

  return (
    <section id="shop" className="bg-surface px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {content.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
            {content.description}
          </p>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          {filters.map((filter) => {
            const isActive = active === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActive(filter.id)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 ${
                  isActive
                    ? "bg-foreground text-white"
                    : "bg-soft text-foreground hover:bg-line"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: ProductItem }) {
  return (
    <Link href="#shop" className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-soft">
        <Image
          src={product.image}
          alt={product.alt}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium tracking-wide md:text-base">{product.name}</h3>
        <p className="text-sm text-muted">{product.price}</p>
      </div>
    </Link>
  );
}

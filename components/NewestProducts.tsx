"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ProductItem, ProductsSection } from "@/lib/content/types";

type PageItem = number | "ellipsis";

/** Compact window: first 3 + last (or last 3 + first). Always a single row. */
function getVisiblePages(current: number, total: number): PageItem[] {
  const edge = 3;
  if (total <= edge + 1) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= edge) {
    return [...Array.from({ length: edge }, (_, i) => i + 1), "ellipsis", total];
  }

  if (current > total - edge) {
    return [
      1,
      "ellipsis",
      ...Array.from({ length: edge }, (_, i) => total - edge + 1 + i),
    ];
  }

  return [1, "ellipsis", current, "ellipsis", total];
}

const PAGE_SIZE = 6;

const filters = [
  { id: "all", label: "Todos" },
  { id: "men", label: "Hombre" },
  { id: "women", label: "Mujer" },
] as const;

type FilterId = (typeof filters)[number]["id"];

function parseFilter(value: string | null): FilterId {
  if (value === "men" || value === "women") return value;
  return "all";
}

export function NewestProducts({ content }: { content: ProductsSection }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState<FilterId>(() =>
    parseFilter(searchParams.get("filter")),
  );
  const [page, setPage] = useState(1);

  useEffect(() => {
    setActive(parseFilter(searchParams.get("filter")));
    setPage(1);
  }, [searchParams]);

  const filtered = useMemo(
    () =>
      active === "all"
        ? content.items
        : content.items.filter((p) => p.category === active),
    [active, content.items],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function changeFilter(id: FilterId) {
    setActive(id);
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (id === "all") params.delete("filter");
    else params.set("filter", id);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}#shop` : `${pathname}#shop`, {
      scroll: false,
    });
  }

  return (
    <section id="shop" className="bg-surface px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {content.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
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
                onClick={() => changeFilter(filter.id)}
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

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            No hay productos en esta categoría.
          </p>
        ) : null}

        {totalPages > 1 ? (
          <nav
            aria-label="Paginación de productos"
            className="mt-12 flex flex-nowrap items-center justify-center gap-0.5 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-1 [&::-webkit-scrollbar]:hidden"
          >
            <button
              type="button"
              aria-label="Página anterior"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground transition-opacity hover:bg-soft disabled:pointer-events-none disabled:opacity-30 sm:h-10 sm:w-10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {getVisiblePages(currentPage, totalPages).map((item, index) => {
              if (item === "ellipsis") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center text-sm text-muted-foreground sm:h-10 sm:w-10"
                    aria-hidden
                  >
                    …
                  </span>
                );
              }

              const isCurrent = item === currentPage;
              return (
                <button
                  key={item}
                  type="button"
                  aria-label={`Página ${item}`}
                  aria-current={isCurrent ? "page" : undefined}
                  onClick={() => setPage(item)}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium tracking-wide transition-all duration-300 sm:h-10 sm:w-10 ${
                    isCurrent
                      ? "bg-foreground text-white"
                      : "text-foreground hover:bg-soft"
                  }`}
                >
                  {item}
                </button>
              );
            })}

            <button
              type="button"
              aria-label="Página siguiente"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground transition-opacity hover:bg-soft disabled:pointer-events-none disabled:opacity-30 sm:h-10 sm:w-10"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        ) : null}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: ProductItem }) {
  return (
    <Link href={`/producto/${product.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-md bg-soft">
        <Image
          src={product.image}
          alt={product.alt}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium tracking-wide md:text-sm">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground">{product.price}</p>
      </div>
    </Link>
  );
}

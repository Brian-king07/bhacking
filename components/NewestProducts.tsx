"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ProductItem, ProductsSection } from "@/lib/content/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const PAGE_SIZE = 8;

const filters = [
  { id: "all", label: "Todos" },
  { id: "men", label: "Hombre" },
  { id: "women", label: "Mujer" },
] as const;

type FilterId = (typeof filters)[number]["id"];

const sortOptions = [
  { value: "popular", label: "popularidad" },
  { value: "newest", label: "más recientes" },
  { value: "price-asc", label: "precio: menor a mayor" },
  { value: "price-desc", label: "precio: mayor a menor" },
  { value: "name", label: "nombre A-Z" },
] as const;

type SortId = (typeof sortOptions)[number]["value"];

function parseFilter(value: string | null): FilterId {
  if (value === "men" || value === "women") return value;
  return "all";
}

function parseSort(value: string | null): SortId {
  if (
    value === "newest" ||
    value === "price-asc" ||
    value === "price-desc" ||
    value === "name"
  ) {
    return value;
  }
  return "popular";
}

function parsePrice(price: string): number {
  const n = Number(price.replace(/[^\d.,]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function sortProducts(items: ProductItem[], sort: SortId): ProductItem[] {
  const list = [...items];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    case "price-desc":
      return list.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    case "name":
      return list.sort((a, b) => a.name.localeCompare(b.name, "es"));
    case "newest":
      return list.reverse();
    case "popular":
    default:
      return list;
  }
}

export function NewestProducts({ content }: { content: ProductsSection }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState<FilterId>(() =>
    parseFilter(searchParams.get("filter")),
  );
  const [sort, setSort] = useState<SortId>(() =>
    parseSort(searchParams.get("sort")),
  );
  const [page, setPage] = useState(1);

  useEffect(() => {
    setActive(parseFilter(searchParams.get("filter")));
    setSort(parseSort(searchParams.get("sort")));
    setPage(1);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const base =
      active === "all"
        ? content.items
        : content.items.filter((p) => p.category === active);
    return sortProducts(base, sort);
  }, [active, content.items, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function updateParams(next: { filter?: FilterId; sort?: SortId }) {
    const params = new URLSearchParams(searchParams.toString());
    const filter = next.filter ?? active;
    const nextSort = next.sort ?? sort;

    if (filter === "all") params.delete("filter");
    else params.set("filter", filter);

    if (nextSort === "popular") params.delete("sort");
    else params.set("sort", nextSort);

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}#shop` : `${pathname}#shop`, {
      scroll: false,
    });
  }

  function changeFilter(id: FilterId) {
    setActive(id);
    setPage(1);
    updateParams({ filter: id });
  }

  function changeSort(id: SortId) {
    setSort(id);
    setPage(1);
    updateParams({ sort: id });
  }

  const title =
    active === "all"
      ? "Colección"
      : filters.find((f) => f.id === active)?.label ?? "Colección";

  return (
    <section
      id="shop"
      className="scroll-mt-24 overflow-x-clip bg-surface px-5 pb-16 pt-6 md:scroll-mt-52 md:px-8 md:pb-28 md:pt-10"
    >
      <div className="mx-auto w-full min-w-0 max-w-full lg:max-w-7xl">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:gap-10">
            <div className="flex shrink-0 items-start gap-1.5">
              <h2 className="font-display text-[1.4rem] font-bold leading-none tracking-tight uppercase md:text-4xl">
                {title}
              </h2>
              <span
                className="mt-0.5 text-[11px] font-semibold tabular-nums text-neutral-500 md:mt-1 md:text-xs"
                aria-label={`${filtered.length} productos`}
              >
                {filtered.length}
              </span>
            </div>

            {/* Full-width scroll strip — min-w-0 prevents page overflow */}
            <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain scrollbar-none">
              <div className="flex w-max items-center gap-5 pr-2 md:gap-8">
                {filters.map((filter) => {
                  const isActive = active === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => changeFilter(filter.id)}
                      className={`shrink-0 py-1 text-[11px] font-semibold tracking-wider uppercase transition-colors duration-200 md:text-xs ${
                        isActive
                          ? "text-neutral-900"
                          : "text-neutral-400 hover:text-neutral-700"
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <Select
            value={sort}
            onValueChange={(value) => {
              if (value) changeSort(parseSort(value));
            }}
            items={[...sortOptions]}
          >
            <SelectTrigger
              aria-label="Ordenar productos"
              size="sm"
              className="h-auto w-fit max-w-full shrink-0 gap-1 border-0 bg-transparent p-0 py-1 shadow-none ring-0 focus-visible:border-transparent focus-visible:ring-0 data-[size=sm]:h-auto data-[size=sm]:rounded-none dark:bg-transparent dark:hover:bg-transparent [&_svg]:size-3.5 [&_svg]:text-neutral-900"
            >
              <SelectValue className="text-[11px] font-semibold tracking-wider uppercase text-neutral-900 md:text-xs">
                {(value) => {
                  const label =
                    sortOptions.find((o) => o.value === value)?.label ??
                    "popularidad";
                  return <>Ordenar por {label}</>;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              align="start"
              alignItemWithTrigger={false}
              className="min-w-56"
            >
              {sortOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-xs uppercase tracking-wide"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6 md:mt-10 md:gap-x-4 md:gap-y-8 lg:grid-cols-4 lg:gap-x-2 lg:gap-y-6">
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
            className="mt-12 flex flex-nowrap items-center justify-center gap-0.5 overflow-x-auto whitespace-nowrap scrollbar-none sm:gap-1"
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
    <Link href={`/producto/${product.id}`} className="group block min-w-0">
      <div className="relative aspect-3/4 overflow-hidden bg-soft md:aspect-square lg:aspect-auto lg:h-[60vh] lg:w-full">
        <Image
          src={product.image}
          alt={product.alt}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width:768px) 50vw, (max-width:1024px) 50vw, 25vw"
        />
      </div>
      <div className="mt-2.5 flex items-baseline justify-between gap-2">
        <h3 className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-wide md:text-xs">
          {product.name}
        </h3>
        <p className="shrink-0 text-[11px] font-semibold text-neutral-900 md:text-xs">
          {product.price}
        </p>
      </div>
    </Link>
  );
}

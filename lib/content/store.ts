import { defaultContent } from "@/lib/content/defaults";
import { createId } from "@/lib/content/id";
import {
  COLUMNS_COUNT,
  MAX_CATEGORIES,
  type CategoryItem,
  type ColumnsItem,
  type SectionConfig,
  type SiteContent,
} from "@/lib/content/types";
import { createAnonClient, createServiceClient } from "@/lib/supabase/client";

export { createId };

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function pickItems<T>(
  incoming: T[] | undefined,
  fallback: T[],
): T[] {
  // Array vacío es válido (sección oculta). Solo usamos fallback si falta el campo.
  return Array.isArray(incoming) ? incoming : fallback;
}

/** Conserva el orden guardado e inserta builtins nuevos del default (p. ej. columns). */
function mergeSections(incoming: SectionConfig[] | undefined): SectionConfig[] {
  if (!Array.isArray(incoming)) {
    return structuredClone(defaultContent.sections);
  }

  const sections = structuredClone(incoming);
  for (const def of defaultContent.sections) {
    const alreadyThere = sections.some(
      (s) => s.id === def.id || (s.type === def.type && def.type !== "custom"),
    );
    if (alreadyThere) continue;

    if (def.type === "columns") {
      const heroIdx = sections.findIndex((s) => s.type === "hero");
      const insertAt = heroIdx >= 0 ? heroIdx + 1 : sections.length;
      const prevOrder = sections[insertAt - 1]?.order ?? -1;
      const nextOrder = sections[insertAt]?.order ?? prevOrder + 2;
      sections.splice(insertAt, 0, {
        ...structuredClone(def),
        order: (prevOrder + nextOrder) / 2,
      });
      continue;
    }

    sections.push(structuredClone(def));
  }

  return sections;
}

/** Layout fijo: siempre exactamente 3 categorías. */
function pickCategories(incoming: CategoryItem[] | undefined): CategoryItem[] {
  const fallback = defaultContent.categories.items;
  const base = Array.isArray(incoming) && incoming.length > 0 ? incoming : fallback;
  const items = base.slice(0, MAX_CATEGORIES);
  while (items.length < MAX_CATEGORIES) {
    items.push(structuredClone(fallback[items.length]!));
  }
  return items;
}

/** Layout fijo: siempre exactamente 10 imágenes en Columns. */
function pickColumns(incoming: ColumnsItem[] | undefined): ColumnsItem[] {
  const fallback = defaultContent.columns.items;
  const base = Array.isArray(incoming) && incoming.length > 0 ? incoming : fallback;
  const items = base.slice(0, COLUMNS_COUNT).map((item, i) => ({
    id: item.id || fallback[i]?.id || `col-${i + 1}`,
    image: item.image || fallback[i]?.image || "/1.jpg",
    alt: item.alt || fallback[i]?.alt || `Columns ${i + 1}`,
  }));
  while (items.length < COLUMNS_COUNT) {
    items.push(structuredClone(fallback[items.length]!));
  }
  return items;
}

function mergeWithDefaults(parsed: Partial<SiteContent> | null): SiteContent {
  if (!parsed) return structuredClone(defaultContent);
  return {
    ...defaultContent,
    ...parsed,
    brand: parsed.brand || defaultContent.brand,
    navLinks: pickItems(parsed.navLinks, defaultContent.navLinks),
    contact: { ...defaultContent.contact, ...parsed.contact },
    hero: { ...defaultContent.hero, ...parsed.hero },
    columns: {
      items: pickColumns(parsed.columns?.items),
    },
    categories: {
      ...defaultContent.categories,
      ...parsed.categories,
      items: pickCategories(parsed.categories?.items),
    },
    products: {
      ...defaultContent.products,
      ...parsed.products,
      items: pickItems(parsed.products?.items, defaultContent.products.items),
    },
    featured: {
      ...defaultContent.featured,
      ...parsed.featured,
      items: pickItems(parsed.featured?.items, defaultContent.featured.items),
    },
    popular: {
      ...defaultContent.popular,
      ...parsed.popular,
      items: pickItems(parsed.popular?.items, defaultContent.popular.items),
    },
    footer: {
      ...defaultContent.footer,
      ...parsed.footer,
      sitemapLinks: pickItems(
        parsed.footer?.sitemapLinks,
        defaultContent.footer.sitemapLinks,
      ),
      availableLinks: pickItems(
        parsed.footer?.availableLinks,
        defaultContent.footer.availableLinks,
      ),
      termsLinks: pickItems(
        parsed.footer?.termsLinks,
        defaultContent.footer.termsLinks ?? [],
      ),
    },
    sections: mergeSections(parsed.sections),
  };
}

export async function getContent(): Promise<SiteContent> {
  if (!hasSupabaseEnv()) {
    console.warn(
      "[supabase] Faltan NEXT_PUBLIC_SUPABASE_URL / ANON_KEY. Usando defaults locales.",
    );
    return structuredClone(defaultContent);
  }

  const supabase = createAnonClient();
  const { data, error } = await supabase.rpc("get_site_content");

  if (error) {
    console.error("[supabase] get_site_content:", error.message);
    throw new Error(
      `No se pudo leer el contenido desde Supabase: ${error.message}. ¿Corriste supabase/schema.sql?`,
    );
  }

  return mergeWithDefaults(data as Partial<SiteContent> | null);
}

export async function writeContent(content: SiteContent): Promise<SiteContent> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !hasSupabaseEnv()) {
    throw new Error(
      "Configura NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY en .env.local",
    );
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("replace_site_content", {
    payload: content,
  });

  if (error) {
    console.error("[supabase] replace_site_content:", error.message);
    throw new Error(
      `No se pudo guardar el contenido en Supabase: ${error.message}`,
    );
  }

  return mergeWithDefaults(data as Partial<SiteContent> | null);
}

export async function updateContent(
  updater: (current: SiteContent) => SiteContent | Promise<SiteContent>,
): Promise<SiteContent> {
  const current = await getContent();
  const next = await updater(current);
  return writeContent(next);
}

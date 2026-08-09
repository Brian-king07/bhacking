import { defaultContent } from "@/lib/content/defaults";
import { createId } from "@/lib/content/id";
import {
  MAX_CATEGORIES,
  type CategoryItem,
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

function mergeWithDefaults(parsed: Partial<SiteContent> | null): SiteContent {
  if (!parsed) return structuredClone(defaultContent);
  return {
    ...defaultContent,
    ...parsed,
    brand: parsed.brand || defaultContent.brand,
    navLinks: pickItems(parsed.navLinks, defaultContent.navLinks),
    contact: { ...defaultContent.contact, ...parsed.contact },
    hero: { ...defaultContent.hero, ...parsed.hero },
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
    sections: pickItems(parsed.sections, defaultContent.sections),
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

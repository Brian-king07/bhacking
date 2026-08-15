import { defaultContent } from "@/lib/content/defaults";
import { siteHref } from "@/lib/content/hrefs";

export type PublicLink = { href: string; label: string };

const DEAD_SECTION_RE = /#(categories|collection|featured|popular|columns)\b/i;
const FAKE_CATEGORY_LABEL_RE =
  /categor(i|í)as|colecci(o|ó)n(es)?|novedades|pantalones|chalecos|camisas|sneakers/i;

function isPlaceholderHref(href: string) {
  const value = href?.trim() ?? "";
  return !value || value === "#";
}

function hasShopFilter(href: string) {
  return /[?&]filter=(men|women)\b/i.test(href);
}

/** Menú: quita huecos y secciones muertas; deja destinos reales. */
export function sanitizeNavLinks(links: PublicLink[] | undefined): PublicLink[] {
  if (!Array.isArray(links) || links.length === 0) {
    return structuredClone(defaultContent.navLinks);
  }

  const out: PublicLink[] = [];
  const seen = new Set<string>();

  for (const link of links) {
    if (isPlaceholderHref(link.href)) continue;

    let href = link.href.trim();
    let label = link.label.trim();
    if (!label) continue;

    if (DEAD_SECTION_RE.test(href) || FAKE_CATEGORY_LABEL_RE.test(label)) {
      href = "#shop";
      if (/colecci|novedades|categor/i.test(label)) label = "Tienda";
    }

    const key = `${siteHref(href)}|${label.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ href, label });
  }

  return out.length > 0 ? out : structuredClone(defaultContent.navLinks);
}

/** Mapa del sitio: solo Inicio / Productos (sin categorías/colección fantasma). */
export function sanitizeSitemapLinks(
  links: PublicLink[] | undefined,
): PublicLink[] {
  if (!Array.isArray(links) || links.length === 0) {
    return structuredClone(defaultContent.footer.sitemapLinks);
  }

  const out: PublicLink[] = [];
  const seen = new Set<string>();

  for (const link of links) {
    if (isPlaceholderHref(link.href)) continue;
    if (DEAD_SECTION_RE.test(link.href)) continue;
    if (/categor(i|í)as|colecci(o|ó)n/i.test(link.label)) continue;

    const href = link.href.trim();
    const label = link.label.trim();
    if (!label) continue;

    const key = siteHref(href);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ href, label });
  }

  return out.length > 0
    ? out
    : structuredClone(defaultContent.footer.sitemapLinks);
}

/**
 * Columna tienda: si no hay filtros reales (hombre/mujer),
 * reemplaza “Pantalones/Chalecos…” que solo iban a #shop.
 */
export function sanitizeAvailableLinks(
  links: PublicLink[] | undefined,
): PublicLink[] {
  if (!Array.isArray(links) || links.length === 0) {
    return structuredClone(defaultContent.footer.availableLinks);
  }

  const usable = links.filter(
    (link) => !isPlaceholderHref(link.href) && link.label.trim(),
  );
  const hasFilters = usable.some((link) => hasShopFilter(link.href));
  if (!hasFilters) {
    return structuredClone(defaultContent.footer.availableLinks);
  }

  return usable;
}

/** Términos con href="#" no van a ningún lado → se ocultan. */
export function sanitizeTermsLinks(
  links: PublicLink[] | undefined,
): PublicLink[] {
  if (!Array.isArray(links)) return [];
  return links.filter(
    (link) => !isPlaceholderHref(link.href) && link.label.trim(),
  );
}

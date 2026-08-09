/** Normaliza hrefs del CMS para que funcionen desde cualquier ruta (p. ej. /producto/x). */
export function siteHref(href: string): string {
  const value = href?.trim() || "/";
  if (value === "#") return "/";
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    value.startsWith("/")
  ) {
    return value;
  }
  if (value.startsWith("#")) return `/${value}`;
  return value;
}

export function shopHref(filter?: "all" | "men" | "women"): string {
  if (!filter || filter === "all") return "/#shop";
  return `/?filter=${filter}#shop`;
}

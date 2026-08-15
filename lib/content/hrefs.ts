/** Anclas de secciones retiradas → destino vivo en la home. */
const OBSOLETE_HASH: Record<string, string> = {
  categories: "shop",
  collection: "shop",
  featured: "shop",
  popular: "shop",
  columns: "shop",
  hero: "home",
};

function remapHash(hash: string): string {
  const id = hash.replace(/^#/, "").toLowerCase();
  if (!id) return "";
  const next = OBSOLETE_HASH[id] ?? id;
  return `#${next}`;
}

/** Normaliza hrefs del CMS para que funcionen desde cualquier ruta (p. ej. /producto/x). */
export function siteHref(href: string): string {
  const value = href?.trim() || "/";
  if (value === "#" || value === "") return "/";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:")
  ) {
    return value;
  }

  if (value.startsWith("/?")) {
    const hashIndex = value.indexOf("#");
    if (hashIndex >= 0) {
      const path = value.slice(0, hashIndex);
      return `${path}${remapHash(value.slice(hashIndex))}`;
    }
    return value;
  }

  if (value.startsWith("/#") || value.startsWith("#")) {
    const hash = value.startsWith("/#") ? value.slice(1) : value;
    const remapped = remapHash(hash);
    if (!remapped || remapped === "#home") return "/";
    return `/${remapped}`;
  }

  if (value.startsWith("/")) {
    const hashIndex = value.indexOf("#");
    if (hashIndex >= 0) {
      const path = value.slice(0, hashIndex);
      const remapped = remapHash(value.slice(hashIndex));
      if (path === "/" && (!remapped || remapped === "#home")) return "/";
      return `${path}${remapped}`;
    }
    return value;
  }

  if (value.startsWith("#")) {
    const remapped = remapHash(value);
    if (!remapped || remapped === "#home") return "/";
    return `/${remapped}`;
  }

  return value;
}

export function shopHref(filter?: "all" | "men" | "women"): string {
  if (!filter || filter === "all") return "/#shop";
  return `/?filter=${filter}#shop`;
}

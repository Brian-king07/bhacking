"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { createId, getContent, updateContent } from "@/lib/content/store";
import { MIN_CATEGORIES, type SiteContent } from "@/lib/content/types";

export type ActionResult = {
  ok: boolean;
  error?: string;
};

function revalidateSite() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin", "layout");
}

async function safeMutate(
  updater: (current: SiteContent) => SiteContent | Promise<SiteContent>,
): Promise<ActionResult> {
  try {
    await requireSession();
    await updateContent(updater);
    revalidateSite();
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error inesperado",
    };
  }
}

export async function saveHero(data: SiteContent["hero"]): Promise<ActionResult> {
  return safeMutate((c) => ({ ...c, hero: data }));
}

export async function saveCategoriesSection(
  data: Omit<SiteContent["categories"], "items">,
): Promise<ActionResult> {
  return safeMutate((c) => ({
    ...c,
    categories: { ...c.categories, ...data },
  }));
}

export async function upsertCategory(
  item: SiteContent["categories"]["items"][number],
): Promise<ActionResult> {
  return safeMutate((c) => {
    const items = [...c.categories.items];
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= 0) items[idx] = item;
    else items.push(item);

    if (item.large) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id !== item.id) items[i] = { ...items[i], large: false };
      }
    } else if (!items.some((i) => i.large) && items.length > 0) {
      items[0] = { ...items[0], large: true };
    }

    return { ...c, categories: { ...c.categories, items } };
  });
}

export async function addCategory(): Promise<ActionResult> {
  return safeMutate((c) => {
    const item = {
      id: createId("cat"),
      title: "Nueva categoría",
      cta: "Comprar",
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80",
      alt: "Nueva categoría",
      large: false,
    };
    return {
      ...c,
      categories: { ...c.categories, items: [...c.categories.items, item] },
    };
  });
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    await requireSession();
    const content = await getContent();
    if (content.categories.items.length <= MIN_CATEGORIES) {
      return {
        ok: false,
        error: `Debes mantener al menos ${MIN_CATEGORIES} categorías.`,
      };
    }
    if (!content.categories.items.some((i) => i.id === id)) {
      return { ok: false, error: "Categoría no encontrada." };
    }

    await updateContent((c) => {
      let items = c.categories.items.filter((i) => i.id !== id);
      if (!items.some((i) => i.large) && items[0]) {
        items = [{ ...items[0], large: true }, ...items.slice(1)];
      }
      return { ...c, categories: { ...c.categories, items } };
    });
    revalidateSite();
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error inesperado",
    };
  }
}

export async function saveProductsSection(
  data: Omit<SiteContent["products"], "items">,
): Promise<ActionResult> {
  return safeMutate((c) => ({
    ...c,
    products: { ...c.products, ...data },
  }));
}

export async function upsertProduct(
  item: SiteContent["products"]["items"][number],
): Promise<ActionResult> {
  return safeMutate((c) => {
    const items = [...c.products.items];
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= 0) items[idx] = item;
    else items.push(item);
    return { ...c, products: { ...c.products, items } };
  });
}

export async function addProduct(): Promise<ActionResult> {
  return safeMutate((c) => {
    const item = {
      id: createId("prod"),
      name: "Nuevo producto",
      price: "$0.00",
      category: "men" as const,
      image:
        "https://images.unsplash.com/photo-1523381216714-17e7e681f91e?auto=format&fit=crop&w=800&q=80",
      alt: "Nuevo producto",
    };
    return {
      ...c,
      products: { ...c.products, items: [...c.products.items, item] },
    };
  });
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  return safeMutate((c) => ({
    ...c,
    products: {
      ...c.products,
      items: c.products.items.filter((i) => i.id !== id),
    },
  }));
}

export async function saveFeaturedSection(
  data: Omit<SiteContent["featured"], "items">,
): Promise<ActionResult> {
  return safeMutate((c) => ({
    ...c,
    featured: { ...c.featured, ...data },
  }));
}

export async function upsertFeatured(
  item: SiteContent["featured"]["items"][number],
): Promise<ActionResult> {
  return safeMutate((c) => {
    const items = [...c.featured.items];
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= 0) items[idx] = item;
    else items.push(item);
    return { ...c, featured: { ...c.featured, items } };
  });
}

export async function addFeatured(): Promise<ActionResult> {
  return safeMutate((c) => {
    const item = {
      id: createId("feat"),
      handle: "@nuevo",
      image:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
      alt: "Nueva colección destacada",
    };
    return {
      ...c,
      featured: { ...c.featured, items: [...c.featured.items, item] },
    };
  });
}

export async function deleteFeatured(id: string): Promise<ActionResult> {
  return safeMutate((c) => ({
    ...c,
    featured: {
      ...c.featured,
      items: c.featured.items.filter((i) => i.id !== id),
    },
  }));
}

export async function savePopularSection(
  data: Pick<SiteContent["popular"], "title" | "portraitImage" | "portraitAlt">,
): Promise<ActionResult> {
  return safeMutate((c) => ({
    ...c,
    popular: { ...c.popular, ...data },
  }));
}

export async function upsertPopularItem(
  item: SiteContent["popular"]["items"][number],
): Promise<ActionResult> {
  return safeMutate((c) => {
    const items = [...c.popular.items];
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= 0) items[idx] = item;
    else items.push(item);
    return { ...c, popular: { ...c.popular, items } };
  });
}

export async function addPopularItem(): Promise<ActionResult> {
  return safeMutate((c) => {
    const item = {
      id: createId("pop"),
      name: "Nuevo destacado",
      price: "$0.00",
      description: "Descripción del producto popular.",
      image:
        "https://images.unsplash.com/photo-1523381216714-17e7e681f91e?auto=format&fit=crop&w=700&q=80",
      alt: "Nuevo destacado",
    };
    return {
      ...c,
      popular: { ...c.popular, items: [...c.popular.items, item] },
    };
  });
}

export async function deletePopularItem(id: string): Promise<ActionResult> {
  return safeMutate((c) => ({
    ...c,
    popular: {
      ...c.popular,
      items: c.popular.items.filter((i) => i.id !== id),
    },
  }));
}

export async function saveFooter(data: SiteContent["footer"]): Promise<ActionResult> {
  return safeMutate((c) => ({ ...c, footer: data }));
}

export async function saveBrandAndNav(data: {
  brand: string;
  navLinks: SiteContent["navLinks"];
}): Promise<ActionResult> {
  return safeMutate((c) => ({
    ...c,
    brand: data.brand,
    navLinks: data.navLinks,
  }));
}

export async function toggleSectionVisible(id: string): Promise<ActionResult> {
  return safeMutate((c) => ({
    ...c,
    sections: c.sections.map((s) =>
      s.id === id ? { ...s, visible: !s.visible } : s,
    ),
  }));
}

export async function moveSection(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  return safeMutate((c) => {
    const sections = [...c.sections].sort((a, b) => a.order - b.order);
    const idx = sections.findIndex((s) => s.id === id);
    if (idx < 0) return c;
    const swapWith = direction === "up" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= sections.length) return c;
    const tmp = sections[idx].order;
    sections[idx] = { ...sections[idx], order: sections[swapWith].order };
    sections[swapWith] = { ...sections[swapWith], order: tmp };
    return { ...c, sections };
  });
}

export async function addCustomSection(): Promise<ActionResult> {
  return safeMutate((c) => {
    const maxOrder = c.sections.reduce((m, s) => Math.max(m, s.order), 0);
    const section = {
      id: createId("sec"),
      type: "custom" as const,
      label: "Sección personalizada",
      visible: true,
      order: maxOrder + 1,
      custom: {
        title: "Nueva sección",
        description: "Descripción de la sección personalizada.",
        image:
          "https://images.unsplash.com/photo-1441984904996-e0b14ba4ad63?auto=format&fit=crop&w=1400&q=80",
        ctaLabel: "Ver más",
        ctaHref: "#shop",
      },
    };
    return { ...c, sections: [...c.sections, section] };
  });
}

export async function updateCustomSection(
  id: string,
  data: {
    label: string;
    custom: NonNullable<SiteContent["sections"][number]["custom"]>;
  },
): Promise<ActionResult> {
  return safeMutate((c) => ({
    ...c,
    sections: c.sections.map((s) =>
      s.id === id && s.type === "custom"
        ? { ...s, label: data.label, custom: data.custom }
        : s,
    ),
  }));
}

export async function deleteSection(id: string): Promise<ActionResult> {
  try {
    await requireSession();
    const content = await getContent();
    const section = content.sections.find((s) => s.id === id);
    if (!section) return { ok: false, error: "Sección no encontrada." };
    if (section.type !== "custom") {
      return {
        ok: false,
        error: "Las secciones base no se eliminan. Ocúltalas en su lugar.",
      };
    }
    await updateContent((c) => ({
      ...c,
      sections: c.sections.filter((s) => s.id !== id),
    }));
    revalidateSite();
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error inesperado",
    };
  }
}

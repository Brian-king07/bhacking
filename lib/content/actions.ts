"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { createId, updateContent } from "@/lib/content/store";
import type { SiteContent } from "@/lib/content/types";

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
      price: "€0.00",
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

export async function saveContact(
  data: SiteContent["contact"],
): Promise<ActionResult> {
  return safeMutate((c) => ({ ...c, contact: data }));
}

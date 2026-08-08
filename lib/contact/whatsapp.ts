import type { ContactSettings, ProductItem } from "@/lib/content/types";

export function buildWhatsAppUrl(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  if (!text.trim()) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function buildInstagramUrl(handle: string): string {
  const clean = handle.replace(/^@/, "").trim();
  return `https://instagram.com/${clean}`;
}

export function fillContactTemplate(
  template: string,
  vars: { name?: string; price?: string },
): string {
  return template
    .replaceAll("{name}", vars.name ?? "")
    .replaceAll("{nombre}", vars.name ?? "")
    .replaceAll("{price}", vars.price ?? "")
    .replaceAll("{precio}", vars.price ?? "");
}

export function productWhatsAppUrl(
  contact: ContactSettings,
  product: Pick<ProductItem, "name" | "price">,
): string {
  const text = fillContactTemplate(contact.whatsappMessageTemplate, {
    name: product.name,
    price: product.price,
  });
  return buildWhatsAppUrl(contact.whatsappNumber, text);
}

export function generalWhatsAppUrl(contact: ContactSettings): string {
  const text = fillContactTemplate(contact.generalMessageTemplate, {});
  return buildWhatsAppUrl(contact.whatsappNumber, text);
}

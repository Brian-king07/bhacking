import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://bhacking.com";

  try {
    const content = await getContent();
    const products = content.products.items.map((p) => ({
      url: `${base}/producto/${p.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [
      {
        url: base,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      ...products,
    ];
  } catch {
    return [
      {
        url: base,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
    ];
  }
}

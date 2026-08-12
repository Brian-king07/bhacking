export const MEDIA_BUCKETS = [
  "hero",
  "columns",
  "categories",
  "products",
  "featured",
  "popular",
  "sections",
  "media",
] as const;

export type MediaBucket = (typeof MEDIA_BUCKETS)[number];

export function isMediaBucket(value: string): value is MediaBucket {
  return (MEDIA_BUCKETS as readonly string[]).includes(value);
}

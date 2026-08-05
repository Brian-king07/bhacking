"use client";

import { useState } from "react";
import type { MediaBucket } from "@/lib/supabase/client";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  bucket?: MediaBucket;
};

export function ImageField({
  value,
  onChange,
  label = "Imagen",
  bucket = "media",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("bucket", bucket);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Error al subir");
      }
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">{label}</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-28 w-40 rounded-lg object-cover bg-neutral-100"
          />
        ) : (
          <div className="flex h-28 w-40 items-center justify-center rounded-lg bg-neutral-100 text-xs text-neutral-400">
            Sin imagen
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="URL de imagen o sube un archivo"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              disabled={uploading}
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
            {uploading ? "Subiendo…" : `Subir a ${bucket}`}
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}

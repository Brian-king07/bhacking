"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { notifyError } from "@/lib/admin/feedback";
import type { MediaBucket } from "@/lib/supabase/buckets";

export type ImageFieldHandle = {
  /** Sube el archivo pendiente (si hay) y devuelve la URL final a guardar. */
  commit: () => Promise<string>;
};

type Props = {
  value: string;
  onChange: (url: string) => void;
  /** Avisa si hay un archivo local pendiente de subir al guardar. */
  onPendingChange?: (hasPending: boolean) => void;
  label?: string;
  bucket?: MediaBucket;
};

export const ImageField = forwardRef<ImageFieldHandle, Props>(function ImageField(
  { value, onChange, onPendingChange, label = "Imagen", bucket = "media" },
  ref,
) {
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);

  function clearPreview() {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    setPreviewUrl(null);
  }

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  useEffect(() => {
    onPendingChange?.(Boolean(pendingFile));
  }, [pendingFile, onPendingChange]);

  useImperativeHandle(ref, () => ({
    async commit() {
      if (!pendingFile) return value;

      setUploading(true);
      setError(null);
      try {
        const body = new FormData();
        body.append("file", pendingFile);
        body.append("bucket", bucket);
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          throw new Error(data.error || "Error al subir");
        }
        clearPreview();
        setPendingFile(null);
        onChange(data.url);
        return data.url;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error al subir";
        setError(msg);
        notifyError(msg);
        throw e;
      } finally {
        setUploading(false);
      }
    },
  }));

  function onFile(file: File | null) {
    if (!file) return;
    setError(null);
    clearPreview();
    const objectUrl = URL.createObjectURL(file);
    previewRef.current = objectUrl;
    setPreviewUrl(objectUrl);
    setPendingFile(file);
  }

  function onUrlChange(next: string) {
    clearPreview();
    setPendingFile(null);
    onChange(next);
  }

  const displaySrc = previewUrl || value;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">{label}</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        {displaySrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displaySrc}
            alt=""
            className="h-28 w-40 rounded-lg bg-neutral-100 object-cover"
          />
        ) : (
          <div className="flex h-28 w-40 items-center justify-center rounded-lg bg-neutral-100 text-xs text-neutral-400">
            Sin imagen
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input
            type="url"
            value={pendingFile ? "" : value}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder={
              pendingFile
                ? "Imagen lista — se subirá al guardar"
                : "URL de imagen o elige un archivo"
            }
            disabled={Boolean(pendingFile) || uploading}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900 disabled:bg-neutral-50"
          />
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={uploading}
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              />
              {uploading ? "Subiendo…" : "Elegir archivo"}
            </label>
            {pendingFile ? (
              <span className="text-xs text-emerald-800">
                Pendiente de guardar · {pendingFile.name}
              </span>
            ) : null}
            {pendingFile ? (
              <button
                type="button"
                className="text-xs text-neutral-500 underline-offset-2 hover:underline"
                onClick={() => {
                  clearPreview();
                  setPendingFile(null);
                }}
              >
                Quitar
              </button>
            ) : null}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
});

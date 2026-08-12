"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { notifyError } from "@/lib/admin/feedback";
import type { MediaBucket } from "@/lib/supabase/buckets";
import { adminBtnPrimary } from "@/lib/admin/styles";
import { cn } from "@/lib/utils";

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
  /** Preview más alto (útil para imágenes verticales). */
  tall?: boolean;
  /** Contenido debajo de “Elegir archivo” (ej. texto alt). */
  belowControls?: ReactNode;
};

export const ImageField = forwardRef<ImageFieldHandle, Props>(function ImageField(
  {
    value,
    onChange,
    onPendingChange,
    label = "Imagen",
    bucket = "media",
    tall = false,
    belowControls,
  },
  ref,
) {
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);
  const onPendingChangeRef = useRef(onPendingChange);
  onPendingChangeRef.current = onPendingChange;

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
    onPendingChangeRef.current?.(Boolean(pendingFile));
  }, [pendingFile]);

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
  const previewClass = tall
    ? "h-52 w-36 rounded-lg bg-neutral-100 object-cover"
    : "h-28 w-40 rounded-lg bg-neutral-100 object-cover md:h-48 md:w-44";
  const emptyClass = tall
    ? "flex h-52 w-36 items-center justify-center rounded-lg bg-neutral-100 text-xs text-neutral-400"
    : "flex h-28 w-40 items-center justify-center rounded-lg bg-neutral-100 text-xs text-neutral-400 md:h-48 md:w-44";

  return (
    <div className="space-y-2 w-full">
      <label className="block text-sm font-medium text-neutral-700">{label}</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        {displaySrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displaySrc}
            alt=""
            className={previewClass}
          />
        ) : (
          <div className={emptyClass}>
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
            className="w-full rounded-lg bg-neutral-100 px-3 py-2 text-base outline-none disabled:bg-neutral-50 md:text-sm"
          />
          <div className="flex w-full flex-col gap-2">
            <label
              className={cn(
                adminBtnPrimary,
                "w-full cursor-pointer gap-2 px-3 py-2 text-sm",
              )}
            >
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
                className="admin-text-btn self-start text-xs text-neutral-500 underline-offset-2 hover:underline"
                onClick={() => {
                  clearPreview();
                  setPendingFile(null);
                }}
              >
                Quitar
              </button>
            ) : null}
            {belowControls}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
});

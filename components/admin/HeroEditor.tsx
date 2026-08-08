"use client";

import { useRef, useState, useTransition } from "react";
import type { HeroContent } from "@/lib/content/types";
import { saveHero } from "@/lib/content/actions";
import { ImageField, type ImageFieldHandle } from "@/components/admin/ImageField";
import { isDirty } from "@/lib/admin/dirty";
import { notifyError, notifyResult } from "@/lib/admin/feedback";
import { Button } from "@/components/ui/button";

export function HeroEditor({ initial }: { initial: HeroContent }) {
  const [data, setData] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [mobilePending, setMobilePending] = useState(false);
  const [desktopPending, setDesktopPending] = useState(false);
  const [pending, startTransition] = useTransition();
  const imageRef = useRef<ImageFieldHandle>(null);
  const imageDesktopRef = useRef<ImageFieldHandle>(null);
  const dirty = mobilePending || desktopPending || isDirty(data, saved);

  function update<K extends keyof HeroContent>(key: K, value: HeroContent[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function onSave() {
    startTransition(async () => {
      try {
        const image = (await imageRef.current?.commit()) ?? data.image;
        const imageDesktop =
          (await imageDesktopRef.current?.commit()) ?? data.imageDesktop;
        const next = { ...data, image, imageDesktop };
        const result = await saveHero(next);
        if (result.ok) {
          setData(next);
          setSaved(next);
        }
        notifyResult(result, "Hero guardado");
      } catch {
        notifyError("No se pudo subir la imagen");
      }
    });
  }

  return (
    <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6">
      <ImageField
        ref={imageRef}
        label="Imagen mobile (vertical)"
        value={data.image}
        onChange={(url) => update("image", url)}
        onPendingChange={setMobilePending}
        bucket="hero"
      />
      <ImageField
        ref={imageDesktopRef}
        label="Imagen desktop (horizontal)"
        value={data.imageDesktop}
        onChange={(url) => update("imageDesktop", url)}
        onPendingChange={setDesktopPending}
        bucket="hero"
      />
      {(
        [
          ["brand", "Marca en hero"],
          ["headline", "Titular"],
          ["subheadline", "Subtítulo"],
          ["primaryCta", "CTA principal"],
          ["secondaryCta", "CTA secundario"],
          ["sideNote", "Nota lateral"],
        ] as const
      ).map(([key, label]) => (
        <Field
          key={key}
          label={label}
          value={data[key]}
          onChange={(v) => update(key, v)}
          multiline={key === "subheadline"}
        />
      ))}
      <SaveBar pending={pending} dirty={dirty} onSave={onSave} />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const className =
    "w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900";
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {multiline ? (
        <textarea
          rows={3}
          className={className}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={className}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

export function SaveBar({
  pending,
  onSave,
  label = "Guardar cambios",
  dirty = true,
}: {
  pending: boolean;
  onSave: () => void;
  label?: string;
  dirty?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-5">
      <Button
        type="button"
        onClick={onSave}
        disabled={pending || !dirty}
        size="lg"
        className="rounded-xl px-5"
      >
        {pending ? "Guardando…" : label}
      </Button>
    </div>
  );
}

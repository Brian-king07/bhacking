"use client";

import { useState, useTransition } from "react";
import type { HeroContent } from "@/lib/content/types";
import { saveHero } from "@/lib/content/actions";
import { ImageField } from "@/components/admin/ImageField";

export function HeroEditor({ initial }: { initial: HeroContent }) {
  const [data, setData] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof HeroContent>(key: K, value: HeroContent[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function onSave() {
    startTransition(async () => {
      const result = await saveHero(data);
      setMessage(result.ok ? "Hero guardado." : result.error || "Error");
    });
  }

  return (
    <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6">
      <ImageField
        label="Foto del hero"
        value={data.image}
        onChange={(url) => update("image", url)}
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
      <SaveBar pending={pending} message={message} onSave={onSave} />
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
  message,
  onSave,
}: {
  pending: boolean;
  message: string | null;
  onSave: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-5">
      <button
        type="button"
        onClick={onSave}
        disabled={pending}
        className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar cambios"}
      </button>
      {message ? <p className="text-sm text-neutral-500">{message}</p> : null}
    </div>
  );
}

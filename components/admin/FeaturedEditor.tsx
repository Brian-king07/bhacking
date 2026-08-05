"use client";

import { useState, useTransition } from "react";
import {
  addFeatured,
  deleteFeatured,
  saveFeaturedSection,
  upsertFeatured,
} from "@/lib/content/actions";
import type { FeaturedItem, FeaturedSection } from "@/lib/content/types";
import { ImageField } from "@/components/admin/ImageField";
import { SaveBar } from "@/components/admin/HeroEditor";

export function FeaturedEditor({ initial }: { initial: FeaturedSection }) {
  const [section, setSection] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function saveMeta() {
    startTransition(async () => {
      const result = await saveFeaturedSection({
        title: section.title,
        description: section.description,
        viewAllLabel: section.viewAllLabel,
      });
      setMessage(result.ok ? "Sección guardada." : result.error || "Error");
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
        <Field
          label="Título"
          value={section.title}
          onChange={(v) => setSection((s) => ({ ...s, title: v }))}
        />
        <Field
          label="Descripción"
          value={section.description}
          onChange={(v) => setSection((s) => ({ ...s, description: v }))}
          multiline
        />
        <Field
          label="Link ver todas"
          value={section.viewAllLabel}
          onChange={(v) => setSection((s) => ({ ...s, viewAllLabel: v }))}
        />
        <SaveBar pending={pending} message={message} onSave={saveMeta} />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() =>
            startTransition(async () => {
              const result = await addFeatured();
              if (result.ok) window.location.reload();
              else setMessage(result.error || "Error");
            })
          }
          className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white"
        >
          Agregar look
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {section.items.map((item) => (
          <FeaturedCard
            key={item.id}
            item={item}
            pending={pending}
            onSave={(next) =>
              startTransition(async () => {
                const result = await upsertFeatured(next);
                if (result.ok) {
                  setSection((s) => ({
                    ...s,
                    items: s.items.map((i) => (i.id === next.id ? next : i)),
                  }));
                  setMessage("Look guardado.");
                } else setMessage(result.error || "Error");
              })
            }
            onDelete={(id) => {
              if (!confirm("¿Eliminar este look?")) return;
              startTransition(async () => {
                const result = await deleteFeatured(id);
                if (result.ok) {
                  setSection((s) => ({
                    ...s,
                    items: s.items.filter((i) => i.id !== id),
                  }));
                  setMessage("Look eliminado.");
                } else setMessage(result.error || "Error");
              });
            }}
          />
        ))}
      </div>
    </div>
  );
}

function FeaturedCard({
  item,
  pending,
  onSave,
  onDelete,
}: {
  item: FeaturedItem;
  pending: boolean;
  onSave: (item: FeaturedItem) => void;
  onDelete: (id: string) => void;
}) {
  const [data, setData] = useState(item);
  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex justify-between">
        <h3 className="font-medium">{data.handle}</h3>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="text-sm text-red-600 hover:underline"
        >
          Eliminar
        </button>
      </div>
      <ImageField
        value={data.image}
        onChange={(url) => setData((d) => ({ ...d, image: url }))}
        bucket="featured"
      />
      <Field
        label="Handle"
        value={data.handle}
        onChange={(v) => setData((d) => ({ ...d, handle: v }))}
      />
      <Field
        label="Alt"
        value={data.alt}
        onChange={(v) => setData((d) => ({ ...d, alt: v }))}
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => onSave(data)}
        className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        Guardar
      </button>
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

"use client";

import { useRef, useState, useTransition } from "react";
import {
  addFeatured,
  deleteFeatured,
  saveFeaturedSection,
  upsertFeatured,
} from "@/lib/content/actions";
import type { FeaturedItem, FeaturedSection } from "@/lib/content/types";
import { ImageField, type ImageFieldHandle } from "@/components/admin/ImageField";
import { SaveBar } from "@/components/admin/HeroEditor";
import { isDirty } from "@/lib/admin/dirty";
import { adminField } from "@/lib/admin/styles";
import { notifyError, notifyResult, notifySuccess } from "@/lib/admin/feedback";

function sectionMeta(section: FeaturedSection) {
  return {
    title: section.title,
    description: section.description,
    viewAllLabel: section.viewAllLabel,
  };
}

export function FeaturedEditor({ initial }: { initial: FeaturedSection }) {
  const [section, setSection] = useState(initial);
  const [savedMeta, setSavedMeta] = useState(sectionMeta(initial));
  const [pending, startTransition] = useTransition();
  const metaDirty = isDirty(sectionMeta(section), savedMeta);

  function saveMeta() {
    startTransition(async () => {
      const meta = sectionMeta(section);
      const result = await saveFeaturedSection(meta);
      if (result.ok) setSavedMeta(meta);
      notifyResult(result, "Sección guardada");
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
        <SaveBar pending={pending} dirty={metaDirty} onSave={saveMeta} />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() =>
            startTransition(async () => {
              const result = await addFeatured();
              if (result.ok) {
                notifySuccess("Look agregado");
                window.location.reload();
              } else notifyError(result.error || "Error");
            })
          }
          className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white"
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
                  notifySuccess("Look guardado");
                } else notifyError(result.error || "Error");
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
                  notifySuccess("Look eliminado");
                } else notifyError(result.error || "Error");
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
  const [imagePending, setImagePending] = useState(false);
  const imageRef = useRef<ImageFieldHandle>(null);
  const dirty = imagePending || isDirty(data, item);

  async function handleSave() {
    try {
      const image = (await imageRef.current?.commit()) ?? data.image;
      const next = { ...data, image };
      setData(next);
      onSave(next);
    } catch {
      notifyError("No se pudo subir la imagen");
    }
  }

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
        ref={imageRef}
        value={data.image}
        onChange={(url) => setData((d) => ({ ...d, image: url }))}
        onPendingChange={setImagePending}
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
        disabled={!dirty || pending}
        onClick={handleSave}
        className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
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
    adminField;
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

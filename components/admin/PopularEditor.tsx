"use client";

import { useRef, useState, useTransition } from "react";
import {
  addPopularItem,
  deletePopularItem,
  savePopularSection,
  upsertPopularItem,
} from "@/lib/content/actions";
import type { PopularItem, PopularSection } from "@/lib/content/types";
import { ImageField, type ImageFieldHandle } from "@/components/admin/ImageField";
import { SaveBar } from "@/components/admin/HeroEditor";
import { isDirty } from "@/lib/admin/dirty";
import { adminField } from "@/lib/admin/styles";
import { notifyError, notifyResult, notifySuccess } from "@/lib/admin/feedback";

function sectionMeta(section: PopularSection) {
  return {
    title: section.title,
    portraitImage: section.portraitImage,
    portraitAlt: section.portraitAlt,
  };
}

export function PopularEditor({ initial }: { initial: PopularSection }) {
  const [section, setSection] = useState(initial);
  const [savedMeta, setSavedMeta] = useState(sectionMeta(initial));
  const [portraitPending, setPortraitPending] = useState(false);
  const [pending, startTransition] = useTransition();
  const portraitRef = useRef<ImageFieldHandle>(null);
  const metaDirty =
    portraitPending || isDirty(sectionMeta(section), savedMeta);

  function saveMeta() {
    startTransition(async () => {
      try {
        const portraitImage =
          (await portraitRef.current?.commit()) ?? section.portraitImage;
        const meta = {
          title: section.title,
          portraitImage,
          portraitAlt: section.portraitAlt,
        };
        const result = await savePopularSection(meta);
        if (result.ok) {
          setSection((s) => ({ ...s, portraitImage }));
          setSavedMeta(meta);
        }
        notifyResult(result, "Sección guardada");
      } catch {
        notifyError("No se pudo subir la imagen");
      }
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
        <ImageField
          ref={portraitRef}
          label="Retrato grande"
          value={section.portraitImage}
          onChange={(url) => setSection((s) => ({ ...s, portraitImage: url }))}
          onPendingChange={setPortraitPending}
          bucket="popular"
        />
        <Field
          label="Alt del retrato"
          value={section.portraitAlt}
          onChange={(v) => setSection((s) => ({ ...s, portraitAlt: v }))}
        />
        <SaveBar pending={pending} dirty={metaDirty} onSave={saveMeta} />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() =>
            startTransition(async () => {
              const result = await addPopularItem();
              if (result.ok) {
                notifySuccess("Producto popular agregado");
                window.location.reload();
              } else notifyError(result.error || "Error");
            })
          }
          className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white"
        >
          Agregar producto popular
        </button>
      </div>

      <div className="space-y-4">
        {section.items.map((item) => (
          <PopularCard
            key={item.id}
            item={item}
            pending={pending}
            onSave={(next) =>
              startTransition(async () => {
                const result = await upsertPopularItem(next);
                if (result.ok) {
                  setSection((s) => ({
                    ...s,
                    items: s.items.map((i) => (i.id === next.id ? next : i)),
                  }));
                  notifySuccess("Producto popular guardado");
                } else notifyError(result.error || "Error");
              })
            }
            onDelete={(id) => {
              if (!confirm("¿Eliminar este ítem?")) return;
              startTransition(async () => {
                const result = await deletePopularItem(id);
                if (result.ok) {
                  setSection((s) => ({
                    ...s,
                    items: s.items.filter((i) => i.id !== id),
                  }));
                  notifySuccess("Eliminado");
                } else notifyError(result.error || "Error");
              });
            }}
          />
        ))}
      </div>
    </div>
  );
}

function PopularCard({
  item,
  pending,
  onSave,
  onDelete,
}: {
  item: PopularItem;
  pending: boolean;
  onSave: (item: PopularItem) => void;
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
        <h3 className="font-medium">{data.name}</h3>
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
        bucket="popular"
      />
      <Field
        label="Nombre"
        value={data.name}
        onChange={(v) => setData((d) => ({ ...d, name: v }))}
      />
      <Field
        label="Precio (EUR)"
        value={data.price}
        onChange={(v) => setData((d) => ({ ...d, price: v }))}
      />
      <Field
        label="Descripción"
        value={data.description}
        onChange={(v) => setData((d) => ({ ...d, description: v }))}
        multiline
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

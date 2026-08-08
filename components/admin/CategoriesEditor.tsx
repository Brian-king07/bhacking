"use client";

import { useRef, useState, useTransition } from "react";
import {
  addCategory,
  deleteCategory,
  saveCategoriesSection,
  upsertCategory,
} from "@/lib/content/actions";
import type { CategoriesSection, CategoryItem } from "@/lib/content/types";
import { MIN_CATEGORIES } from "@/lib/content/types";
import { ImageField, type ImageFieldHandle } from "@/components/admin/ImageField";
import { SaveBar } from "@/components/admin/HeroEditor";
import { isDirty } from "@/lib/admin/dirty";
import { notifyError, notifyResult, notifySuccess } from "@/lib/admin/feedback";

function sectionMeta(section: CategoriesSection) {
  return {
    title: section.title,
    description: section.description,
    viewAllLabel: section.viewAllLabel,
  };
}

export function CategoriesEditor({ initial }: { initial: CategoriesSection }) {
  const [section, setSection] = useState(initial);
  const [savedMeta, setSavedMeta] = useState(sectionMeta(initial));
  const [pending, startTransition] = useTransition();
  const metaDirty = isDirty(sectionMeta(section), savedMeta);

  function saveMeta() {
    startTransition(async () => {
      const meta = sectionMeta(section);
      const result = await saveCategoriesSection(meta);
      if (result.ok) setSavedMeta(meta);
      notifyResult(result, "Textos de sección guardados");
    });
  }

  function saveItem(item: CategoryItem) {
    startTransition(async () => {
      const result = await upsertCategory(item);
      if (result.ok) {
        setSection((s) => ({
          ...s,
          items: s.items.map((i) =>
            i.id === item.id ? item : item.large ? { ...i, large: false } : i,
          ),
        }));
        notifySuccess("Categoría guardada");
      } else notifyError(result.error || "Error");
    });
  }

  function onAdd() {
    startTransition(async () => {
      const result = await addCategory();
      if (result.ok) {
        notifySuccess("Categoría agregada");
        window.location.reload();
      } else notifyError(result.error || "Error");
    });
  }

  function onDelete(id: string) {
    if (!confirm("¿Eliminar esta categoría?")) return;
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result.ok) {
        setSection((s) => ({
          ...s,
          items: s.items.filter((i) => i.id !== id),
        }));
        notifySuccess("Categoría eliminada");
      } else notifyError(result.error || "Error");
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="font-display text-lg font-bold">Textos de la sección</h2>
        <TextField
          label="Título"
          value={section.title}
          onChange={(v) => setSection((s) => ({ ...s, title: v }))}
        />
        <TextField
          label="Descripción"
          value={section.description}
          onChange={(v) => setSection((s) => ({ ...s, description: v }))}
          multiline
        />
        <TextField
          label="Link ver todas"
          value={section.viewAllLabel}
          onChange={(v) => setSection((s) => ({ ...s, viewAllLabel: v }))}
        />
        <SaveBar pending={pending} dirty={metaDirty} onSave={saveMeta} />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          Mínimo {MIN_CATEGORIES} categorías · ahora {section.items.length}
        </p>
        <button
          type="button"
          onClick={onAdd}
          disabled={pending}
          className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white"
        >
          Agregar categoría
        </button>
      </div>

      <div className="space-y-4">
        {section.items.map((item) => (
          <CategoryCard
            key={item.id}
            item={item}
            canDelete={section.items.length > MIN_CATEGORIES}
            pending={pending}
            onSave={saveItem}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryCard({
  item,
  canDelete,
  pending,
  onSave,
  onDelete,
}: {
  item: CategoryItem;
  canDelete: boolean;
  pending: boolean;
  onSave: (item: CategoryItem) => void;
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
    <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-medium">{data.title || "Sin título"}</h3>
        {canDelete ? (
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="text-sm text-red-600 hover:underline"
          >
            Eliminar
          </button>
        ) : (
          <span className="text-xs text-neutral-400">Mínimo alcanzado</span>
        )}
      </div>
      <ImageField
        ref={imageRef}
        label="Portada"
        value={data.image}
        onChange={(url) => setData((d) => ({ ...d, image: url }))}
        onPendingChange={setImagePending}
        bucket="categories"
      />
      <TextField
        label="Título"
        value={data.title}
        onChange={(v) => setData((d) => ({ ...d, title: v }))}
      />
      <TextField
        label="Texto alt"
        value={data.alt}
        onChange={(v) => setData((d) => ({ ...d, alt: v }))}
      />
      <TextField
        label="CTA"
        value={data.cta}
        onChange={(v) => setData((d) => ({ ...d, cta: v }))}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={data.large}
          onChange={(e) => setData((d) => ({ ...d, large: e.target.checked }))}
        />
        Tarjeta grande (principal)
      </label>
      <button
        type="button"
        disabled={!dirty || pending}
        onClick={handleSave}
        className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        Guardar categoría
      </button>
    </div>
  );
}

function TextField({
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

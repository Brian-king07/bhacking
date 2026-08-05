"use client";

import { useState, useTransition } from "react";
import {
  addCategory,
  deleteCategory,
  saveCategoriesSection,
  upsertCategory,
} from "@/lib/content/actions";
import type { CategoriesSection, CategoryItem } from "@/lib/content/types";
import { MIN_CATEGORIES } from "@/lib/content/types";
import { ImageField } from "@/components/admin/ImageField";
import { SaveBar } from "@/components/admin/HeroEditor";

export function CategoriesEditor({ initial }: { initial: CategoriesSection }) {
  const [section, setSection] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function saveMeta() {
    startTransition(async () => {
      const result = await saveCategoriesSection({
        title: section.title,
        description: section.description,
        viewAllLabel: section.viewAllLabel,
      });
      setMessage(result.ok ? "Textos de sección guardados." : result.error || "Error");
    });
  }

  function saveItem(item: CategoryItem) {
    startTransition(async () => {
      const result = await upsertCategory(item);
      if (result.ok) {
        setSection((s) => ({
          ...s,
          items: s.items.map((i) => (i.id === item.id ? item : i.large && item.large ? { ...i, large: false } : i)),
        }));
        // refresh large flags locally
        setSection((s) => ({
          ...s,
          items: s.items.map((i) =>
            i.id === item.id ? item : item.large ? { ...i, large: false } : i,
          ),
        }));
        setMessage("Categoría guardada.");
      } else setMessage(result.error || "Error");
    });
  }

  function onAdd() {
    startTransition(async () => {
      const result = await addCategory();
      if (result.ok) {
        setMessage("Categoría agregada. Recarga o edita la nueva.");
        window.location.reload();
      } else setMessage(result.error || "Error");
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
        setMessage("Categoría eliminada.");
      } else setMessage(result.error || "Error");
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
        <SaveBar pending={pending} message={message} onSave={saveMeta} />
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
        label="Portada"
        value={data.image}
        onChange={(url) => setData((d) => ({ ...d, image: url }))}
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
        disabled={pending}
        onClick={() => onSave(data)}
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

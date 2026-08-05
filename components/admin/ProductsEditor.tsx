"use client";

import { useState, useTransition } from "react";
import {
  addProduct,
  deleteProduct,
  saveProductsSection,
  upsertProduct,
} from "@/lib/content/actions";
import type { ProductItem, ProductsSection } from "@/lib/content/types";
import { ImageField } from "@/components/admin/ImageField";
import { SaveBar } from "@/components/admin/HeroEditor";

export function ProductsEditor({ initial }: { initial: ProductsSection }) {
  const [section, setSection] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function saveMeta() {
    startTransition(async () => {
      const result = await saveProductsSection({
        title: section.title,
        description: section.description,
      });
      setMessage(result.ok ? "Sección guardada." : result.error || "Error");
    });
  }

  function onAdd() {
    startTransition(async () => {
      const result = await addProduct();
      if (result.ok) window.location.reload();
      else setMessage(result.error || "Error");
    });
  }

  function onDelete(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;
    startTransition(async () => {
      const result = await deleteProduct(id);
      if (result.ok) {
        setSection((s) => ({
          ...s,
          items: s.items.filter((i) => i.id !== id),
        }));
        setMessage("Producto eliminado.");
      } else setMessage(result.error || "Error");
    });
  }

  function onSaveItem(item: ProductItem) {
    startTransition(async () => {
      const result = await upsertProduct(item);
      if (result.ok) {
        setSection((s) => ({
          ...s,
          items: s.items.map((i) => (i.id === item.id ? item : i)),
        }));
        setMessage("Producto guardado.");
      } else setMessage(result.error || "Error");
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
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
        <SaveBar pending={pending} message={message} onSave={saveMeta} />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onAdd}
          className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white"
        >
          Agregar producto
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {section.items.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            pending={pending}
            onSave={onSaveItem}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

function ProductCard({
  item,
  pending,
  onSave,
  onDelete,
}: {
  item: ProductItem;
  pending: boolean;
  onSave: (item: ProductItem) => void;
  onDelete: (id: string) => void;
}) {
  const [data, setData] = useState(item);

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
        value={data.image}
        onChange={(url) => setData((d) => ({ ...d, image: url }))}
        bucket="products"
      />
      <TextField
        label="Nombre"
        value={data.name}
        onChange={(v) => setData((d) => ({ ...d, name: v }))}
      />
      <TextField
        label="Precio"
        value={data.price}
        onChange={(v) => setData((d) => ({ ...d, price: v }))}
      />
      <TextField
        label="Alt"
        value={data.alt}
        onChange={(v) => setData((d) => ({ ...d, alt: v }))}
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium">Categoría filtro</label>
        <select
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          value={data.category}
          onChange={(e) =>
            setData((d) => ({
              ...d,
              category: e.target.value as ProductItem["category"],
            }))
          }
        >
          <option value="men">Hombre</option>
          <option value="women">Mujer</option>
        </select>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() => onSave(data)}
        className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        Guardar producto
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

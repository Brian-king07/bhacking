"use client";

import { useRef, useState, useTransition } from "react";
import {
  deleteProduct,
  saveProductsSection,
  upsertProduct,
} from "@/lib/content/actions";
import type { ProductItem, ProductsSection } from "@/lib/content/types";
import { ImageField, type ImageFieldHandle } from "@/components/admin/ImageField";
import { SaveBar } from "@/components/admin/HeroEditor";
import { isDirty } from "@/lib/admin/dirty";
import { adminField, adminBtnPrimary } from "@/lib/admin/styles";
import { notifyError, notifyResult, notifySuccess } from "@/lib/admin/feedback";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createId } from "@/lib/content/id";

const emptyProduct = (): ProductItem => ({
  id: createId("prod"),
  name: "",
  price: "€0.00",
  category: "men",
  image: "",
  alt: "",
  description: "",
});

function productsMeta(section: ProductsSection) {
  return {
    title: section.title,
    description: section.description,
  };
}

export function ProductsEditor({ initial }: { initial: ProductsSection }) {
  const [section, setSection] = useState(initial);
  const [savedMeta, setSavedMeta] = useState(productsMeta(initial));
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ProductItem>(emptyProduct);
  const draftImageRef = useRef<ImageFieldHandle>(null);
  const metaDirty = isDirty(productsMeta(section), savedMeta);

  function saveMeta() {
    startTransition(async () => {
      const meta = productsMeta(section);
      const result = await saveProductsSection(meta);
      if (result.ok) setSavedMeta(meta);
      notifyResult(result, "Sección de productos guardada");
    });
  }

  function openCreateModal() {
    setDraft(emptyProduct());
    setOpen(true);
  }

  function onCreate() {
    if (!draft.name.trim()) {
      notifyError("El nombre del producto es obligatorio");
      return;
    }

    startTransition(async () => {
      try {
        const image = (await draftImageRef.current?.commit()) ?? draft.image;
        const item: ProductItem = {
          ...draft,
          image,
          name: draft.name.trim(),
          alt: draft.alt.trim() || draft.name.trim(),
          description: draft.description?.trim() || "",
        };
        const result = await upsertProduct(item);
        if (result.ok) {
          setSection((s) => ({ ...s, items: [item, ...s.items] }));
          setOpen(false);
          notifySuccess("Producto agregado");
        } else {
          notifyError(result.error || "No se pudo agregar el producto");
        }
      } catch {
        notifyError("No se pudo subir la imagen");
      }
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
        notifySuccess("Producto eliminado");
      } else {
        notifyError(result.error || "No se pudo eliminar");
      }
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
        notifySuccess("Producto guardado");
      } else {
        notifyError(result.error || "No se pudo guardar");
      }
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
        <SaveBar pending={pending} dirty={metaDirty} onSave={saveMeta} />
      </div>

      <div className="flex justify-end">
        <Button className={cn(adminBtnPrimary, "rounded-md")} onClick={openCreateModal}>
          Agregar producto
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-lg" showCloseButton>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                Nuevo producto
              </DialogTitle>
              <DialogDescription>
                Completa los datos. La imagen se sube al pulsar crear.
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[60vh] space-y-4 overflow-y-auto py-2">
              <ImageField
                ref={draftImageRef}
                label="Foto"
                value={draft.image}
                onChange={(url) => setDraft((d) => ({ ...d, image: url }))}
                bucket="products"
              />
              <div className="space-y-2">
                <Label htmlFor="new-product-name">Nombre</Label>
                <Input
                  id="new-product-name"
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, name: e.target.value }))
                  }
                  placeholder="Ej. Camisa clásica"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-product-price">Precio (EUR)</Label>
                <Input
                  id="new-product-price"
                  value={draft.price}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, price: e.target.value }))
                  }
                  placeholder="€26.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-product-alt">Texto alt</Label>
                <Input
                  id="new-product-alt"
                  value={draft.alt}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, alt: e.target.value }))
                  }
                  placeholder="Descripción de la imagen"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-product-description">
                  Descripción (opcional)
                </Label>
                <textarea
                  id="new-product-description"
                  rows={3}
                  className={adminField}
                  value={draft.description ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, description: e.target.value }))
                  }
                  placeholder="Materiales, fit, ocasión…"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-product-category">Categoría filtro</Label>
                <select
                  id="new-product-category"
                  className={`h-9 ${adminField}`}
                  value={draft.category}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      category: e.target.value as ProductItem["category"],
                    }))
                  }
                >
                  <option value="men">Hombre</option>
                  <option value="women">Mujer</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className={cn(adminBtnPrimary)}
                onClick={onCreate}
                disabled={pending}
              >
                {pending ? "Guardando…" : "Crear producto"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
  const [imagePending, setImagePending] = useState(false);
  const imageRef = useRef<ImageFieldHandle>(null);
  const [saving, setSaving] = useState(false);
  const dirty = imagePending || isDirty(data, item);

  async function handleSave() {
    setSaving(true);
    try {
      const image = (await imageRef.current?.commit()) ?? data.image;
      const next = { ...data, image };
      setData(next);
      onSave(next);
    } catch {
      notifyError("No se pudo subir la imagen");
    } finally {
      setSaving(false);
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
        bucket="products"
      />
      <TextField
        label="Nombre"
        value={data.name}
        onChange={(v) => setData((d) => ({ ...d, name: v }))}
      />
      <TextField
        label="Precio (EUR)"
        value={data.price}
        onChange={(v) => setData((d) => ({ ...d, price: v }))}
      />
      <TextField
        label="Alt"
        value={data.alt}
        onChange={(v) => setData((d) => ({ ...d, alt: v }))}
      />
      <TextField
        label="Descripción (opcional)"
        value={data.description ?? ""}
        onChange={(v) => setData((d) => ({ ...d, description: v }))}
        multiline
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium">Categoría filtro</label>
        <select
          className={adminField}
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
      <Button
        type="button"
        disabled={!dirty || pending || saving}
        onClick={handleSave}
        className={cn(adminBtnPrimary, "rounded-md")}
      >
        {saving ? "Guardando…" : "Guardar producto"}
      </Button>
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

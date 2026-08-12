"use client";

import { useRef, useState, useTransition } from "react";
import type { ColumnsItem, ColumnsSection } from "@/lib/content/types";
import { COLUMNS_COUNT } from "@/lib/content/types";
import { saveColumns } from "@/lib/content/actions";
import { ImageField, type ImageFieldHandle } from "@/components/admin/ImageField";
import { SaveBar } from "@/components/admin/HeroEditor";
import { isDirty } from "@/lib/admin/dirty";
import { notifyError, notifyResult } from "@/lib/admin/feedback";
import { adminField } from "@/lib/admin/styles";

export function ColumnsEditor({ initial }: { initial: ColumnsSection }) {
  const [data, setData] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [pendingSlots, setPendingSlots] = useState<boolean[]>(
    () => Array.from({ length: COLUMNS_COUNT }, () => false),
  );
  const [pending, startTransition] = useTransition();
  const refs = useRef<Array<ImageFieldHandle | null>>(
    Array.from({ length: COLUMNS_COUNT }, () => null),
  );
  const dirty =
    pendingSlots.some(Boolean) || isDirty(data.items, saved.items);

  function updateItem(index: number, patch: Partial<ColumnsItem>) {
    setData((d) => ({
      items: d.items.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    }));
  }

  function onSave() {
    startTransition(async () => {
      try {
        const items = [...data.items];
        for (let i = 0; i < COLUMNS_COUNT; i++) {
          const url = await refs.current[i]?.commit();
          if (url) {
            items[i] = {
              ...items[i],
              id: items[i]?.id || `col-${i + 1}`,
              image: url,
              alt: items[i]?.alt || `Columns ${i + 1}`,
            };
          }
        }
        const next = { items };
        const result = await saveColumns(next);
        if (result.ok) {
          setData(next);
          setSaved(next);
          setPendingSlots(Array.from({ length: COLUMNS_COUNT }, () => false));
        }
        notifyResult(result, "Columns guardado");
      } catch {
        notifyError("No se pudo subir alguna imagen");
      }
    });
  }

  return (
    <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6">
      <p className="text-sm text-neutral-500">
        Sube exactamente {COLUMNS_COUNT} imágenes. En desktop se muestran en 4
        columnas; en mobile, en 2.
      </p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((item, index) => (
          <div key={item.id} className="space-y-2">
            <ImageField
              ref={(handle) => {
                refs.current[index] = handle;
              }}
              label={`Imagen ${index + 1}`}
              value={item.image}
              onChange={(url) => updateItem(index, { image: url })}
              onPendingChange={(hasPending) =>
                setPendingSlots((prev) => {
                  if (prev[index] === hasPending) return prev;
                  const next = [...prev];
                  next[index] = hasPending;
                  return next;
                })
              }
              bucket="columns"
              tall
              belowControls={
                <input
                  className={adminField}
                  value={item.alt}
                  onChange={(e) => updateItem(index, { alt: e.target.value })}
                  placeholder="Texto alt (accesibilidad)"
                  aria-label={`Alt imagen ${index + 1}`}
                />
              }
            />
          </div>
        ))}
      </div>
      <SaveBar pending={pending} dirty={dirty} onSave={onSave} />
    </div>
  );
}

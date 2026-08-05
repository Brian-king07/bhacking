"use client";

import { useState, useTransition } from "react";
import {
  addCustomSection,
  deleteSection,
  moveSection,
  toggleSectionVisible,
  updateCustomSection,
} from "@/lib/content/actions";
import type { SectionConfig } from "@/lib/content/types";
import { ImageField } from "@/components/admin/ImageField";

export function SectionsEditor({ initial }: { initial: SectionConfig[] }) {
  const [sections, setSections] = useState(
    [...initial].sort((a, b) => a.order - b.order),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function refreshOrder(next: SectionConfig[]) {
    setSections([...next].sort((a, b) => a.order - b.order));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-500">
          Las secciones base se pueden ocultar. Las personalizadas se pueden crear y eliminar.
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await addCustomSection();
              if (result.ok) window.location.reload();
              else setMessage(result.error || "Error");
            })
          }
          className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white"
        >
          Agregar sección
        </button>
      </div>
      {message ? <p className="text-sm text-neutral-500">{message}</p> : null}

      {sections.map((section, index) => (
        <div
          key={section.id}
          className="rounded-2xl border border-neutral-200 bg-white p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-bold">{section.label}</h3>
              <p className="text-xs text-neutral-500 uppercase tracking-wide">
                {section.type} · orden {index + 1}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending || index === 0}
                onClick={() =>
                  startTransition(async () => {
                    await moveSection(section.id, "up");
                    const copy = [...sections];
                    const tmp = copy[index - 1];
                    copy[index - 1] = {
                      ...copy[index],
                      order: tmp.order,
                    };
                    copy[index] = { ...tmp, order: section.order };
                    // simpler: reload order from swap
                    const a = copy[index];
                    const b = copy[index - 1];
                    const orderA = a.order;
                    copy[index] = { ...a, order: b.order };
                    copy[index - 1] = { ...b, order: orderA };
                    refreshOrder(copy);
                    setMessage("Orden actualizado.");
                  })
                }
                className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Subir
              </button>
              <button
                type="button"
                disabled={pending || index === sections.length - 1}
                onClick={() =>
                  startTransition(async () => {
                    await moveSection(section.id, "down");
                    const copy = [...sections];
                    const a = copy[index];
                    const b = copy[index + 1];
                    const orderA = a.order;
                    copy[index] = { ...a, order: b.order };
                    copy[index + 1] = { ...b, order: orderA };
                    refreshOrder(copy);
                    setMessage("Orden actualizado.");
                  })
                }
                className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Bajar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await toggleSectionVisible(section.id);
                    setSections((list) =>
                      list.map((s) =>
                        s.id === section.id ? { ...s, visible: !s.visible } : s,
                      ),
                    );
                    setMessage(
                      section.visible ? "Sección ocultada." : "Sección visible.",
                    );
                  })
                }
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  section.visible
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {section.visible ? "Visible" : "Oculta"}
              </button>
              {section.type === "custom" ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm("¿Eliminar sección personalizada?")) return;
                    startTransition(async () => {
                      const result = await deleteSection(section.id);
                      if (result.ok) {
                        setSections((list) =>
                          list.filter((s) => s.id !== section.id),
                        );
                        setMessage("Sección eliminada.");
                      } else setMessage(result.error || "Error");
                    });
                  }}
                  className="rounded-lg px-3 py-1.5 text-sm text-red-600"
                >
                  Eliminar
                </button>
              ) : null}
            </div>
          </div>

          {section.type === "custom" && section.custom ? (
            <CustomEditor
              section={section}
              pending={pending}
              onSaved={(next) => {
                setSections((list) =>
                  list.map((s) => (s.id === next.id ? next : s)),
                );
                setMessage("Sección personalizada guardada.");
              }}
              onError={(err) => setMessage(err)}
              startTransition={startTransition}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function CustomEditor({
  section,
  pending,
  onSaved,
  onError,
  startTransition,
}: {
  section: SectionConfig;
  pending: boolean;
  onSaved: (section: SectionConfig) => void;
  onError: (error: string) => void;
  startTransition: (cb: () => void) => void;
}) {
  const [label, setLabel] = useState(section.label);
  const [custom, setCustom] = useState(section.custom!);

  return (
    <div className="mt-5 space-y-3 border-t border-neutral-100 pt-5">
      <Field label="Nombre interno" value={label} onChange={setLabel} />
      <Field
        label="Título"
        value={custom.title}
        onChange={(v) => setCustom((c) => ({ ...c, title: v }))}
      />
      <Field
        label="Descripción"
        value={custom.description}
        onChange={(v) => setCustom((c) => ({ ...c, description: v }))}
        multiline
      />
      <ImageField
        value={custom.image}
        onChange={(url) => setCustom((c) => ({ ...c, image: url }))}
        bucket="sections"
      />
      <Field
        label="CTA"
        value={custom.ctaLabel}
        onChange={(v) => setCustom((c) => ({ ...c, ctaLabel: v }))}
      />
      <Field
        label="CTA link"
        value={custom.ctaHref}
        onChange={(v) => setCustom((c) => ({ ...c, ctaHref: v }))}
      />
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await updateCustomSection(section.id, {
              label,
              custom,
            });
            if (result.ok) onSaved({ ...section, label, custom });
            else onError(result.error || "Error");
          })
        }
        className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        Guardar sección
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

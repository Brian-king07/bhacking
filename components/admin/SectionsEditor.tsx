"use client";

import { useState, useTransition } from "react";
import { moveSection, toggleSectionVisible } from "@/lib/content/actions";
import type { SectionConfig } from "@/lib/content/types";
import { notifyError, notifySuccess } from "@/lib/admin/feedback";
import { adminBtn } from "@/lib/admin/styles";

export function SectionsEditor({ initial }: { initial: SectionConfig[] }) {
  const [sections, setSections] = useState(
    [...initial]
      .filter((s) => s.type !== "popular")
      .sort((a, b) => a.order - b.order),
  );
  const [pending, startTransition] = useTransition();

  function refreshOrder(next: SectionConfig[]) {
    setSections(
      [...next].filter((s) => s.type !== "popular").sort((a, b) => a.order - b.order),
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-500">
        Controla qué bloques aparecen en la página y en qué orden. Cada sección
        se edita en su propia pantalla del admin. La sección Popular no se usa
        en el sitio.
      </p>

      {sections.map((section, index) => (
        <div
          key={section.id}
          className="rounded-2xl border border-neutral-200 bg-white p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-bold">{section.label}</h3>
              <p className="text-xs tracking-wide text-neutral-500 uppercase">
                {section.type} · orden {index + 1}
                {!section.visible ? " · oculta" : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending || index === 0}
                onClick={() =>
                  startTransition(async () => {
                    const result = await moveSection(section.id, "up");
                    if (!result.ok) {
                      notifyError(result.error || "Error");
                      return;
                    }
                    const copy = [...sections];
                    const a = copy[index];
                    const b = copy[index - 1];
                    const orderA = a.order;
                    copy[index] = { ...a, order: b.order };
                    copy[index - 1] = { ...b, order: orderA };
                    refreshOrder(copy);
                    notifySuccess("Orden actualizado");
                  })
                }
                className={`${adminBtn} px-3 py-1.5`}
              >
                Subir
              </button>
              <button
                type="button"
                disabled={pending || index === sections.length - 1}
                onClick={() =>
                  startTransition(async () => {
                    const result = await moveSection(section.id, "down");
                    if (!result.ok) {
                      notifyError(result.error || "Error");
                      return;
                    }
                    const copy = [...sections];
                    const a = copy[index];
                    const b = copy[index + 1];
                    const orderA = a.order;
                    copy[index] = { ...a, order: b.order };
                    copy[index + 1] = { ...b, order: orderA };
                    refreshOrder(copy);
                    notifySuccess("Orden actualizado");
                  })
                }
                className={`${adminBtn} px-3 py-1.5`}
              >
                Bajar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await toggleSectionVisible(section.id);
                    if (!result.ok) {
                      notifyError(result.error || "Error");
                      return;
                    }
                    setSections((list) =>
                      list.map((s) =>
                        s.id === section.id ? { ...s, visible: !s.visible } : s,
                      ),
                    );
                    notifySuccess(
                      section.visible ? "Sección ocultada" : "Sección visible",
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
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

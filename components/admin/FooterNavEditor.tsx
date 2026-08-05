"use client";

import { useState, useTransition } from "react";
import { saveBrandAndNav, saveFooter } from "@/lib/content/actions";
import type { FooterContent, NavLink } from "@/lib/content/types";
import { SaveBar } from "@/components/admin/HeroEditor";

export function FooterNavEditor({
  brand,
  navLinks,
  footer,
}: {
  brand: string;
  navLinks: NavLink[];
  footer: FooterContent;
}) {
  const [brandValue, setBrandValue] = useState(brand);
  const [nav, setNav] = useState(navLinks);
  const [data, setData] = useState(footer);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function saveAll() {
    startTransition(async () => {
      const a = await saveBrandAndNav({ brand: brandValue, navLinks: nav });
      const b = await saveFooter(data);
      setMessage(a.ok && b.ok ? "Footer y navegación guardados." : a.error || b.error || "Error");
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="font-display text-lg font-bold">Marca y menú</h2>
        <Field label="Marca" value={brandValue} onChange={setBrandValue} />
        {nav.map((link, index) => (
          <div key={index} className="grid gap-3 sm:grid-cols-2">
            <Field
              label={`Link ${index + 1} — texto`}
              value={link.label}
              onChange={(v) =>
                setNav((list) =>
                  list.map((l, i) => (i === index ? { ...l, label: v } : l)),
                )
              }
            />
            <Field
              label={`Link ${index + 1} — href`}
              value={link.href}
              onChange={(v) =>
                setNav((list) =>
                  list.map((l, i) => (i === index ? { ...l, href: v } : l)),
                )
              }
            />
          </div>
        ))}
      </div>

      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="font-display text-lg font-bold">Footer</h2>
        <Field
          label="Título newsletter"
          value={data.newsletterTitle}
          onChange={(v) => setData((d) => ({ ...d, newsletterTitle: v }))}
        />
        <Field
          label="Copyright"
          value={data.copyright}
          onChange={(v) => setData((d) => ({ ...d, copyright: v }))}
        />
        <Field
          label="Título sitemap"
          value={data.sitemapTitle}
          onChange={(v) => setData((d) => ({ ...d, sitemapTitle: v }))}
        />
        <Field
          label="Título disponible"
          value={data.availableTitle}
          onChange={(v) => setData((d) => ({ ...d, availableTitle: v }))}
        />
        <Field
          label="Título términos"
          value={data.termsTitle}
          onChange={(v) => setData((d) => ({ ...d, termsTitle: v }))}
        />
        <SaveBar pending={pending} message={message} onSave={saveAll} />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

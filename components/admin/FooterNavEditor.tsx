"use client";

import { useState, useTransition } from "react";
import {
  saveBrandAndNav,
  saveContact,
  saveFooter,
} from "@/lib/content/actions";
import type {
  ContactSettings,
  FooterContent,
  NavLink,
} from "@/lib/content/types";
import { SaveBar } from "@/components/admin/SaveBar";
import { isDirty } from "@/lib/admin/dirty";
import { adminField } from "@/lib/admin/styles";
import { notifyResult } from "@/lib/admin/feedback";

export function FooterNavEditor({
  brand,
  navLinks,
  footer,
  contact,
}: {
  brand: string;
  navLinks: NavLink[];
  footer: FooterContent;
  contact: ContactSettings;
}) {
  const [brandValue, setBrandValue] = useState(brand);
  const [nav, setNav] = useState(navLinks);
  const [savedBrand, setSavedBrand] = useState({ brand, navLinks });
  const [data, setData] = useState(footer);
  const [savedFooter, setSavedFooter] = useState(footer);
  const [contactData, setContactData] = useState(contact);
  const [savedContact, setSavedContact] = useState(contact);
  const [brandPending, startBrandTransition] = useTransition();
  const [footerPending, startFooterTransition] = useTransition();
  const [contactPending, startContactTransition] = useTransition();

  const brandDirty = isDirty(
    { brand: brandValue, navLinks: nav },
    savedBrand,
  );
  const footerDirty = isDirty(data, savedFooter);
  const contactDirty = isDirty(contactData, savedContact);

  function saveBrandMenu() {
    startBrandTransition(async () => {
      const next = { brand: brandValue, navLinks: nav };
      const result = await saveBrandAndNav(next);
      if (result.ok) setSavedBrand(next);
      notifyResult(result, "Marca y menú guardados");
    });
  }

  function saveFooterOnly() {
    startFooterTransition(async () => {
      const result = await saveFooter(data);
      if (result.ok) setSavedFooter(data);
      notifyResult(result, "Footer guardado");
    });
  }

  function saveContactOnly() {
    startContactTransition(async () => {
      const result = await saveContact(contactData);
      if (result.ok) setSavedContact(contactData);
      notifyResult(result, "Contacto guardado");
    });
  }

  function updateContact<K extends keyof ContactSettings>(
    key: K,
    value: ContactSettings[K],
  ) {
    setContactData((d) => ({ ...d, [key]: value }));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="font-display text-lg font-bold">Contacto (WhatsApp / Instagram)</h2>
        <p className="text-sm text-neutral-500">
          Los productos abren un chat con mensaje precargado.
        </p>
        <Field
          label="Número WhatsApp"
          value={contactData.whatsappNumber}
          onChange={(v) => updateContact("whatsappNumber", v)}
          hint="Solo dígitos con código de país, sin + ni espacios (ej. 34624933471)"
        />
        <Field
          label="Instagram (sin @)"
          value={contactData.instagramHandle}
          onChange={(v) => updateContact("instagramHandle", v)}
        />
        <Field
          label="Mensaje al consultar producto"
          value={contactData.whatsappMessageTemplate}
          onChange={(v) => updateContact("whatsappMessageTemplate", v)}
          multiline
          hint="Usa {name} y {price}"
        />
        <Field
          label="Mensaje general"
          value={contactData.generalMessageTemplate}
          onChange={(v) => updateContact("generalMessageTemplate", v)}
          multiline
        />
        <Field
          label="Texto botón WhatsApp"
          value={contactData.whatsappCtaLabel}
          onChange={(v) => updateContact("whatsappCtaLabel", v)}
        />
        <Field
          label="Texto botón Instagram"
          value={contactData.instagramCtaLabel}
          onChange={(v) => updateContact("instagramCtaLabel", v)}
        />
        <SaveBar
          pending={contactPending}
          dirty={contactDirty}
          onSave={saveContactOnly}
        />
      </div>

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
        <SaveBar
          pending={brandPending}
          dirty={brandDirty}
          onSave={saveBrandMenu}
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="font-display text-lg font-bold">Footer</h2>
        <Field
          label="Copyright"
          value={data.copyright}
          onChange={(v) => setData((d) => ({ ...d, copyright: v }))}
        />
        <Field
          label="Título columna mapa"
          value={data.sitemapTitle}
          onChange={(v) => setData((d) => ({ ...d, sitemapTitle: v }))}
        />
        <LinkList
          title="Enlaces mapa del sitio"
          links={data.sitemapLinks}
          onChange={(sitemapLinks) => setData((d) => ({ ...d, sitemapLinks }))}
        />
        <Field
          label="Título columna tienda"
          value={data.availableTitle}
          onChange={(v) => setData((d) => ({ ...d, availableTitle: v }))}
        />
        <LinkList
          title="Enlaces tienda"
          links={data.availableLinks}
          onChange={(availableLinks) =>
            setData((d) => ({ ...d, availableLinks }))
          }
          hint="Anclas válidas: #home, #shop, /?filter=men#shop, /?filter=women#shop"
        />
        <SaveBar
          pending={footerPending}
          dirty={footerDirty}
          onSave={saveFooterOnly}
        />
      </div>
    </div>
  );
}

function LinkList({
  title,
  links,
  onChange,
  hint,
}: {
  title: string;
  links: NavLink[];
  onChange: (links: NavLink[]) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-3 border-t border-neutral-100 pt-4">
      <p className="text-sm font-medium">{title}</p>
      {hint ? <p className="text-xs text-neutral-500">{hint}</p> : null}
      {links.map((link, index) => (
        <div key={index} className="grid gap-3 sm:grid-cols-2">
          <Field
            label={`Texto ${index + 1}`}
            value={link.label}
            onChange={(v) =>
              onChange(
                links.map((l, i) => (i === index ? { ...l, label: v } : l)),
              )
            }
          />
          <Field
            label={`Href ${index + 1}`}
            value={link.href}
            onChange={(v) =>
              onChange(
                links.map((l, i) => (i === index ? { ...l, href: v } : l)),
              )
            }
          />
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  hint?: string;
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
      {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}

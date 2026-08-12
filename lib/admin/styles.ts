/** Controles del admin: sin borde gris; highlight blanco solo arriba + sombra negra 4%. */
export const adminEdge =
  "border-0 shadow-[inset_0_1px_0_0_#fff,0_0_0_1px_rgba(0,0,0,0.04)]";

export const adminEdgeFocus =
  "outline-none focus:shadow-[inset_0_1px_0_0_#fff,0_0_0_1px_rgba(0,0,0,0.04)] focus-visible:shadow-[inset_0_1px_0_0_#fff,0_0_0_1px_rgba(0,0,0,0.04)]";

/** Inputs: 16px en mobile evita zoom en iOS; sm+ puede ser text-sm. */
export const adminField = `w-full rounded-md bg-neutral-100 px-3 py-2 text-base md:text-sm ${adminEdge} ${adminEdgeFocus}`;

export const adminFieldLg = `w-full rounded-lg bg-neutral-100 px-4 py-3 text-base md:text-sm ${adminEdge} ${adminEdgeFocus}`;

/**
 * Botón negro del admin.
 * Borde negro + highlight blanco SOLO arriba (el borde contiene el inset).
 */
export const adminBtnPrimary =
  "admin-btn-dark inline-flex items-center justify-center rounded-md border border-black bg-[#1a1a1a] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#222] disabled:opacity-50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28)]";

/** Alias: en admin los botones de acción son negros. */
export const adminBtn = adminBtnPrimary;

/** Compara valores planos del admin (objetos/arrays sin funciones). */
export function isDirty(current: unknown, saved: unknown): boolean {
  return JSON.stringify(current) !== JSON.stringify(saved);
}

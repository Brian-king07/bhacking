"use client";

import { adminBtnPrimary } from "@/lib/admin/styles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SaveBar({
  pending,
  onSave,
  label = "Guardar cambios",
  dirty = true,
}: {
  pending: boolean;
  onSave: () => void;
  label?: string;
  dirty?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-5">
      <Button
        type="button"
        onClick={onSave}
        disabled={pending || !dirty}
        size="lg"
        className={cn(adminBtnPrimary, "rounded-md px-5")}
      >
        {pending ? "Guardando…" : label}
      </Button>
    </div>
  );
}

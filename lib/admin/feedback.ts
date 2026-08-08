import { toast } from "sonner";
import type { ActionResult } from "@/lib/content/actions";

export function notifyResult(result: ActionResult, successMessage: string) {
  if (result.ok) {
    toast.success(successMessage);
    return;
  }
  toast.error(result.error || "No se pudo guardar");
}

export function notifySuccess(message: string) {
  toast.success(message);
}

export function notifyError(message: string) {
  toast.error(message);
}

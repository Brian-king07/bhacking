"use server";

import { redirect } from "next/navigation";
import {
  createSession,
  destroySession,
  getAdminCredentials,
  getSession,
} from "@/lib/auth/session";

export type AuthState = {
  error?: string;
};

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresa email y contraseña." };
  }

  let credentials: { email: string; password: string };
  try {
    credentials = getAdminCredentials();
  } catch {
    return {
      error:
        "El servidor no tiene credenciales configuradas. Revisa ADMIN_EMAIL y ADMIN_PASSWORD.",
    };
  }

  if (
    email !== credentials.email.toLowerCase() ||
    password !== credentials.password
  ) {
    return { error: "Credenciales incorrectas." };
  }

  try {
    await createSession(email);
  } catch {
    return { error: "No se pudo crear la sesión. Revisa AUTH_SECRET." };
  }

  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

export async function getCurrentAdmin() {
  return getSession();
}

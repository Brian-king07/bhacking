"use client";

import { useActionState } from "react";
import { loginAction, type AuthState } from "@/lib/auth/actions";
import { adminBtnPrimary, adminFieldLg } from "@/lib/admin/styles";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    loginAction,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className={adminFieldLg}
          placeholder="owner@bhacking.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={adminFieldLg}
        />
      </div>
      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className={`w-full ${adminBtnPrimary}`}
      >
        {pending ? "Entrando…" : "Entrar al admin"}
      </button>
    </form>
  );
}

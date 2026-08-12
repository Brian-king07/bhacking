import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <div
      data-admin
      className="flex min-h-screen items-center justify-center bg-neutral-100 px-5"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <p className="font-display text-xl font-bold tracking-[0.14em]">BHACKING</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Acceso owner</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Panel exclusivo para administrar multimedia y contenido del catálogo.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

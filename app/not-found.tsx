import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-5 text-center">
      <p className="font-display text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase">
        BHACKING
      </p>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
        No encontramos esa página
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground md:text-base">
        Puede que el producto ya no esté disponible o el enlace sea incorrecto.
      </p>
      <Link
        href="/#shop"
        className="mt-8 inline-flex rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Ver productos
      </Link>
    </main>
  );
}

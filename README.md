# BHACKING

Catálogo moda + consulta por WhatsApp. Admin en `/admin`. Contenido en Supabase.

## Desarrollo local

```bash
cp .env.example .env.local
# Completa variables (ver abajo)
npm install
npm run dev
```

## Variables de entorno

| Variable | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo servidor (guardar + uploads) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Login owner |
| `AUTH_SECRET` | Firma JWT cookie admin |
| `NEXT_PUBLIC_SITE_URL` | URL canónica (sitemap / OG), ej. `https://tu-dominio.vercel.app` |

## Supabase

1. Proyecto nuevo → SQL Editor → ejecutar **`supabase/schema.sql`** (schema completo).
2. Si el proyecto **ya existía** con versiones anteriores → ejecutar **`supabase/delivery-patch.sql`** (actualiza RPCs, contacto, descripción de producto). **No** uses `add-hero-desktop-image.sql` después de tener contacto.
3. Crear buckets si el schema no los dejó listos (hero, categories, products, featured, popular, sections, media) — el schema los define.

## Deploy (Vercel)

1. Importar repo en Vercel.
2. Añadir todas las env vars de `.env.example` (+ `NEXT_PUBLIC_SITE_URL` = dominio de producción).
3. Deploy. El sitio necesita **HTTPS** (Vercel lo da) para PWA e instalar en el móvil.
4. Probar: login admin, guardar contacto WA, abrir un producto → WhatsApp.
5. Más adelante: Vercel Analytics desde el dashboard del proyecto (opcional).

## Flujo de negocio

Sin carrito. El usuario ve el catálogo, abre el detalle y consulta por WhatsApp/Instagram.

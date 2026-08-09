# Checklist de deploy — BHACKING

## Antes de subir

- [ ] `.env` de producción con todas las variables de `.env.example`
- [ ] `NEXT_PUBLIC_SITE_URL` = URL final (HTTPS), sin barra final
- [ ] `ADMIN_PASSWORD` y `AUTH_SECRET` fuertes (no los de desarrollo)
- [ ] En Supabase: ejecutado `schema.sql` (proyecto nuevo) **o** `delivery-patch.sql` (proyecto ya existente)
- [ ] **No** volver a correr `add-hero-desktop-image.sql` (rompe `contact` / WhatsApp)

## Supabase

1. SQL Editor → pegar y Run `supabase/delivery-patch.sql`
2. Comprueba: `select public.get_site_content()->'contact';`
3. Debe verse `whatsappNumber` (p. ej. `34624933471`)
4. Storage: buckets `hero`, `categories`, `products`, `featured`, `popular`, `sections`, `media` con políticas del schema

## Vercel

1. Importar el repo
2. Framework: Next.js (detectado)
3. Variables de entorno (Production + Preview si quieres admin en preview)
4. Deploy
5. Abrir el dominio → smoke test abajo

## Smoke test post-deploy

- [ ] Home carga con hero (sin errores de imagen rotas)
- [ ] Categorías / productos / colección: si hay 0 items, la sección no aparece
- [ ] Producto → CTA WhatsApp abre chat al `+34 624 93 34 71`
- [ ] `/admin` login + guardar contacto / un producto
- [ ] Menú: Inicio, Categorías, Tienda, Colección (sin Historia / Novedades muertas)
- [ ] Footer: sin newsletter; links a secciones reales
- [ ] PWA: en móvil “Añadir a pantalla de inicio” (HTTPS)

## Más adelante (opcional)

- Vercel Analytics desde el dashboard del proyecto
- Dominio custom + actualizar `NEXT_PUBLIC_SITE_URL`

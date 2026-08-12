# Supabase · bhacking

## 1. SQL

1. Abre tu proyecto en Supabase → **SQL Editor**
2. Copia y pega el contenido de [`schema.sql`](./schema.sql)
3. Ejecuta (**Run**)

Eso crea:

- Tablas con **todos los textos** (hero, columns, categorías, productos, colecciones, popular, footer, nav, secciones)
- Funciones `get_site_content()` y `replace_site_content(payload)`
- Buckets públicos: `hero`, `columns`, `categories`, `products`, `featured`, `popular`, `sections`, `media`
- Seed inicial en español

### Proyecto ya existente

Si el schema base ya está aplicado, ejecuta también [`add-columns-section.sql`](./add-columns-section.sql) para añadir la galería parallax (tabla + bucket + RPCs).

## 2. Variables de entorno

En `.env.local` (Project Settings → API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

ADMIN_EMAIL=owner@bhacking.com
ADMIN_PASSWORD=tu-password
AUTH_SECRET=un-secreto-largo
```

`SUPABASE_SERVICE_ROLE_KEY` solo en el servidor (nunca en el cliente). Sirve para guardar contenido y subir imágenes desde el admin.

## 3. Probar

```bash
npm run dev
```

- Sitio: http://localhost:3000
- Admin: http://localhost:3000/admin/login

Los cambios del admin se persisten en Supabase. Las imágenes subidas van a Storage y la URL pública se guarda en las tablas de texto/contenido.

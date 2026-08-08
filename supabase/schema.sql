-- =============================================================================
-- bhacking · Supabase schema
-- Pega este archivo completo en: Supabase → SQL Editor → New query → Run
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Tablas (todos los textos editables desde el admin viven aquí)
-- -----------------------------------------------------------------------------

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  brand text not null default 'BHACKING',
  contact jsonb not null default '{
    "whatsappNumber": "34600000000",
    "instagramHandle": "bhacking",
    "whatsappMessageTemplate": "Hola, me interesa *{name}* ({price}). ¿Me das más info?",
    "generalMessageTemplate": "Hola, quiero información sobre BHACKING.",
    "whatsappCtaLabel": "Consultar por WhatsApp",
    "instagramCtaLabel": "Escribir en Instagram"
  }'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.nav_links (
  id text primary key,
  href text not null,
  label text not null,
  sort_order int not null default 0
);

create table if not exists public.hero (
  id int primary key default 1 check (id = 1),
  image text not null,
  image_desktop text not null default '',
  brand text not null,
  headline text not null,
  subheadline text not null,
  primary_cta text not null,
  secondary_cta text not null,
  side_note text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.categories_section (
  id int primary key default 1 check (id = 1),
  title text not null,
  description text not null,
  view_all_label text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  title text not null,
  cta text not null,
  image text not null,
  alt text not null,
  is_large boolean not null default false,
  sort_order int not null default 0
);

create table if not exists public.products_section (
  id int primary key default 1 check (id = 1),
  title text not null,
  description text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  price text not null,
  category text not null check (category in ('men', 'women')),
  image text not null,
  alt text not null,
  sort_order int not null default 0
);

create table if not exists public.featured_section (
  id int primary key default 1 check (id = 1),
  title text not null,
  description text not null,
  view_all_label text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.featured_items (
  id text primary key,
  handle text not null,
  image text not null,
  alt text not null,
  sort_order int not null default 0
);

create table if not exists public.popular_section (
  id int primary key default 1 check (id = 1),
  title text not null,
  portrait_image text not null,
  portrait_alt text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.popular_items (
  id text primary key,
  name text not null,
  price text not null,
  description text not null,
  image text not null,
  alt text not null,
  sort_order int not null default 0
);

create table if not exists public.footer_settings (
  id int primary key default 1 check (id = 1),
  newsletter_title text not null,
  copyright text not null,
  sitemap_title text not null,
  available_title text not null,
  terms_title text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.footer_links (
  id text primary key,
  link_group text not null check (link_group in ('sitemap', 'available', 'terms')),
  href text not null,
  label text not null,
  sort_order int not null default 0
);

create table if not exists public.page_sections (
  id text primary key,
  section_type text not null check (
    section_type in ('hero', 'categories', 'products', 'featured', 'popular', 'custom')
  ),
  label text not null,
  visible boolean not null default true,
  sort_order int not null default 0,
  custom_title text,
  custom_description text,
  custom_image text,
  custom_cta_label text,
  custom_cta_href text
);

-- Mínimo 3 categorías se valida en replace_site_content() y en el admin app

-- -----------------------------------------------------------------------------
-- 2) Lectura ensamblada (mismo shape que usa la app)
-- -----------------------------------------------------------------------------

create or replace function public.get_site_content()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'brand', coalesce((select brand from site_settings where id = 1), 'BHACKING'),
    'contact', coalesce(
      (select contact from site_settings where id = 1),
      '{}'::jsonb
    ),
    'navLinks', coalesce((
      select jsonb_agg(
        jsonb_build_object('href', href, 'label', label)
        order by sort_order
      )
      from nav_links
    ), '[]'::jsonb),
    'hero', (
      select jsonb_build_object(
        'image', image,
        'imageDesktop', coalesce(nullif(image_desktop, ''), image),
        'brand', brand,
        'headline', headline,
        'subheadline', subheadline,
        'primaryCta', primary_cta,
        'secondaryCta', secondary_cta,
        'sideNote', side_note
      )
      from hero where id = 1
    ),
    'categories', jsonb_build_object(
      'title', (select title from categories_section where id = 1),
      'description', (select description from categories_section where id = 1),
      'viewAllLabel', (select view_all_label from categories_section where id = 1),
      'items', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', id,
            'title', title,
            'cta', cta,
            'image', image,
            'alt', alt,
            'large', is_large
          )
          order by sort_order
        )
        from categories
      ), '[]'::jsonb)
    ),
    'products', jsonb_build_object(
      'title', (select title from products_section where id = 1),
      'description', (select description from products_section where id = 1),
      'items', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', id,
            'name', name,
            'price', price,
            'category', category,
            'image', image,
            'alt', alt
          )
          order by sort_order
        )
        from products
      ), '[]'::jsonb)
    ),
    'featured', jsonb_build_object(
      'title', (select title from featured_section where id = 1),
      'description', (select description from featured_section where id = 1),
      'viewAllLabel', (select view_all_label from featured_section where id = 1),
      'items', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', id,
            'handle', handle,
            'image', image,
            'alt', alt
          )
          order by sort_order
        )
        from featured_items
      ), '[]'::jsonb)
    ),
    'popular', jsonb_build_object(
      'title', (select title from popular_section where id = 1),
      'portraitImage', (select portrait_image from popular_section where id = 1),
      'portraitAlt', (select portrait_alt from popular_section where id = 1),
      'items', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', id,
            'name', name,
            'price', price,
            'description', description,
            'image', image,
            'alt', alt
          )
          order by sort_order
        )
        from popular_items
      ), '[]'::jsonb)
    ),
    'footer', jsonb_build_object(
      'newsletterTitle', (select newsletter_title from footer_settings where id = 1),
      'copyright', (select copyright from footer_settings where id = 1),
      'sitemapTitle', (select sitemap_title from footer_settings where id = 1),
      'availableTitle', (select available_title from footer_settings where id = 1),
      'termsTitle', (select terms_title from footer_settings where id = 1),
      'sitemapLinks', coalesce((
        select jsonb_agg(jsonb_build_object('href', href, 'label', label) order by sort_order)
        from footer_links where link_group = 'sitemap'
      ), '[]'::jsonb),
      'availableLinks', coalesce((
        select jsonb_agg(jsonb_build_object('href', href, 'label', label) order by sort_order)
        from footer_links where link_group = 'available'
      ), '[]'::jsonb),
      'termsLinks', coalesce((
        select jsonb_agg(jsonb_build_object('href', href, 'label', label) order by sort_order)
        from footer_links where link_group = 'terms'
      ), '[]'::jsonb)
    ),
    'sections', coalesce((
      select jsonb_agg(
        case
          when section_type = 'custom' then
            jsonb_build_object(
              'id', id,
              'type', section_type,
              'label', label,
              'visible', visible,
              'order', sort_order,
              'custom', jsonb_build_object(
                'title', coalesce(custom_title, ''),
                'description', coalesce(custom_description, ''),
                'image', coalesce(custom_image, ''),
                'ctaLabel', coalesce(custom_cta_label, ''),
                'ctaHref', coalesce(custom_cta_href, '')
              )
            )
          else
            jsonb_build_object(
              'id', id,
              'type', section_type,
              'label', label,
              'visible', visible,
              'order', sort_order
            )
        end
        order by sort_order
      )
      from page_sections
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

-- -----------------------------------------------------------------------------
-- 3) Escritura atómica desde el admin (reemplaza todo el contenido)
-- -----------------------------------------------------------------------------

create or replace function public.replace_site_content(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  i int;
  cat_count int;
begin
  cat_count := jsonb_array_length(coalesce(payload->'categories'->'items', '[]'::jsonb));
  if cat_count < 3 then
    raise exception 'Debes mantener al menos 3 categorías';
  end if;

  insert into site_settings (id, brand, contact, updated_at)
  values (
    1,
    coalesce(payload->>'brand', 'BHACKING'),
    coalesce(payload->'contact', '{}'::jsonb),
    now()
  )
  on conflict (id) do update
    set brand = excluded.brand,
        contact = excluded.contact,
        updated_at = now();

  delete from nav_links where true;
  i := 0;
  for item in select * from jsonb_array_elements(coalesce(payload->'navLinks', '[]'::jsonb))
  loop
    insert into nav_links (id, href, label, sort_order)
    values (
      coalesce(item->>'id', 'nav_' || i::text),
      item->>'href',
      item->>'label',
      i
    );
    i := i + 1;
  end loop;

  insert into hero (
    id, image, image_desktop, brand, headline, subheadline, primary_cta, secondary_cta, side_note, updated_at
  )
  values (
    1,
    payload->'hero'->>'image',
    coalesce(payload->'hero'->>'imageDesktop', payload->'hero'->>'image', ''),
    payload->'hero'->>'brand',
    payload->'hero'->>'headline',
    payload->'hero'->>'subheadline',
    payload->'hero'->>'primaryCta',
    payload->'hero'->>'secondaryCta',
    payload->'hero'->>'sideNote',
    now()
  )
  on conflict (id) do update set
    image = excluded.image,
    image_desktop = excluded.image_desktop,
    brand = excluded.brand,
    headline = excluded.headline,
    subheadline = excluded.subheadline,
    primary_cta = excluded.primary_cta,
    secondary_cta = excluded.secondary_cta,
    side_note = excluded.side_note,
    updated_at = now();

  insert into categories_section (id, title, description, view_all_label, updated_at)
  values (
    1,
    payload->'categories'->>'title',
    payload->'categories'->>'description',
    payload->'categories'->>'viewAllLabel',
    now()
  )
  on conflict (id) do update set
    title = excluded.title,
    description = excluded.description,
    view_all_label = excluded.view_all_label,
    updated_at = now();

  -- Validado arriba: siempre quedan >= 3 categorías
  delete from categories where true;
  i := 0;
  for item in select * from jsonb_array_elements(coalesce(payload->'categories'->'items', '[]'::jsonb))
  loop
    insert into categories (id, title, cta, image, alt, is_large, sort_order)
    values (
      item->>'id',
      item->>'title',
      item->>'cta',
      item->>'image',
      item->>'alt',
      coalesce((item->>'large')::boolean, false),
      i
    );
    i := i + 1;
  end loop;

  insert into products_section (id, title, description, updated_at)
  values (
    1,
    payload->'products'->>'title',
    payload->'products'->>'description',
    now()
  )
  on conflict (id) do update set
    title = excluded.title,
    description = excluded.description,
    updated_at = now();

  delete from products where true;
  i := 0;
  for item in select * from jsonb_array_elements(coalesce(payload->'products'->'items', '[]'::jsonb))
  loop
    insert into products (id, name, price, category, image, alt, sort_order)
    values (
      item->>'id',
      item->>'name',
      item->>'price',
      item->>'category',
      item->>'image',
      item->>'alt',
      i
    );
    i := i + 1;
  end loop;

  insert into featured_section (id, title, description, view_all_label, updated_at)
  values (
    1,
    payload->'featured'->>'title',
    payload->'featured'->>'description',
    payload->'featured'->>'viewAllLabel',
    now()
  )
  on conflict (id) do update set
    title = excluded.title,
    description = excluded.description,
    view_all_label = excluded.view_all_label,
    updated_at = now();

  delete from featured_items where true;
  i := 0;
  for item in select * from jsonb_array_elements(coalesce(payload->'featured'->'items', '[]'::jsonb))
  loop
    insert into featured_items (id, handle, image, alt, sort_order)
    values (
      item->>'id',
      item->>'handle',
      item->>'image',
      item->>'alt',
      i
    );
    i := i + 1;
  end loop;

  insert into popular_section (id, title, portrait_image, portrait_alt, updated_at)
  values (
    1,
    payload->'popular'->>'title',
    payload->'popular'->>'portraitImage',
    payload->'popular'->>'portraitAlt',
    now()
  )
  on conflict (id) do update set
    title = excluded.title,
    portrait_image = excluded.portrait_image,
    portrait_alt = excluded.portrait_alt,
    updated_at = now();

  delete from popular_items where true;
  i := 0;
  for item in select * from jsonb_array_elements(coalesce(payload->'popular'->'items', '[]'::jsonb))
  loop
    insert into popular_items (id, name, price, description, image, alt, sort_order)
    values (
      item->>'id',
      item->>'name',
      item->>'price',
      item->>'description',
      item->>'image',
      item->>'alt',
      i
    );
    i := i + 1;
  end loop;

  insert into footer_settings (
    id, newsletter_title, copyright, sitemap_title, available_title, terms_title, updated_at
  )
  values (
    1,
    payload->'footer'->>'newsletterTitle',
    payload->'footer'->>'copyright',
    payload->'footer'->>'sitemapTitle',
    payload->'footer'->>'availableTitle',
    payload->'footer'->>'termsTitle',
    now()
  )
  on conflict (id) do update set
    newsletter_title = excluded.newsletter_title,
    copyright = excluded.copyright,
    sitemap_title = excluded.sitemap_title,
    available_title = excluded.available_title,
    terms_title = excluded.terms_title,
    updated_at = now();

  delete from footer_links where true;
  i := 0;
  for item in select * from jsonb_array_elements(coalesce(payload->'footer'->'sitemapLinks', '[]'::jsonb))
  loop
    insert into footer_links (id, link_group, href, label, sort_order)
    values ('sitemap_' || i::text, 'sitemap', item->>'href', item->>'label', i);
    i := i + 1;
  end loop;
  i := 0;
  for item in select * from jsonb_array_elements(coalesce(payload->'footer'->'availableLinks', '[]'::jsonb))
  loop
    insert into footer_links (id, link_group, href, label, sort_order)
    values ('available_' || i::text, 'available', item->>'href', item->>'label', i);
    i := i + 1;
  end loop;
  i := 0;
  for item in select * from jsonb_array_elements(coalesce(payload->'footer'->'termsLinks', '[]'::jsonb))
  loop
    insert into footer_links (id, link_group, href, label, sort_order)
    values ('terms_' || i::text, 'terms', item->>'href', item->>'label', i);
    i := i + 1;
  end loop;

  delete from page_sections where true;
  i := 0;
  for item in select * from jsonb_array_elements(coalesce(payload->'sections', '[]'::jsonb))
  loop
    insert into page_sections (
      id, section_type, label, visible, sort_order,
      custom_title, custom_description, custom_image, custom_cta_label, custom_cta_href
    )
    values (
      item->>'id',
      item->>'type',
      item->>'label',
      coalesce((item->>'visible')::boolean, true),
      coalesce((item->>'order')::int, i),
      item->'custom'->>'title',
      item->'custom'->>'description',
      item->'custom'->>'image',
      item->'custom'->>'ctaLabel',
      item->'custom'->>'ctaHref'
    );
    i := i + 1;
  end loop;

  return public.get_site_content();
end;
$$;

revoke all on function public.get_site_content() from public;
revoke all on function public.replace_site_content(jsonb) from public;
grant execute on function public.get_site_content() to anon, authenticated, service_role;
grant execute on function public.replace_site_content(jsonb) to service_role;

-- -----------------------------------------------------------------------------
-- 4) RLS
-- -----------------------------------------------------------------------------

alter table public.site_settings enable row level security;
alter table public.nav_links enable row level security;
alter table public.hero enable row level security;
alter table public.categories_section enable row level security;
alter table public.categories enable row level security;
alter table public.products_section enable row level security;
alter table public.products enable row level security;
alter table public.featured_section enable row level security;
alter table public.featured_items enable row level security;
alter table public.popular_section enable row level security;
alter table public.popular_items enable row level security;
alter table public.footer_settings enable row level security;
alter table public.footer_links enable row level security;
alter table public.page_sections enable row level security;

-- Lectura pública (el sitio)
do $$
declare
  t text;
begin
  foreach t in array array[
    'site_settings','nav_links','hero','categories_section','categories',
    'products_section','products','featured_section','featured_items',
    'popular_section','popular_items','footer_settings','footer_links','page_sections'
  ]
  loop
    execute format('drop policy if exists "public read %s" on public.%I', t, t);
    execute format(
      'create policy "public read %s" on public.%I for select to anon, authenticated using (true)',
      t, t
    );
  end loop;
end;
$$;

-- Escrituras solo vía service_role (bypass RLS) desde el server de Next.js

-- -----------------------------------------------------------------------------
-- 5) Storage buckets (imágenes / multimedia)
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('hero', 'hero', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif']),
  ('categories', 'categories', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif']),
  ('products', 'products', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif']),
  ('featured', 'featured', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif']),
  ('popular', 'popular', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif']),
  ('sections', 'sections', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif']),
  ('media', 'media', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Lectura pública de objetos
drop policy if exists "Public read media" on storage.objects;
create policy "Public read media"
on storage.objects for select
to anon, authenticated
using (bucket_id in ('hero','categories','products','featured','popular','sections','media'));

-- Uploads desde el backend con service_role (bypass). Por si usas anon autenticado:
drop policy if exists "Auth upload media" on storage.objects;
create policy "Auth upload media"
on storage.objects for insert
to authenticated
with check (bucket_id in ('hero','categories','products','featured','popular','sections','media'));

drop policy if exists "Auth update media" on storage.objects;
create policy "Auth update media"
on storage.objects for update
to authenticated
using (bucket_id in ('hero','categories','products','featured','popular','sections','media'));

drop policy if exists "Auth delete media" on storage.objects;
create policy "Auth delete media"
on storage.objects for delete
to authenticated
using (bucket_id in ('hero','categories','products','featured','popular','sections','media'));

-- -----------------------------------------------------------------------------
-- 6) Seed inicial (textos en español + imágenes Unsplash)
-- -----------------------------------------------------------------------------

select public.replace_site_content('{
  "brand": "BHACKING",
  "contact": {
    "whatsappNumber": "34600000000",
    "instagramHandle": "bhacking",
    "whatsappMessageTemplate": "Hola, me interesa *{name}* ({price}). ¿Me das más info?",
    "generalMessageTemplate": "Hola, quiero información sobre BHACKING.",
    "whatsappCtaLabel": "Consultar por WhatsApp",
    "instagramCtaLabel": "Escribir en Instagram"
  },
  "navLinks": [
    {"href": "#home", "label": "Inicio"},
    {"href": "#shop", "label": "Tienda"},
    {"href": "#history", "label": "Historia"},
    {"href": "#news", "label": "Novedades"}
  ],
  "hero": {
    "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2000&q=80",
    "imageDesktop": "https://images.unsplash.com/photo-1441984904996-e0b14ba4ad63?auto=format&fit=crop&w=2000&q=80",
    "brand": "BHACKING",
    "headline": "Donde lo digital encuentra la moda",
    "subheadline": "Experiencias únicas pensadas para que comprar sea más simple y elegante.",
    "primaryCta": "Ver colección",
    "secondaryCta": "Explorar categorías",
    "sideNote": "atrévete a empezar un nuevo estilo"
  },
  "categories": {
    "title": "Categorías para ti",
    "description": "Selecciones curadas en moda, accesorios y calzado — pensadas para un guardarropa diario más limpio.",
    "viewAllLabel": "Ver todas las categorías",
    "items": [
      {
        "id": "fashion",
        "title": "Moda",
        "cta": "Comprar",
        "image": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80",
        "alt": "Look de moda en negro sastre",
        "large": true
      },
      {
        "id": "accessories",
        "title": "Accesorios",
        "cta": "Comprar",
        "image": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
        "alt": "Bolso de cuero y accesorios",
        "large": false
      },
      {
        "id": "shoes",
        "title": "Calzado",
        "cta": "Comprar",
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
        "alt": "Sneaker moderno en exhibición",
        "large": false
      }
    ]
  },
  "products": {
    "title": "Nuestros productos nuevos",
    "description": "Llegadas frescas con líneas limpias, neutros suaves y piezas ideales para el día a día.",
    "items": [
      {
        "id": "1",
        "name": "Camisa Clásica",
        "price": "€26.00",
        "category": "men",
        "image": "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80",
        "alt": "Modelo con camisa clásica beige"
      },
      {
        "id": "2",
        "name": "Hoodie Suave",
        "price": "€18.00",
        "category": "women",
        "image": "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=800&q=80",
        "alt": "Modelo con hoodie crema"
      },
      {
        "id": "3",
        "name": "Chaqueta Urbana",
        "price": "€42.00",
        "category": "men",
        "image": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
        "alt": "Modelo con chaqueta urbana"
      },
      {
        "id": "4",
        "name": "Blusa de Lino",
        "price": "€29.00",
        "category": "women",
        "image": "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
        "alt": "Mujer con blusa de lino clara"
      },
      {
        "id": "5",
        "name": "Abrigo Studio",
        "price": "€58.00",
        "category": "men",
        "image": "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=800&q=80",
        "alt": "Abrigo sastre de estudio"
      },
      {
        "id": "6",
        "name": "Punto Diario",
        "price": "€32.00",
        "category": "women",
        "image": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80",
        "alt": "Mujer con conjunto de punto"
      }
    ]
  },
  "featured": {
    "title": "Colección destacada",
    "description": "Looks de la comunidad: declaraciones silenciosas, siluetas fuertes y piezas para cualquier temporada.",
    "viewAllLabel": "Ver toda la colección",
    "items": [
      {
        "id": "f1",
        "handle": "@scelesta",
        "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
        "alt": "Look destacado de @scelesta"
      },
      {
        "id": "f2",
        "handle": "@prenvce",
        "image": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
        "alt": "Look destacado de @prenvce"
      },
      {
        "id": "f3",
        "handle": "@senhelaba",
        "image": "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=800&q=80",
        "alt": "Look destacado de @senhelaba"
      }
    ]
  },
  "popular": {
    "title": "Popular este año",
    "portraitImage": "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=1200&q=80",
    "portraitAlt": "Look popular — blazer blanco con detalle floral",
    "items": [
      {
        "id": "p1",
        "name": "Pantalón con Chaleco",
        "price": "€120.00",
        "description": "Una silueta refinada para la temporada: chaleco estructurado con pantalón sastre en tonos arena.",
        "image": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=700&q=80",
        "alt": "Conjunto de pantalón y chaleco en arena"
      },
      {
        "id": "p2",
        "name": "Sobrecamisa de Algodón",
        "price": "€78.00",
        "description": "Capa ligera con costuras limpias y caída relajada — ideal para el día a día y el clima de transición.",
        "image": "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=700&q=80",
        "alt": "Detalle de sobrecamisa de algodón"
      },
      {
        "id": "p3",
        "name": "Blazer Studio",
        "price": "€145.00",
        "description": "Líneas nítidas y lana suave. Un básico elevado para ir del día a la noche con naturalidad.",
        "image": "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=700&q=80",
        "alt": "Look con blazer de estudio"
      }
    ]
  },
  "footer": {
    "newsletterTitle": "Mantente inspirado y elegante",
    "copyright": "© 2026 bhacking. Todos los derechos reservados",
    "sitemapTitle": "Mapa del sitio",
    "availableTitle": "Disponible",
    "termsTitle": "Términos y privacidad",
    "sitemapLinks": [
      {"href": "#home", "label": "Inicio"},
      {"href": "#shop", "label": "Tienda"},
      {"href": "#history", "label": "Historia"},
      {"href": "#news", "label": "Novedades"}
    ],
    "availableLinks": [
      {"href": "#shop", "label": "Pantalones"},
      {"href": "#shop", "label": "Chalecos"},
      {"href": "#shop", "label": "Camisas"},
      {"href": "#shop", "label": "Sneakers"}
    ],
    "termsLinks": [
      {"href": "#", "label": "Términos y condiciones"},
      {"href": "#", "label": "Política de privacidad"},
      {"href": "#", "label": "Política de cookies"}
    ]
  },
  "sections": [
    {"id": "hero", "type": "hero", "label": "Hero", "visible": true, "order": 0},
    {"id": "categories", "type": "categories", "label": "Categorías para ti", "visible": true, "order": 1},
    {"id": "products", "type": "products", "label": "Productos nuevos", "visible": true, "order": 2},
    {"id": "featured", "type": "featured", "label": "Colección destacada", "visible": true, "order": 3},
    {"id": "popular", "type": "popular", "label": "Popular este año", "visible": true, "order": 4}
  ]
}'::jsonb);

-- Verificación rápida
-- select public.get_site_content();

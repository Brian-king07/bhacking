-- BHACKING · Columns (parallax) section
-- Pega TODO este archivo en Supabase → SQL Editor → Run
-- Seguro de re-ejecutar. Crea tabla, bucket, sección y actualiza RPCs.

create table if not exists public.columns_section (
  id int primary key default 1 check (id = 1),
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.columns_section enable row level security;

drop policy if exists "Public read columns_section" on public.columns_section;
create policy "Public read columns_section"
on public.columns_section for select
to anon, authenticated
using (true);

alter table public.page_sections
  drop constraint if exists page_sections_section_type_check;

alter table public.page_sections
  add constraint page_sections_section_type_check
  check (
    section_type in (
      'hero',
      'columns',
      'categories',
      'products',
      'featured',
      'popular',
      'custom'
    )
  );

insert into public.columns_section (id, items, updated_at)
values (
  1,
  '[
    {"id":"col-1","image":"/1.jpg","alt":"Columns 1"},
    {"id":"col-2","image":"/1.jpg","alt":"Columns 2"},
    {"id":"col-3","image":"/1.jpg","alt":"Columns 3"},
    {"id":"col-4","image":"/1.jpg","alt":"Columns 4"},
    {"id":"col-5","image":"/1.jpg","alt":"Columns 5"},
    {"id":"col-6","image":"/1.jpg","alt":"Columns 6"},
    {"id":"col-7","image":"/1.jpg","alt":"Columns 7"},
    {"id":"col-8","image":"/1.jpg","alt":"Columns 8"},
    {"id":"col-9","image":"/1.jpg","alt":"Columns 9"},
    {"id":"col-10","image":"/1.jpg","alt":"Columns 10"}
  ]'::jsonb,
  now()
)
on conflict (id) do nothing;

do $$
begin
  if not exists (select 1 from public.page_sections where id = 'columns') then
    update public.page_sections
    set sort_order = sort_order + 1
    where sort_order >= 1;

    insert into public.page_sections (
      id, section_type, label, visible, sort_order
    ) values (
      'columns', 'columns', 'Columns (parallax)', true, 1
    );
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'columns',
  'columns',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do nothing;

drop policy if exists "Public read media" on storage.objects;
create policy "Public read media"
on storage.objects for select
to anon, authenticated
using (
  bucket_id in (
    'hero','columns','categories','products','featured','popular','sections','media'
  )
);

drop policy if exists "Auth upload media" on storage.objects;
create policy "Auth upload media"
on storage.objects for insert
to authenticated
with check (
  bucket_id in (
    'hero','columns','categories','products','featured','popular','sections','media'
  )
);

drop policy if exists "Auth update media" on storage.objects;
create policy "Auth update media"
on storage.objects for update
to authenticated
using (
  bucket_id in (
    'hero','columns','categories','products','featured','popular','sections','media'
  )
);

drop policy if exists "Auth delete media" on storage.objects;
create policy "Auth delete media"
on storage.objects for delete
to authenticated
using (
  bucket_id in (
    'hero','columns','categories','products','featured','popular','sections','media'
  )
);

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
    'columns', jsonb_build_object(
      'items', coalesce(
        (select items from columns_section where id = 1),
        '[]'::jsonb
      )
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
            'alt', alt,
            'description', coalesce(description, '')
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
  columns_count int;
begin
  cat_count := jsonb_array_length(coalesce(payload->'categories'->'items', '[]'::jsonb));
  if cat_count < 3 then
    raise exception 'Debes mantener al menos 3 categorías';
  end if;

  columns_count := jsonb_array_length(coalesce(payload->'columns'->'items', '[]'::jsonb));
  if columns_count <> 10 then
    raise exception 'Columns requiere exactamente 10 imágenes';
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

  insert into columns_section (id, items, updated_at)
  values (
    1,
    coalesce(payload->'columns'->'items', '[]'::jsonb),
    now()
  )
  on conflict (id) do update set
    items = excluded.items,
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
    insert into products (id, name, price, category, image, alt, description, sort_order)
    values (
      item->>'id',
      item->>'name',
      item->>'price',
      item->>'category',
      item->>'image',
      item->>'alt',
      coalesce(item->>'description', ''),
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

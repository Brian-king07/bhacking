-- Fix safeupdate: DELETE requiere WHERE
-- Pega esto en Supabase → SQL Editor → Run

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

  insert into site_settings (id, brand, updated_at)
  values (1, coalesce(payload->>'brand', 'BHACKING'), now())
  on conflict (id) do update
    set brand = excluded.brand, updated_at = now();

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

revoke all on function public.replace_site_content(jsonb) from public;
grant execute on function public.replace_site_content(jsonb) to service_role;

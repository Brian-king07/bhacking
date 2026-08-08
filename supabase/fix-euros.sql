-- Convierte precios de $ a € en el contenido ya sembrado
-- Pega en Supabase → SQL Editor → Run

update public.products
set price = replace(price, '$', '€')
where price like '%$%';

update public.popular_items
set price = replace(price, '$', '€')
where price like '%$%';

create or replace function public.admin_import_catalog(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_category jsonb;
  v_category_id uuid;
  v_image text;
  v_product jsonb;
  v_product_id uuid;
  v_result jsonb;
  v_variant jsonb;
  v_categories_created integer := 0;
  v_products_created integer := 0;
  v_variants_created integer := 0;
  v_images_created integer := 0;
begin
  if v_actor is null or not public.has_role('admin'::public.app_role) then
    raise exception 'admin role required'
      using errcode = '28000';
  end if;

  if jsonb_typeof(p_payload) <> 'object'
    or jsonb_typeof(p_payload -> 'categories') <> 'array'
    or jsonb_typeof(p_payload -> 'products') <> 'array' then
    raise exception 'invalid import payload'
      using errcode = '22023';
  end if;

  for v_category in
    select value from jsonb_array_elements(p_payload -> 'categories')
  loop
    insert into public.categories (name, slug, is_active)
    values (
      v_category ->> 'name',
      v_category ->> 'slug',
      true
    )
    on conflict (slug) do nothing
    returning id into v_category_id;

    if v_category_id is not null then
      v_categories_created := v_categories_created + 1;
    end if;
    v_category_id := null;
  end loop;

  for v_product in
    select value from jsonb_array_elements(p_payload -> 'products')
  loop
    select id into v_category_id
    from public.categories
    where slug = v_product ->> 'category_slug';

    if v_category_id is null then
      raise exception 'category not found for product %', v_product ->> 'slug'
        using errcode = '23503';
    end if;

    insert into public.products (
      category_id,
      is_bestseller,
      is_featured,
      name,
      slug,
      status
    )
    values (
      v_category_id,
      coalesce((v_product ->> 'is_bestseller')::boolean, false),
      coalesce((v_product ->> 'is_featured')::boolean, false),
      v_product ->> 'name',
      v_product ->> 'slug',
      coalesce(v_product ->> 'status', 'draft')::public.product_status
    )
    on conflict (slug) do nothing
    returning id into v_product_id;

    if v_product_id is not null then
      v_products_created := v_products_created + 1;
    else
      select id into v_product_id
      from public.products
      where slug = v_product ->> 'slug';
    end if;

    for v_variant in
      select value from jsonb_array_elements(v_product -> 'variants')
    loop
      if nullif(v_variant ->> 'sku', '') is not null then
        insert into public.product_variants (
          is_active,
          is_default,
          name,
          price,
          product_id,
          sku,
          stock_quantity,
          track_inventory
        )
        values (
          true,
          coalesce((v_variant ->> 'is_default')::boolean, false),
          v_variant ->> 'name',
          (v_variant ->> 'price')::numeric,
          v_product_id,
          nullif(v_variant ->> 'sku', ''),
          coalesce((v_variant ->> 'stock_quantity')::integer, 0),
          true
        )
        on conflict (sku) do nothing;

        if found then
          v_variants_created := v_variants_created + 1;
        end if;
      elsif not exists (
        select 1
        from public.product_variants
        where product_id = v_product_id
          and lower(name) = lower(v_variant ->> 'name')
      ) then
        insert into public.product_variants (
          is_active,
          is_default,
          name,
          price,
          product_id,
          stock_quantity,
          track_inventory
        )
        values (
          true,
          coalesce((v_variant ->> 'is_default')::boolean, false),
          v_variant ->> 'name',
          (v_variant ->> 'price')::numeric,
          v_product_id,
          coalesce((v_variant ->> 'stock_quantity')::integer, 0),
          true
        );
        v_variants_created := v_variants_created + 1;
      end if;
    end loop;

    for v_image in
      select value #>> '{}'
      from jsonb_array_elements(v_product -> 'images')
    loop
      if not exists (
        select 1
        from public.product_images
        where product_id = v_product_id
          and storage_path = v_image
      ) then
        insert into public.product_images (
          alt_text,
          is_primary,
          product_id,
          sort_order,
          storage_path
        )
        values (
          v_product ->> 'name',
          not exists (
            select 1 from public.product_images where product_id = v_product_id
          ),
          v_product_id,
          v_images_created,
          v_image
        );
        v_images_created := v_images_created + 1;
      end if;
    end loop;

    v_product_id := null;
  end loop;

  v_result := jsonb_build_object(
    'categories_created', v_categories_created,
    'products_created', v_products_created,
    'variants_created', v_variants_created,
    'images_created', v_images_created
  );

  return v_result;
end;
$$;

revoke all on function public.admin_import_catalog(jsonb) from public;
grant execute on function public.admin_import_catalog(jsonb) to authenticated;

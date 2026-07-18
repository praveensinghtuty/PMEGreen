begin;

create temp table phase_7a_check_results (
  check_name text not null,
  passed boolean not null
) on commit drop;

grant insert, select on phase_7a_check_results to authenticated;

insert into auth.users (
  id,
  aud,
  role,
  email,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '70000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'phase7a-admin@example.test',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '70000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'phase7a-customer@example.test',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  )
on conflict (id) do nothing;

insert into public.profiles (id, email)
values
  ('70000000-0000-4000-8000-000000000001', 'phase7a-admin@example.test'),
  ('70000000-0000-4000-8000-000000000002', 'phase7a-customer@example.test')
on conflict (id) do update
set email = excluded.email;

insert into public.user_roles (user_id, role)
values
  ('70000000-0000-4000-8000-000000000001', 'admin'),
  ('70000000-0000-4000-8000-000000000002', 'customer')
on conflict (user_id, role) do nothing;

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '70000000-0000-4000-8000-000000000001',
  true
);

select public.admin_import_catalog(
  '{
    "categories": [
      { "name": "Phase 7A Category", "slug": "phase-7a-category" }
    ],
    "products": [
      {
        "category_slug": "phase-7a-category",
        "images": ["phase-7a-product.png"],
        "is_bestseller": false,
        "is_featured": false,
        "name": "Phase 7A Product",
        "slug": "phase-7a-product",
        "status": "draft",
        "variants": [
          {
            "is_default": true,
            "name": "500 ml",
            "price": 100,
            "sku": "PHASE7A-500",
            "stock_quantity": 5
          }
        ]
      }
    ]
  }'::jsonb
);

select public.admin_import_catalog(
  '{
    "categories": [
      { "name": "Phase 7A Category", "slug": "phase-7a-category" }
    ],
    "products": [
      {
        "category_slug": "phase-7a-category",
        "images": ["phase-7a-product.png"],
        "is_bestseller": false,
        "is_featured": false,
        "name": "Phase 7A Product",
        "slug": "phase-7a-product",
        "status": "draft",
        "variants": [
          {
            "is_default": true,
            "name": "500 ml",
            "price": 100,
            "sku": "PHASE7A-500",
            "stock_quantity": 5
          }
        ]
      }
    ]
  }'::jsonb
);

insert into phase_7a_check_results (check_name, passed)
select
  'admin_import_is_idempotent',
  (select count(*) = 1 from public.categories where slug = 'phase-7a-category')
  and (select count(*) = 1 from public.products where slug = 'phase-7a-product')
  and (select count(*) = 1 from public.product_variants where sku = 'PHASE7A-500')
  and (
    select count(*) = 1
    from public.product_images
    where storage_path = 'phase-7a-product.png'
  );

do $$
begin
  perform public.admin_import_catalog(
    '{
      "categories": [
        { "name": "Rollback Category", "slug": "phase-7a-rollback-category" }
      ],
      "products": [
        {
          "category_slug": "missing-category",
          "images": [],
          "is_bestseller": false,
          "is_featured": false,
          "name": "Rollback Product",
          "slug": "phase-7a-rollback-product",
          "status": "draft",
          "variants": [
            {
              "is_default": true,
              "name": "500 ml",
              "price": 100,
              "sku": "PHASE7A-ROLLBACK",
              "stock_quantity": 1
            }
          ]
        }
      ]
    }'::jsonb
  );
  insert into phase_7a_check_results (check_name, passed)
  values ('invalid_import_rolls_back', false);
exception
  when foreign_key_violation then
    insert into phase_7a_check_results (check_name, passed)
    values (
      'invalid_import_rolls_back',
      not exists (
        select 1
        from public.categories
        where slug = 'phase-7a-rollback-category'
      )
    );
end $$;

select set_config(
  'request.jwt.claim.sub',
  '70000000-0000-4000-8000-000000000002',
  true
);

do $$
begin
  perform public.admin_import_catalog(
    '{"categories": [], "products": []}'::jsonb
  );
  insert into phase_7a_check_results (check_name, passed)
  values ('customer_cannot_import_catalog', false);
exception
  when invalid_authorization_specification then
    insert into phase_7a_check_results (check_name, passed)
    values ('customer_cannot_import_catalog', true);
end $$;

select check_name, passed
from phase_7a_check_results
order by check_name;

rollback;

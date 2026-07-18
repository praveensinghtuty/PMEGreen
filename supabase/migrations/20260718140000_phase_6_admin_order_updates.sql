create or replace function public.admin_update_order(
  p_order_id uuid,
  p_status public.order_status default null,
  p_payment_status public.payment_status default null,
  p_courier_name text default null,
  p_tracking_number text default null,
  p_tracking_url text default null,
  p_admin_notes text default null,
  p_history_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid := auth.uid();
  v_previous_status public.order_status;
  v_next_status public.order_status;
  v_payment_verified_at timestamptz;
  v_payment_verified_by uuid;
begin
  if v_admin_id is null or not public.has_role('admin'::public.app_role) then
    raise exception 'Admin access required'
      using errcode = '28000';
  end if;

  select status, payment_verified_at, payment_verified_by
    into v_previous_status, v_payment_verified_at, v_payment_verified_by
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order was not found'
      using errcode = '23514';
  end if;

  v_next_status := coalesce(p_status, v_previous_status);

  update public.orders
  set status = v_next_status,
      payment_status = coalesce(p_payment_status, payment_status),
      payment_verified_at = case
        when p_payment_status = 'paid' and v_payment_verified_at is null then now()
        else payment_verified_at
      end,
      payment_verified_by = case
        when p_payment_status = 'paid' and v_payment_verified_by is null then v_admin_id
        else payment_verified_by
      end,
      courier_name = nullif(btrim(coalesce(p_courier_name, courier_name, '')), ''),
      tracking_number = nullif(btrim(coalesce(p_tracking_number, tracking_number, '')), ''),
      tracking_url = nullif(btrim(coalesce(p_tracking_url, tracking_url, '')), ''),
      admin_notes = nullif(btrim(coalesce(p_admin_notes, admin_notes, '')), '')
  where id = p_order_id;

  if v_next_status <> v_previous_status then
    insert into public.order_status_history (
      order_id,
      from_status,
      to_status,
      changed_by,
      note
    )
    values (
      p_order_id,
      v_previous_status,
      v_next_status,
      v_admin_id,
      nullif(btrim(coalesce(p_history_note, '')), '')
    );
  end if;

  return p_order_id;
end;
$$;

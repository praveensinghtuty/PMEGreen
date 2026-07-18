import "server-only";

import { notFound } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/features/auth/queries/current-user";
import { createClient } from "@/lib/supabase/server";

const orderIdSchema = z.string().uuid();
const PAGE_SIZE = 20;

function searchPattern(query: string) {
  return `%${query.replace(/[^a-zA-Z0-9 @.+-]/g, "")}%`;
}

export async function getAdminOrders({
  page,
  query,
  status,
}: {
  page: number;
  query?: string;
  status: string;
}) {
  await requireAdmin("/admin/orders");
  const supabase = await createClient();
  let request = supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, status, payment_method, payment_status, total_amount, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (status !== "all") request = request.eq("status", status);
  if (query) {
    const pattern = searchPattern(query);
    request = request.or(
      `order_number.ilike.${pattern},customer_name.ilike.${pattern},customer_phone.ilike.${pattern}`,
    );
  }

  const { count, data, error } = await request;
  if (error) throw new Error("Unable to load orders");
  return {
    orders: data,
    page,
    pageSize: PAGE_SIZE,
    total: count ?? 0,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
  };
}

export async function getAdminOrderDetail(id: string) {
  const parsed = orderIdSchema.safeParse(id);
  if (!parsed.success) notFound();
  await requireAdmin(`/admin/orders/${id}`);
  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", parsed.data)
    .maybeSingle();
  if (error || !order) notFound();
  const [{ data: items }, { data: history }] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", order.id),
    supabase
      .from("order_status_history")
      .select("*")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true }),
  ]);
  return { history: history ?? [], items: items ?? [], order };
}

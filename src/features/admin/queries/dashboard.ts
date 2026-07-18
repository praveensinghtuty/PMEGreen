import "server-only";

import { requireAdmin } from "@/features/auth/queries/current-user";
import { createClient } from "@/lib/supabase/server";

export type AdminDashboard = {
  activeProducts: number;
  categories: number;
  hiddenProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  recentOrders: {
    createdAt: string;
    id: string;
    orderNumber: string;
    paymentStatus: string;
    status: string;
    totalAmount: number;
  }[];
  totalOrders: number;
  totalProducts: number;
};

async function countQuery(
  table: "categories" | "orders" | "products" | "product_variants",
) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });

  if (error) {
    return 0;
  }

  return count ?? 0;
}

async function countProductsByStatus(status: "active" | "draft" | "inactive") {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("status", status);
  return error ? 0 : (count ?? 0);
}

async function countPendingOrders() {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "placed");
  return error ? 0 : (count ?? 0);
}

async function countLowStockVariants() {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("product_variants")
    .select("id", { count: "exact", head: true })
    .eq("track_inventory", true)
    .lte("stock_quantity", 5);
  return error ? 0 : (count ?? 0);
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  await requireAdmin("/admin");
  const supabase = await createClient();
  const [
    totalProducts,
    activeProducts,
    hiddenProducts,
    categories,
    pendingOrders,
    totalOrders,
    lowStockProducts,
    recentOrdersResult,
  ] = await Promise.all([
    countQuery("products"),
    countProductsByStatus("active"),
    Promise.all([
      countProductsByStatus("draft"),
      countProductsByStatus("inactive"),
    ]).then(([draft, inactive]) => draft + inactive),
    countQuery("categories"),
    countPendingOrders(),
    countQuery("orders"),
    countLowStockVariants(),
    supabase
      .from("orders")
      .select(
        "id, order_number, status, payment_status, total_amount, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    activeProducts,
    categories,
    hiddenProducts,
    lowStockProducts,
    pendingOrders,
    recentOrders: (recentOrdersResult.data ?? []).map((order) => ({
      createdAt: order.created_at,
      id: order.id,
      orderNumber: order.order_number,
      paymentStatus: order.payment_status,
      status: order.status,
      totalAmount: order.total_amount,
    })),
    totalOrders,
    totalProducts,
  };
}

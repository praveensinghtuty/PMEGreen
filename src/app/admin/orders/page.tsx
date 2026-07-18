import Link from "next/link";

import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { AdminNotice } from "@/features/admin/components/admin-notice";
import { getAdminOrders } from "@/features/admin/queries/orders";
import { adminSearchSchema } from "@/features/admin/schemas/admin";
import { formatMoney } from "@/features/catalog/utils/format";

export const metadata = {
  title: "Admin Orders",
  robots: { index: false, follow: false },
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const rawParams = (await searchParams) ?? {};
  const params = adminSearchSchema.parse(rawParams);
  const orders = await getAdminOrders(params);

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Orders</h1>
        <AdminNotice
          error={singleParam(rawParams.adminError)}
          success={singleParam(rawParams.adminSuccess)}
        />
        <form className="mt-5 flex flex-wrap gap-3">
          <input
            className="h-11 rounded-md border border-input bg-background px-3"
            defaultValue={params.q}
            name="q"
            placeholder="Search orders"
          />
          <select
            className="h-11 rounded-md border border-input bg-background px-3"
            defaultValue={params.status}
            name="status"
          >
            <option value="all">All</option>
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button type="submit">Filter</Button>
        </form>
        <div className="mt-6 grid gap-3">
          {orders.orders.map((order) => (
            <Link
              className="grid gap-2 rounded-lg border border-border bg-card p-4 shadow-sm hover:bg-muted sm:grid-cols-[1fr_auto]"
              href={`/admin/orders/${order.id}`}
              key={order.id}
            >
              <span>
                <span className="block font-semibold">
                  {order.order_number}
                </span>
                <span className="text-sm text-muted-foreground">
                  {order.customer_name} · {order.customer_phone} ·{" "}
                  {order.status} · payment {order.payment_status}
                </span>
              </span>
              <span className="font-semibold">
                {formatMoney(order.total_amount)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

function singleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

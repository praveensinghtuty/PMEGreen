import Link from "next/link";

import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { getAdminDashboard } from "@/features/admin/queries/dashboard";
import { formatMoney } from "@/features/catalog/utils/format";

export const metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const dashboard = await getAdminDashboard();
  const metrics = [
    ["Total products", dashboard.totalProducts],
    ["Active products", dashboard.activeProducts],
    ["Hidden products", dashboard.hiddenProducts],
    ["Categories", dashboard.categories],
    ["Pending orders", dashboard.pendingOrders],
    ["Total orders", dashboard.totalOrders],
    ["Low-stock variants", dashboard.lowStockProducts],
  ];

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-secondary">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Owner workspace</h1>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            Actionable catalog, order, and store settings for the business.
          </p>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(([label, value]) => (
            <article
              className="rounded-lg border border-border bg-card p-5 shadow-sm"
              key={label}
            >
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 text-3xl font-semibold">{value}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Recent orders</h2>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/orders">View all</Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-3">
            {dashboard.recentOrders.length > 0 ? (
              dashboard.recentOrders.map((order) => (
                <Link
                  className="grid gap-2 rounded-md border border-border p-3 text-sm hover:bg-muted sm:grid-cols-[1fr_auto]"
                  href={`/admin/orders/${order.id}`}
                  key={order.id}
                >
                  <span>
                    <span className="block font-medium">
                      {order.orderNumber}
                    </span>
                    <span className="text-muted-foreground">
                      {order.status} / payment {order.paymentStatus}
                    </span>
                  </span>
                  <span className="font-semibold">
                    {formatMoney(order.totalAmount)}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

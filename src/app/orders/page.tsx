import Link from "next/link";

import { StoreShell } from "@/components/layout/store-shell";
import { EmptyState } from "@/components/storefront/empty-state";
import { storefrontMain } from "@/components/storefront/layout-classes";
import { PageHeader } from "@/components/storefront/page-header";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/features/catalog/utils/format";
import { getCustomerOrders } from "@/features/orders/queries/orders";

export const metadata = {
  title: "Orders",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OrdersPage() {
  const orders = await getCustomerOrders();

  return (
    <StoreShell>
      <PageHeader
        description="View placed orders, payment status, and customer-visible tracking history."
        eyebrow="Account"
        title="My orders"
      />
      <main className={storefrontMain} id="main-content">
        {orders.length > 0 ? (
          <div className="grid gap-4">
            {orders.map((order) => (
              <article
                className="rounded-lg border border-border bg-card p-4 shadow-sm"
                key={order.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold">
                      {order.orderNumber}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <p className="text-lg font-semibold">
                    {formatMoney(order.totalAmount)}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em]">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                    {order.status}
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                    {order.paymentMethod}
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                    Payment {order.paymentStatus}
                  </span>
                </div>
                <Button asChild className="mt-4" size="sm" variant="outline">
                  <Link href={`/orders/${order.id}`}>View order</Link>
                </Button>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            action={
              <Button asChild>
                <Link href="/shop">Browse products</Link>
              </Button>
            }
            description="Placed orders and customer-visible tracking updates will appear here."
            title="No orders yet"
          />
        )}
      </main>
    </StoreShell>
  );
}

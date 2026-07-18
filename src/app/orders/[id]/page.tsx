import Link from "next/link";

import { StoreShell } from "@/components/layout/store-shell";
import { storefrontMain } from "@/components/storefront/layout-classes";
import { PageHeader } from "@/components/storefront/page-header";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/features/catalog/utils/format";
import { getCustomerOrderDetail } from "@/features/orders/queries/orders";

export const metadata = {
  title: "Order details",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const order = await getCustomerOrderDetail(id);
  const placed = query?.placed === "1";

  return (
    <StoreShell>
      <PageHeader
        description="Historical order details use purchase-time snapshots and do not change when products or addresses are edited later."
        eyebrow={placed ? "Order placed" : "Order details"}
        title={order.orderNumber}
      />
      <main className={storefrontMain} id="main-content">
        {placed ? (
          <p
            className="mb-4 rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary"
            role="status"
          >
            Order placed. Payment remains pending until the business verifies or
            collects it.
          </p>
        ) : null}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="space-y-6">
            <section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
              <h2 className="text-lg font-semibold">Items</h2>
              <ul className="mt-4 divide-y divide-border">
                {order.items.map((item) => (
                  <li className="py-4" key={item.id}>
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.variantName}
                          {item.sku ? ` · SKU ${item.sku}` : ""}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatMoney(item.unitPrice)} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatMoney(item.lineTotal)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
              <h2 className="text-lg font-semibold">Status timeline</h2>
              <ol className="mt-4 space-y-4">
                {order.statusHistory.map((entry) => (
                  <li className="border-l-2 border-primary pl-4" key={entry.id}>
                    <p className="font-medium">{entry.toStatus}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString("en-IN")}
                    </p>
                    {entry.note ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {entry.note}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </section>
          </div>
          <aside className="space-y-6">
            <section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
              <h2 className="text-lg font-semibold">Summary</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <Row label="Status" value={order.status} />
                <Row label="Payment method" value={order.paymentMethod} />
                <Row label="Payment status" value={order.paymentStatus} />
                <Row label="Subtotal" value={formatMoney(order.subtotal)} />
                <Row
                  label="Shipping"
                  value={formatMoney(order.shippingCharge)}
                />
                <Row
                  label="Discount"
                  value={formatMoney(order.discountAmount)}
                />
                <Row label="Total" value={formatMoney(order.totalAmount)} />
                {order.upiTransactionReference ? (
                  <Row
                    label="UPI reference"
                    value={order.upiTransactionReference}
                  />
                ) : null}
              </dl>
            </section>
            <section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
              <h2 className="text-lg font-semibold">Shipping snapshot</h2>
              <address className="mt-4 not-italic text-sm leading-6 text-muted-foreground">
                <span className="block font-medium text-foreground">
                  {order.shippingAddress.full_name}
                </span>
                <span className="block">{order.shippingAddress.phone}</span>
                <span className="block">
                  {order.shippingAddress.address_line_1}
                </span>
                {order.shippingAddress.address_line_2 ? (
                  <span className="block">
                    {order.shippingAddress.address_line_2}
                  </span>
                ) : null}
                <span className="block">
                  {order.shippingAddress.city}, {order.shippingAddress.district}
                </span>
                <span className="block">
                  {order.shippingAddress.state} -{" "}
                  {order.shippingAddress.postal_code}
                </span>
              </address>
            </section>
            {order.courierName || order.trackingNumber || order.trackingUrl ? (
              <section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
                <h2 className="text-lg font-semibold">Courier tracking</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  {order.courierName ? (
                    <Row label="Courier" value={order.courierName} />
                  ) : null}
                  {order.trackingNumber ? (
                    <Row label="Tracking number" value={order.trackingNumber} />
                  ) : null}
                  {order.trackingUrl ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Tracking URL</dt>
                      <dd>
                        <Link
                          className="font-medium text-primary underline-offset-4 hover:underline"
                          href={order.trackingUrl}
                        >
                          Open
                        </Link>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </section>
            ) : null}
            <Button asChild variant="outline">
              <Link href="/orders">Back to orders</Link>
            </Button>
          </aside>
        </div>
      </main>
    </StoreShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

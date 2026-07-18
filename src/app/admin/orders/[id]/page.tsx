import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { updateOrderAction } from "@/features/admin/actions/admin";
import { AdminNotice } from "@/features/admin/components/admin-notice";
import { getAdminOrderDetail } from "@/features/admin/queries/orders";
import { formatMoney } from "@/features/catalog/utils/format";

export const metadata = {
  title: "Admin Order Detail",
  robots: { index: false, follow: false },
};

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const queryParams = (await searchParams) ?? {};
  const { history, items, order } = await getAdminOrderDetail(id);
  const address = order.shipping_address as Record<string, string | null>;

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">{order.order_number}</h1>
        <AdminNotice
          error={singleParam(queryParams.adminError)}
          success={singleParam(queryParams.adminSuccess)}
        />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_24rem]">
          <div className="space-y-6">
            <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Items</h2>
              <ul className="mt-4 divide-y divide-border">
                {items.map((item) => (
                  <li className="flex justify-between gap-4 py-3" key={item.id}>
                    <span>
                      <span className="block font-medium">
                        {item.product_name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {item.variant_name} · {item.quantity} x{" "}
                        {formatMoney(item.unit_price)}
                      </span>
                    </span>
                    <span className="font-semibold">
                      {formatMoney(item.line_total)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Timeline</h2>
              <ol className="mt-4 space-y-3">
                {history.map((entry) => (
                  <li className="border-l-2 border-primary pl-4" key={entry.id}>
                    <p className="font-medium">{entry.to_status}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.created_at).toLocaleString("en-IN")}
                    </p>
                    {entry.note ? (
                      <p className="text-sm text-muted-foreground">
                        {entry.note}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </section>
          </div>
          <aside className="space-y-6">
            <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Update order</h2>
              <form
                action={updateOrderAction}
                className="mt-4 grid gap-3 text-sm"
              >
                <input name="orderId" type="hidden" value={order.id} />
                <label className="grid gap-2 font-medium">
                  Status
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3"
                    defaultValue={order.status}
                    name="status"
                  >
                    <option value="placed">Placed</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>
                <label className="grid gap-2 font-medium">
                  Payment status
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3"
                    defaultValue={order.payment_status}
                    name="paymentStatus"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </label>
                <Field
                  defaultValue={order.courier_name ?? ""}
                  label="Courier"
                  name="courierName"
                />
                <Field
                  defaultValue={order.tracking_number ?? ""}
                  label="Tracking number"
                  name="trackingNumber"
                />
                <Field
                  defaultValue={order.tracking_url ?? ""}
                  label="Tracking URL"
                  name="trackingUrl"
                />
                <TextArea
                  defaultValue={order.admin_notes ?? ""}
                  label="Admin notes"
                  name="adminNotes"
                />
                <TextArea label="History note" name="historyNote" />
                <Button type="submit">Save order update</Button>
              </form>
            </section>
            <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Customer</h2>
              <p className="mt-3 text-sm">{order.customer_name}</p>
              <p className="text-sm text-muted-foreground">
                {order.customer_phone}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.customer_email}
              </p>
              <h3 className="mt-5 font-semibold">Shipping snapshot</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {address.address_line_1}, {address.city}, {address.district},{" "}
                {address.state} - {address.postal_code}
              </p>
              <h3 className="mt-5 font-semibold">Payment</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {order.payment_method} / {order.payment_status}
              </p>
              {order.upi_transaction_reference ? (
                <p className="text-sm text-muted-foreground">
                  UPI reference: {order.upi_transaction_reference}
                </p>
              ) : null}
              <p className="mt-4 text-lg font-semibold">
                {formatMoney(order.total_amount)}
              </p>
            </section>
          </aside>
        </div>
      </div>
    </AdminShell>
  );
}

function singleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function Field({
  defaultValue = "",
  label,
  name,
}: {
  defaultValue?: string;
  label: string;
  name: string;
}) {
  return (
    <label className="grid gap-2 font-medium">
      {label}
      <input
        className="h-10 rounded-md border border-input bg-background px-3"
        defaultValue={defaultValue}
        name={name}
      />
    </label>
  );
}

function TextArea({
  defaultValue = "",
  label,
  name,
}: {
  defaultValue?: string;
  label: string;
  name: string;
}) {
  return (
    <label className="grid gap-2 font-medium">
      {label}
      <textarea
        className="min-h-20 rounded-md border border-input bg-background px-3 py-2"
        defaultValue={defaultValue}
        name={name}
      />
    </label>
  );
}

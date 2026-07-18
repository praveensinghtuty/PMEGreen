import crypto from "node:crypto";
import Image from "next/image";
import Link from "next/link";

import { StoreShell } from "@/components/layout/store-shell";
import { EmptyState } from "@/components/storefront/empty-state";
import { storefrontMain } from "@/components/storefront/layout-classes";
import { PageHeader } from "@/components/storefront/page-header";
import { Button } from "@/components/ui/button";
import { AddressForm } from "@/features/addresses/components/address-form";
import { getCustomerAddresses } from "@/features/addresses/queries/addresses";
import { formatMoney } from "@/features/catalog/utils/format";
import { placeOrderAction } from "@/features/checkout/actions/checkout";
import { PlaceOrderButton } from "@/features/checkout/components/place-order-button";
import { getCheckoutSummary } from "@/features/checkout/queries/checkout";

export const metadata = {
  title: "Checkout",
  robots: {
    index: false,
    follow: false,
  },
};

const checkoutErrors: Record<string, string> = {
  invalid: "Check the checkout details and try again.",
  "place-failed":
    "Unable to place the order. Review cart availability, address, and payment details.",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = (await searchParams) ?? {};
  const error =
    typeof params.checkoutError === "string"
      ? checkoutErrors[params.checkoutError]
      : undefined;
  const [addresses, checkout] = await Promise.all([
    getCustomerAddresses("/checkout"),
    getCheckoutSummary(),
  ]);
  const defaultAddress = addresses.find((address) => address.isDefault);
  const selectedAddress = defaultAddress ?? addresses[0];
  const canPlaceOrder =
    addresses.length > 0 &&
    checkout.cart.items.length > 0 &&
    checkout.cart.unavailableItemCount === 0;

  return (
    <StoreShell>
      <PageHeader
        description="Review your Tamil Nadu delivery address, current cart prices, shipping charge, and payment method before placing the order."
        eyebrow="Checkout"
        title="Checkout"
      />
      <main className={storefrontMain} id="main-content">
        {error ? (
          <p
            className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {checkout.cart.items.length === 0 ? (
          <EmptyState
            action={
              <Button asChild>
                <Link href="/shop">Browse products</Link>
              </Button>
            }
            description="Your cart is empty. Add active product variants before checkout."
            title="No cart items to checkout"
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
            <div className="space-y-6">
              {checkout.cart.unavailableItemCount > 0 ? (
                <p
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                  role="alert"
                >
                  Some cart items are unavailable or understocked. Update the
                  cart before placing an order.
                </p>
              ) : null}
              <section
                aria-labelledby="checkout-address-heading"
                className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2
                      className="text-lg font-semibold"
                      id="checkout-address-heading"
                    >
                      Shipping address
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Delivery is restricted to Tamil Nadu.
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/addresses">Manage addresses</Link>
                  </Button>
                </div>
                {addresses.length > 0 ? (
                  <div className="mt-4 grid gap-3">
                    {addresses.map((address) => (
                      <label
                        className="flex cursor-pointer gap-3 rounded-md border border-border p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                        key={address.id}
                      >
                        <input
                          className="mt-1 size-4 accent-primary"
                          defaultChecked={address.id === selectedAddress?.id}
                          form="place-order-form"
                          name="addressId"
                          type="radio"
                          value={address.id}
                        />
                        <span>
                          <span className="block font-semibold">
                            {address.label}{" "}
                            {address.isDefault ? "(default)" : ""}
                          </span>
                          <span className="mt-1 block text-muted-foreground">
                            {address.fullName}, {address.phone}
                          </span>
                          <span className="block text-muted-foreground">
                            {address.addressLine1}, {address.city},{" "}
                            {address.district}, {address.state} -{" "}
                            {address.postalCode}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4">
                    <AddressForm returnPath="/checkout" />
                  </div>
                )}
              </section>
              <section
                aria-labelledby="checkout-payment-heading"
                className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5"
              >
                <h2
                  className="text-lg font-semibold"
                  id="checkout-payment-heading"
                >
                  Payment
                </h2>
                <div className="mt-4 grid gap-3">
                  <label className="flex cursor-pointer gap-3 rounded-md border border-border p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input
                      className="mt-1 size-4 accent-primary"
                      defaultChecked
                      form="place-order-form"
                      name="paymentMethod"
                      type="radio"
                      value="cod"
                    />
                    <span>
                      <span className="block font-semibold">
                        Cash on Delivery
                      </span>
                      <span className="mt-1 block text-muted-foreground">
                        Payment remains pending until collected by the business.
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer gap-3 rounded-md border border-border p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input
                      className="mt-1 size-4 accent-primary"
                      form="place-order-form"
                      name="paymentMethod"
                      type="radio"
                      value="upi"
                    />
                    <span>
                      <span className="block font-semibold">Manual UPI</span>
                      <span className="mt-1 block text-muted-foreground">
                        Pay outside the site and enter the reference. Payment
                        stays pending for manual verification.
                      </span>
                    </span>
                  </label>
                </div>
                <div className="mt-4 rounded-md border border-border bg-muted p-4 text-sm">
                  <h3 className="font-semibold">UPI instructions</h3>
                  {checkout.settings.upiId ? (
                    <p className="mt-2 text-muted-foreground">
                      UPI ID:{" "}
                      <span className="font-medium text-foreground">
                        {checkout.settings.upiId}
                      </span>
                    </p>
                  ) : (
                    <p className="mt-2 text-muted-foreground">
                      UPI ID is not configured yet. Use Cash on Delivery until
                      the business adds UPI settings.
                    </p>
                  )}
                  {checkout.settings.upiQr ? (
                    <Image
                      alt="Business UPI QR code"
                      className="mt-3 rounded-md border border-border bg-background"
                      height={160}
                      src={checkout.settings.upiQr}
                      width={160}
                    />
                  ) : null}
                  <label className="mt-4 grid gap-2 font-medium">
                    UPI transaction reference
                    <input
                      className="h-11 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25"
                      form="place-order-form"
                      maxLength={80}
                      name="upiReference"
                      placeholder="Required only for UPI"
                    />
                  </label>
                </div>
              </section>
            </div>
            <aside className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Order review</h2>
              <ul className="mt-4 divide-y divide-border text-sm">
                {checkout.cart.items.map((item) => (
                  <li className="py-3" key={item.id}>
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-medium">
                          {item.productName ?? "Unavailable item"}
                        </p>
                        <p className="mt-1 text-muted-foreground">
                          {item.variantLabel} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatMoney(item.lineTotal)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium">
                    {formatMoney(checkout.cart.subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="font-medium">
                    {formatMoney(checkout.settings.shippingCharge)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-border pt-3 text-base">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-semibold">
                    {formatMoney(checkout.total)}
                  </dd>
                </div>
              </dl>
              <form
                action={placeOrderAction}
                className="mt-5"
                id="place-order-form"
              >
                <input
                  name="idempotencyKey"
                  type="hidden"
                  value={crypto.randomUUID()}
                />
                <label className="mb-4 grid gap-2 text-sm font-medium">
                  Order note
                  <textarea
                    className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25"
                    maxLength={500}
                    name="customerNotes"
                    placeholder="Optional delivery note"
                  />
                </label>
                <PlaceOrderButton disabled={!canPlaceOrder} />
              </form>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Prices, stock, shipping, and address ownership are revalidated
                on the server before the order is created.
              </p>
            </aside>
          </div>
        )}
      </main>
    </StoreShell>
  );
}

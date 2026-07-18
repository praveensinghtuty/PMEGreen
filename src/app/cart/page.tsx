import Link from "next/link";

import { StoreShell } from "@/components/layout/store-shell";
import { EmptyState } from "@/components/storefront/empty-state";
import { storefrontMain } from "@/components/storefront/layout-classes";
import { PageHeader } from "@/components/storefront/page-header";
import { Button } from "@/components/ui/button";
import { clearCartAction } from "@/features/cart/actions/cart";
import { CartItemCard } from "@/features/cart/components/cart-item-card";
import { getCartSummary } from "@/features/cart/queries/cart";
import { formatMoney } from "@/features/catalog/utils/format";

export const metadata = {
  title: "Cart",
  robots: {
    index: false,
    follow: false,
  },
};

const errorMessages: Record<string, string> = {
  "clear-failed": "Unable to clear the cart. Try again.",
  "invalid-quantity": "Enter a valid quantity between 1 and 99.",
  "item-not-found": "That cart item could not be found.",
  "remove-failed": "Unable to remove that item. Try again.",
  unavailable: "That quantity is not currently available.",
  "update-failed": "Unable to update that item. Try again.",
};

export default async function CartPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = (await searchParams) ?? {};
  const cartError =
    typeof params.cartError === "string"
      ? errorMessages[params.cartError]
      : undefined;
  const cart = await getCartSummary();

  return (
    <StoreShell>
      <PageHeader
        description="Review saved cart items. Prices and totals are recalculated from current active variant data."
        eyebrow="Cart"
        title="Your cart"
      />
      <main className={storefrontMain} id="main-content">
        {cartError ? (
          <p
            className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {cartError}
          </p>
        ) : null}
        {cart.items.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
            <div className="space-y-4">
              {cart.unavailableItemCount > 0 ? (
                <p
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                  role="status"
                >
                  {cart.unavailableItemCount} item
                  {cart.unavailableItemCount === 1 ? "" : "s"} need attention
                  before checkout can be added in a later phase.
                </p>
              ) : null}
              {cart.items.map((item) => (
                <CartItemCard item={item} key={item.id} />
              ))}
            </div>
            <aside className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Summary</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-semibold">
                    {formatMoney(cart.subtotal)}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Checkout, shipping, payment, and order creation are implemented
                in later phases.
              </p>
              <form action={clearCartAction} className="mt-5">
                <input name="returnPath" type="hidden" value="/cart" />
                <Button className="w-full" type="submit" variant="outline">
                  Clear cart
                </Button>
              </form>
            </aside>
          </div>
        ) : (
          <EmptyState
            action={
              <Button asChild>
                <Link href="/shop">Browse products</Link>
              </Button>
            }
            description="Your saved cart is empty. Add an active product variant from the storefront catalog."
            title="Your cart is empty"
          />
        )}
      </main>
    </StoreShell>
  );
}

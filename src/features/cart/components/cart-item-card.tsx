import Image from "next/image";
import Link from "next/link";

import {
  removeCartItemAction,
  updateCartItemQuantityAction,
} from "@/features/cart/actions/cart";
import type { CartLineItem } from "@/features/cart/types/cart";
import { formatMoney } from "@/features/catalog/utils/format";
import { placeholderAssets } from "@/lib/placeholders/content";

export function CartItemCard({ item }: { item: CartLineItem }) {
  return (
    <article className="grid gap-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:grid-cols-[7rem_1fr]">
      <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
        <Image
          alt={item.image?.alt ?? item.productName ?? "Unavailable cart item"}
          className="object-cover"
          fill
          sizes="112px"
          src={item.image?.src ?? placeholderAssets.product}
        />
      </div>
      <div className="min-w-0">
        {item.productSlug && item.productName ? (
          <Link
            className="text-base font-semibold hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={`/products/${item.productSlug}`}
          >
            {item.productName}
          </Link>
        ) : (
          <h2 className="text-base font-semibold">Unavailable item</h2>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          {item.variantLabel ?? "This product is no longer public."}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <form action={updateCartItemQuantityAction} className="flex gap-2">
            <input name="itemId" type="hidden" value={item.id} />
            <input name="returnPath" type="hidden" value="/cart" />
            <label className="sr-only" htmlFor={`quantity-${item.id}`}>
              Quantity for {item.productName ?? "unavailable item"}
            </label>
            <input
              className="h-11 w-24 rounded-md border border-border bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              defaultValue={item.quantity}
              disabled={!item.isAvailable}
              id={`quantity-${item.id}`}
              inputMode="numeric"
              max={99}
              min={1}
              name="quantity"
              type="number"
            />
            <button
              className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!item.isAvailable}
              type="submit"
            >
              Update
            </button>
          </form>
          <div className="text-left sm:text-right">
            <p className="text-sm text-muted-foreground">
              Unit:{" "}
              {item.unitPrice !== null ? formatMoney(item.unitPrice) : "N/A"}
            </p>
            <p className="mt-1 font-semibold">{formatMoney(item.lineTotal)}</p>
          </div>
        </div>
        {!item.isAvailable ? (
          <p className="mt-3 text-sm text-destructive">
            This cart item is no longer available in the selected quantity.
          </p>
        ) : null}
        <form action={removeCartItemAction} className="mt-4">
          <input name="itemId" type="hidden" value={item.id} />
          <input name="returnPath" type="hidden" value="/cart" />
          <button
            className="text-sm font-semibold text-destructive hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            type="submit"
          >
            Remove item
          </button>
        </form>
      </div>
    </article>
  );
}

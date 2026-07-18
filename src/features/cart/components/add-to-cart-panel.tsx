"use client";

import { ShoppingCart } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { addVariantToCartAction } from "@/features/cart/actions/cart";
import { initialCartActionState } from "@/features/cart/schemas/cart";
import type { CatalogVariant } from "@/features/catalog/types/catalog";
import {
  formatMoney,
  formatVariantMeasure,
  isVariantAvailable,
} from "@/features/catalog/utils/format";
import { cn } from "@/lib/utils/cn";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={disabled || pending} type="submit">
      <ShoppingCart aria-hidden="true" className="size-4" />
      {pending ? "Adding..." : "Add to cart"}
    </Button>
  );
}

export function AddToCartPanel({
  returnPath,
  variants,
}: {
  returnPath: string;
  variants: CatalogVariant[];
}) {
  const initialVariant =
    variants.find(
      (variant) => variant.isDefault && isVariantAvailable(variant),
    ) ??
    variants.find(isVariantAvailable) ??
    variants[0];
  const [state, formAction] = useActionState(
    addVariantToCartAction,
    initialCartActionState,
  );
  const hasAvailableVariant = variants.some(isVariantAvailable);

  if (variants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted p-4">
        <h2 className="text-lg font-semibold">No active variants</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This product cannot be added to the cart until an active variant is
          available.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <section aria-labelledby="variant-heading">
        <h2 id="variant-heading" className="text-lg font-semibold">
          Select size or option
        </h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2" role="radiogroup">
          {variants.map((variant) => {
            const available = isVariantAvailable(variant);

            return (
              <label
                className={cn(
                  "min-h-16 rounded-md border p-3 text-left transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                  available
                    ? "cursor-pointer border-border bg-card hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-muted has-[:checked]:shadow-sm"
                    : "cursor-not-allowed border-border bg-muted opacity-60",
                )}
                key={variant.id}
              >
                <input
                  className="sr-only"
                  defaultChecked={variant.id === initialVariant?.id}
                  disabled={!available}
                  name="variantId"
                  type="radio"
                  value={variant.id}
                />
                <span className="block text-sm font-semibold">
                  {formatVariantMeasure(variant)}
                </span>
                <span className="mt-1 block text-sm text-primary">
                  {formatMoney(variant.price)}
                </span>
                {!available ? (
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Currently unavailable
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      </section>
      <div>
        <label className="text-sm font-medium" htmlFor="cart-quantity">
          Quantity
        </label>
        <input
          className="mt-2 h-11 w-28 rounded-md border border-border bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          defaultValue={1}
          id="cart-quantity"
          inputMode="numeric"
          max={99}
          min={1}
          name="quantity"
          type="number"
        />
      </div>
      <input name="returnPath" type="hidden" value={returnPath} />
      <SubmitButton disabled={!hasAvailableVariant} />
      {state.message ? (
        <p
          aria-live="polite"
          className={cn(
            "text-sm leading-6",
            state.status === "error"
              ? "text-destructive"
              : "text-muted-foreground",
          )}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

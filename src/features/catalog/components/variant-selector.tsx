"use client";

import { useMemo, useState } from "react";

import type { CatalogVariant } from "@/features/catalog/types/catalog";
import {
  formatMoney,
  formatVariantMeasure,
  isVariantAvailable,
} from "@/features/catalog/utils/format";
import { cn } from "@/lib/utils/cn";

export function VariantSelector({ variants }: { variants: CatalogVariant[] }) {
  const initialVariant = useMemo(
    () =>
      variants.find(
        (variant) => variant.isDefault && isVariantAvailable(variant),
      ) ??
      variants.find(isVariantAvailable) ??
      variants[0],
    [variants],
  );
  const [selectedVariantId, setSelectedVariantId] = useState(
    initialVariant?.id ?? "",
  );
  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ??
    initialVariant;

  if (variants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted p-4">
        <h2 className="text-lg font-semibold">No active variants</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This product is visible but cannot be selected until an active variant
          is available.
        </p>
      </div>
    );
  }

  return (
    <section aria-labelledby="variant-heading">
      <h2 id="variant-heading" className="text-lg font-semibold">
        Select size or option
      </h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {variants.map((variant) => {
          const available = isVariantAvailable(variant);

          return (
            <button
              className={cn(
                "min-h-16 rounded-md border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                variant.id === selectedVariant?.id
                  ? "border-primary bg-muted"
                  : "border-border bg-card hover:border-primary/50",
              )}
              disabled={!available}
              key={variant.id}
              onClick={() => setSelectedVariantId(variant.id)}
              type="button"
            >
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
            </button>
          );
        })}
      </div>
      {selectedVariant ? (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Selected: {formatVariantMeasure(selectedVariant)} ·{" "}
          {formatMoney(selectedVariant.price)}
        </p>
      ) : null}
    </section>
  );
}

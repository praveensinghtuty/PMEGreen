import type { CatalogVariant } from "@/features/catalog/types/catalog";

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}

export function formatVariantMeasure(variant: CatalogVariant) {
  if (variant.value && variant.unit) {
    return `${variant.value} ${variant.unit}`;
  }

  return variant.name;
}

export function getVariantSummary(variants: CatalogVariant[]) {
  if (variants.length === 0) {
    return "No active variants";
  }

  if (variants.length === 1) {
    return formatVariantMeasure(variants[0]);
  }

  const preview = variants.slice(0, 3).map(formatVariantMeasure).join(", ");
  const remaining = variants.length - 3;

  return remaining > 0 ? `${preview} +${remaining} more` : preview;
}

export function isVariantAvailable(variant: CatalogVariant) {
  return !variant.trackInventory || variant.stockQuantity > 0;
}

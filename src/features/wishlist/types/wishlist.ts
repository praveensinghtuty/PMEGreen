import type { CatalogProductCard } from "@/features/catalog/types/catalog";

export type WishlistSummary = {
  hiddenItemCount: number;
  products: CatalogProductCard[];
};

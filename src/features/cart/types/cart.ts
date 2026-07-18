import type { CatalogImage } from "@/features/catalog/types/catalog";

export type CartLineItem = {
  id: string;
  image: CatalogImage | null;
  isAvailable: boolean;
  lineTotal: number;
  productName: string | null;
  productSlug: string | null;
  quantity: number;
  unitPrice: number | null;
  variantLabel: string | null;
};

export type CartSummary = {
  items: CartLineItem[];
  subtotal: number;
  unavailableItemCount: number;
};

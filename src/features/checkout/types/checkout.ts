import type { CartSummary } from "@/features/cart/types/cart";

export type CheckoutSettings = {
  shippingCharge: number;
  upiId: null | string;
  upiQr: null | string;
};

export type CheckoutSummary = {
  cart: CartSummary;
  settings: CheckoutSettings;
  total: number;
};

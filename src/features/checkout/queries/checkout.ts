import "server-only";

import { getCartSummary } from "@/features/cart/queries/cart";
import type {
  CheckoutSettings,
  CheckoutSummary,
} from "@/features/checkout/types/checkout";
import { toPublicStorageUrl } from "@/features/catalog/utils/storage";
import { createClient } from "@/lib/supabase/server";

function numberSetting(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, value);
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
  }

  return fallback;
}

function stringSetting(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

export async function getCheckoutSettings(): Promise<CheckoutSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["payment.upi_id", "payment.upi_qr", "shipping.default_charge"]);

  if (error) {
    return { shippingCharge: 0, upiId: null, upiQr: null };
  }

  const settings = new Map(data.map((row) => [row.key, row.value]));
  const rawUpiQr = stringSetting(settings.get("payment.upi_qr"));

  return {
    shippingCharge: numberSetting(settings.get("shipping.default_charge")),
    upiId: stringSetting(settings.get("payment.upi_id")),
    upiQr: rawUpiQr ? toPublicStorageUrl("site-assets", rawUpiQr) : null,
  };
}

export async function getCheckoutSummary(): Promise<CheckoutSummary> {
  const [cart, settings] = await Promise.all([
    getCartSummary(),
    getCheckoutSettings(),
  ]);

  return {
    cart,
    settings,
    total: cart.subtotal + settings.shippingCharge,
  };
}

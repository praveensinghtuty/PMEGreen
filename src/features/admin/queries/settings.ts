import "server-only";

import { requireAdmin } from "@/features/auth/queries/current-user";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/supabase";

export type AdminSettings = {
  businessAddress: string;
  businessEmail: string;
  businessLogo: string;
  businessName: string;
  businessPhone: string;
  paymentUpiId: string;
  paymentUpiQr: string;
  shippingDefaultCharge: number;
};

function asString(value: Json | undefined) {
  return typeof value === "string" ? value : "";
}

function asNumber(value: Json | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export async function getAdminSettings(): Promise<AdminSettings> {
  await requireAdmin("/admin/settings");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value");
  if (error) throw new Error("Unable to load settings");
  const map = new Map(data.map((row) => [row.key, row.value]));
  return {
    businessAddress: asString(map.get("business.address")),
    businessEmail: asString(map.get("business.email")),
    businessLogo: asString(map.get("business.logo")),
    businessName: asString(map.get("business.name")) || "PME Green",
    businessPhone: asString(map.get("business.phone")),
    paymentUpiId: asString(map.get("payment.upi_id")),
    paymentUpiQr: asString(map.get("payment.upi_qr")),
    shippingDefaultCharge: asNumber(map.get("shipping.default_charge")),
  };
}

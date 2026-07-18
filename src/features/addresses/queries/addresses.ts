import "server-only";

import { requireUser } from "@/features/auth/queries/current-user";
import type { CustomerAddress } from "@/features/addresses/types/address";
import { createClient } from "@/lib/supabase/server";

export async function getCustomerAddresses(
  returnPath = "/addresses",
): Promise<CustomerAddress[]> {
  const user = await requireUser(returnPath);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("addresses")
    .select(
      "id, label, full_name, phone, address_line_1, address_line_2, landmark, city, district, state, postal_code, is_default",
    )
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load addresses");
  }

  return data.map((address) => ({
    addressLine1: address.address_line_1,
    addressLine2: address.address_line_2,
    city: address.city,
    district: address.district,
    fullName: address.full_name,
    id: address.id,
    isDefault: address.is_default,
    label: address.label,
    landmark: address.landmark,
    phone: address.phone,
    postalCode: address.postal_code,
    state: address.state,
  }));
}

import "server-only";

import { requireAdmin } from "@/features/auth/queries/current-user";
import { createClient } from "@/lib/supabase/server";

export async function getAdminCustomers() {
  await requireAdmin("/admin/customers");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, email, is_active, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("Unable to load customers");
  return data;
}

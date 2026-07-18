import "server-only";

import { requireAdmin } from "@/features/auth/queries/current-user";
import { createClient } from "@/lib/supabase/server";

export async function getAdminBanners() {
  await requireAdmin("/admin/banners");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error("Unable to load banners");
  return data;
}

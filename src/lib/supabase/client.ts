import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicConfig } from "@/lib/config/env";
import type { Database } from "@/types/supabase";

export function createClient() {
  const config = getSupabasePublicConfig();

  if (!config) {
    throw new Error("Supabase public environment variables are not configured");
  }

  return createBrowserClient<Database>(config.url, config.anonKey);
}

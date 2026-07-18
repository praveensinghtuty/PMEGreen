import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import {
  getSupabasePublicConfig,
  getSupabaseServiceRoleKey,
} from "@/lib/config/env";
import type { Database } from "@/types/supabase";

export function createAdminClient() {
  const publicConfig = getSupabasePublicConfig();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!publicConfig || !serviceRoleKey) {
    throw new Error("Supabase admin environment variables are not configured");
  }

  return createSupabaseClient<Database>(publicConfig.url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

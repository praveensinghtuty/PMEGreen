import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/config/env";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/auth";

function loginRedirect(pathname: string): never {
  redirect(`/auth/login?next=${encodeURIComponent(pathname)}`);
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}

export async function requireUser(pathname: string): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    loginRedirect(pathname);
  }

  return user;
}

export async function getCurrentUserRoles() {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (error) {
    return [];
  }

  return data.map((row) => row.role);
}

export async function requireAdmin(pathname: string) {
  const user = await requireUser(pathname);
  const roles = await getCurrentUserRoles();

  if (!roles.includes("admin" satisfies AppRole)) {
    redirect("/account?forbidden=admin");
  }

  return user;
}

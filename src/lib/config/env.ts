import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_ENABLE_PHONE_OTP: z.enum(["true", "false"]).optional(),
});

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_PROJECT_ID: z.string().min(1).optional(),
});

const parsedPublicEnv = publicEnvSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_ENABLE_PHONE_OTP: process.env.NEXT_PUBLIC_ENABLE_PHONE_OTP,
});

if (!parsedPublicEnv.success) {
  throw new Error("Invalid public environment configuration");
}

export const env = parsedPublicEnv.data;

const parsedServerEnv = serverEnvSchema.safeParse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_PROJECT_ID: process.env.SUPABASE_PROJECT_ID,
});

if (!parsedServerEnv.success) {
  throw new Error("Invalid server environment configuration");
}

export const serverEnv = parsedServerEnv.data;

export function getSiteUrl() {
  return env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function getSupabasePublicConfig() {
  const { NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL } = env;

  if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  return {
    url: NEXT_PUBLIC_SUPABASE_URL,
    anonKey: NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export function isSupabaseConfigured() {
  return getSupabasePublicConfig() !== null;
}

export function isPhoneOtpEnabled() {
  return env.NEXT_PUBLIC_ENABLE_PHONE_OTP === "true";
}

export function getSupabaseServiceRoleKey() {
  return serverEnv.SUPABASE_SERVICE_ROLE_KEY ?? null;
}

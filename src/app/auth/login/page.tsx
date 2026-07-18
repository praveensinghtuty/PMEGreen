import { Suspense } from "react";

import { StoreShell } from "@/components/layout/store-shell";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata = {
  title: "Sign in",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <StoreShell>
      <main className="mx-auto grid min-h-[calc(100svh-8rem)] max-w-5xl items-center px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:px-8">
        <div className="mb-8 lg:mb-0">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-secondary">
            Secure sign in
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Access your account
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
            Use Google OAuth or mobile OTP through Supabase Auth. Phone OTP
            requires a real SMS provider configuration before it is enabled.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="rounded-lg border border-border bg-card p-6">
              Loading sign in...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>
    </StoreShell>
  );
}

"use client";

import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  getSiteUrl,
  isPhoneOtpEnabled,
  isSupabaseConfigured,
} from "@/lib/config/env";
import { createClient } from "@/lib/supabase/client";
import {
  otpTokenSchema,
  phoneNumberSchema,
} from "@/features/auth/schemas/login";

type FormState = {
  status: "idle" | "submitting" | "code-sent" | "success" | "error";
  message: string;
};

function getSafeNext(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = useMemo(
    () => getSafeNext(searchParams.get("next")),
    [searchParams],
  );
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [formState, setFormState] = useState<FormState>({
    status: "idle",
    message: "",
  });

  const supabaseConfigured = isSupabaseConfigured();
  const phoneOtpEnabled = isPhoneOtpEnabled();
  const isSubmitting = formState.status === "submitting";

  async function continueWithGoogle() {
    if (!supabaseConfigured) {
      setFormState({
        status: "error",
        message: "Supabase environment variables are not configured.",
      });
      return;
    }

    setFormState({ status: "submitting", message: "" });

    const supabase = createClient();
    const redirectTo = `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      setFormState({
        status: "error",
        message: error.message,
      });
    }
  }

  async function sendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabaseConfigured || !phoneOtpEnabled) {
      setFormState({
        status: "error",
        message:
          "Phone OTP requires Supabase Auth and a configured SMS provider before it can be used.",
      });
      return;
    }

    const parsedPhone = phoneNumberSchema.safeParse(phone);

    if (!parsedPhone.success) {
      setFormState({
        status: "error",
        message:
          parsedPhone.error.issues[0]?.message ?? "Invalid phone number.",
      });
      return;
    }

    setFormState({ status: "submitting", message: "" });

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      phone: parsedPhone.data,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      setFormState({
        status: "error",
        message: error.message,
      });
      return;
    }

    setFormState({
      status: "code-sent",
      message:
        "OTP requested through Supabase. Enter the code when it arrives.",
    });
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedPhone = phoneNumberSchema.safeParse(phone);
    const parsedToken = otpTokenSchema.safeParse(token);

    if (!parsedPhone.success || !parsedToken.success) {
      setFormState({
        status: "error",
        message:
          parsedPhone.error?.issues[0]?.message ??
          parsedToken.error?.issues[0]?.message ??
          "Check the phone number and OTP.",
      });
      return;
    }

    setFormState({ status: "submitting", message: "" });

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      phone: parsedPhone.data,
      token: parsedToken.data,
      type: "sms",
    });

    if (error) {
      setFormState({
        status: "error",
        message: error.message,
      });
      return;
    }

    window.location.assign(next);
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
      {!supabaseConfigured ? (
        <div className="mb-5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          Supabase environment variables are required before authentication can
          run.
        </div>
      ) : null}

      <Button
        className="w-full"
        disabled={!supabaseConfigured || isSubmitting}
        onClick={continueWithGoogle}
        type="button"
      >
        {isSubmitting ? (
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        ) : null}
        Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-4" onSubmit={sendOtp}>
        <div>
          <label className="text-sm font-medium" htmlFor="phone">
            Mobile number
          </label>
          <input
            autoComplete="tel"
            className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            disabled={!phoneOtpEnabled || isSubmitting}
            id="phone"
            inputMode="tel"
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+919876543210"
            type="tel"
            value={phone}
          />
        </div>
        <Button
          className="w-full"
          disabled={!supabaseConfigured || !phoneOtpEnabled || isSubmitting}
          type="submit"
          variant="outline"
        >
          Send OTP
        </Button>
        {!phoneOtpEnabled ? (
          <p className="text-sm leading-6 text-muted-foreground">
            Phone OTP is wired in the app but disabled until a
            Supabase-supported SMS provider is configured and
            `NEXT_PUBLIC_ENABLE_PHONE_OTP=true` is set.
          </p>
        ) : null}
      </form>

      {formState.status === "code-sent" ? (
        <form className="mt-5 space-y-4" onSubmit={verifyOtp}>
          <div>
            <label className="text-sm font-medium" htmlFor="otp">
              OTP code
            </label>
            <input
              autoComplete="one-time-code"
              className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              id="otp"
              inputMode="numeric"
              onChange={(event) => setToken(event.target.value)}
              type="text"
              value={token}
            />
          </div>
          <Button className="w-full" disabled={isSubmitting} type="submit">
            Verify OTP
          </Button>
        </form>
      ) : null}

      {formState.message ? (
        <p
          aria-live="polite"
          className={
            formState.status === "error"
              ? "mt-4 text-sm leading-6 text-destructive"
              : "mt-4 text-sm leading-6 text-muted-foreground"
          }
        >
          {formState.message}
        </p>
      ) : null}
    </div>
  );
}

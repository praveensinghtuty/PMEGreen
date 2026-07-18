import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

function getSafeNext(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next");

  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = getSafeNext(request);
  redirectTo.search = "";

  if (!code) {
    redirectTo.pathname = "/auth/login";
    redirectTo.search = "?error=missing_code";
    return NextResponse.redirect(redirectTo);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    redirectTo.pathname = "/auth/login";
    redirectTo.search = "?error=callback_failed";
    return NextResponse.redirect(redirectTo);
  }

  return NextResponse.redirect(redirectTo);
}

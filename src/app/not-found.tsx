import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-background px-4 py-12 text-foreground">
      <div className="max-w-md rounded-lg border border-border bg-card p-6 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-secondary">
          Not found
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Page unavailable</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This page is not available in the current foundation phase.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </main>
  );
}

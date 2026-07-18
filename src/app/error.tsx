"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <main className="grid min-h-svh place-items-center bg-background px-4 py-12 text-foreground">
      <div className="max-w-md rounded-lg border border-border bg-card p-6 text-center shadow-sm">
        <AlertTriangle
          aria-hidden="true"
          className="mx-auto size-10 text-destructive"
        />
        <h1 className="mt-4 text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The page could not be loaded. Try again, and avoid sharing any
          sensitive details if you report the issue.
        </p>
        <Button className="mt-6" onClick={reset} type="button">
          Try again
        </Button>
      </div>
    </main>
  );
}

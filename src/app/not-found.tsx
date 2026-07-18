import Link from "next/link";

import { StoreShell } from "@/components/layout/store-shell";
import { EmptyState } from "@/components/storefront/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <StoreShell>
      <main className="mx-auto grid min-h-[calc(100svh-10rem)] max-w-3xl place-items-center px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          action={
            <Button asChild>
              <Link href="/">Go home</Link>
            </Button>
          }
          description="The page may have moved, or it may belong to a later implementation phase."
          title="Page unavailable"
        />
      </main>
    </StoreShell>
  );
}

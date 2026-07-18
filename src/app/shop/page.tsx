import Link from "next/link";

import { StoreShell } from "@/components/layout/store-shell";
import { EmptyState } from "@/components/storefront/empty-state";
import { PageHeader } from "@/components/storefront/page-header";
import { ProductCardSkeleton } from "@/components/storefront/skeleton";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Shop",
  description: "Browse products from the storefront catalog.",
};

export default function ShopPage() {
  return (
    <StoreShell>
      <PageHeader
        description="The shop framework is ready. Product listing queries and approved catalog data are intentionally deferred to Phase 3B."
        eyebrow="Shop"
        title="All products"
      />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </div>
        <div className="mt-8">
          <EmptyState
            action={
              <Button asChild variant="outline">
                <Link href="/categories">Browse categories</Link>
              </Button>
            }
            description="No products are displayed until the public catalog query layer and approved product import are implemented."
            title="No products available yet"
          />
        </div>
      </main>
    </StoreShell>
  );
}

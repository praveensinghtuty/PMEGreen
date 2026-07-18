import { StoreShell } from "@/components/layout/store-shell";
import {
  ProductCardSkeleton,
  Skeleton,
} from "@/components/storefront/skeleton";

export default function Loading() {
  return (
    <StoreShell>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-4 h-10 w-full max-w-lg" />
        <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </div>
      </main>
    </StoreShell>
  );
}

import { StoreShell } from "@/components/layout/store-shell";
import {
  productGridClasses,
  storefrontMain,
} from "@/components/storefront/layout-classes";
import {
  ProductCardSkeleton,
  Skeleton,
} from "@/components/storefront/skeleton";

export default function SearchLoading() {
  return (
    <StoreShell>
      <main aria-busy="true" className={storefrontMain} id="main-content">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-4 h-10 w-full max-w-lg" />
        <Skeleton className="mt-8 h-11 w-full" />
        <div className={`mt-8 ${productGridClasses}`}>
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </div>
      </main>
    </StoreShell>
  );
}

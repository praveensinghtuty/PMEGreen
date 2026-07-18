import { StoreShell } from "@/components/layout/store-shell";
import { storefrontMain } from "@/components/storefront/layout-classes";
import { Skeleton } from "@/components/storefront/skeleton";

export default function CartLoading() {
  return (
    <StoreShell>
      <main aria-busy="true" className={storefrontMain} id="main-content">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="mt-4 h-10 w-full max-w-lg" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-56 w-full" />
        </div>
      </main>
    </StoreShell>
  );
}

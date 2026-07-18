import { StoreShell } from "@/components/layout/store-shell";
import { storefrontMain } from "@/components/storefront/layout-classes";
import { Skeleton } from "@/components/storefront/skeleton";

export default function CheckoutLoading() {
  return (
    <StoreShell>
      <main className={storefrontMain} id="main-content">
        <Skeleton className="h-28" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </main>
    </StoreShell>
  );
}

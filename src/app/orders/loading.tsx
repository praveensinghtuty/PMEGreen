import { StoreShell } from "@/components/layout/store-shell";
import { storefrontMain } from "@/components/storefront/layout-classes";
import { Skeleton } from "@/components/storefront/skeleton";

export default function OrdersLoading() {
  return (
    <StoreShell>
      <main className={storefrontMain} id="main-content">
        <Skeleton className="h-28" />
        <div className="grid gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </main>
    </StoreShell>
  );
}

import { StoreShell } from "@/components/layout/store-shell";
import { storefrontMain } from "@/components/storefront/layout-classes";
import { Skeleton } from "@/components/storefront/skeleton";

export default function AddressesLoading() {
  return (
    <StoreShell>
      <main className={storefrontMain} id="main-content">
        <Skeleton className="h-28" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <Skeleton className="h-56" />
          <Skeleton className="h-96" />
        </div>
      </main>
    </StoreShell>
  );
}

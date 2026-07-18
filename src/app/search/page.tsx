import { Search } from "lucide-react";

import { StoreShell } from "@/components/layout/store-shell";
import { EmptyState } from "@/components/storefront/empty-state";
import { PageHeader } from "@/components/storefront/page-header";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Search",
  description: "Search storefront products.",
};

export default function SearchPage() {
  return (
    <StoreShell>
      <PageHeader
        description="Search UI is ready. Product search behavior is deferred until public catalog queries exist."
        eyebrow="Search"
        title="Find products"
      />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <form className="flex flex-col gap-3 sm:flex-row" role="search">
          <label className="sr-only" htmlFor="site-search">
            Search products
          </label>
          <input
            className="h-11 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            disabled
            id="site-search"
            placeholder="Search will be enabled with catalog data"
            type="search"
          />
          <Button disabled type="submit">
            <Search aria-hidden="true" className="size-4" />
            Search
          </Button>
        </form>
        <div className="mt-8">
          <EmptyState
            description="Search results will appear after Phase 3B adds query support for the public catalog."
            icon={Search}
            title="Search is not active yet"
          />
        </div>
      </main>
    </StoreShell>
  );
}

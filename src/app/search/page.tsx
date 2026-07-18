import { Search } from "lucide-react";

import { StoreShell } from "@/components/layout/store-shell";
import { EmptyState } from "@/components/storefront/empty-state";
import { storefrontMain } from "@/components/storefront/layout-classes";
import { PageHeader } from "@/components/storefront/page-header";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/features/catalog/components/catalog-controls";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { getPublicProductCards } from "@/features/catalog/queries/catalog";
import { parseCatalogSearchParams } from "@/features/catalog/utils/params";
import { canonicalMetadata } from "@/lib/seo/metadata";

export const metadata = {
  title: "Search",
  description: "Search storefront products.",
  robots: {
    index: false,
    follow: true,
  },
  ...canonicalMetadata("/search"),
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = parseCatalogSearchParams(await searchParams);
  const results = params.query
    ? await getPublicProductCards({
        page: params.page,
        query: params.query,
        sort: params.sort,
      })
    : null;

  return (
    <StoreShell>
      <PageHeader
        description="Search active storefront products by name."
        eyebrow="Search"
        title="Find products"
      />
      <main className={storefrontMain} id="main-content">
        <form
          className="rounded-lg border border-border bg-card p-4 shadow-sm sm:flex sm:items-end sm:gap-3"
          role="search"
        >
          <div className="min-w-0 flex-1">
            <label className="sr-only" htmlFor="site-search">
              Search products
            </label>
            <input
              aria-describedby="site-search-help"
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-base placeholder:text-muted-foreground/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              defaultValue={params.query}
              id="site-search"
              maxLength={80}
              name="q"
              placeholder="Search by product name"
              type="search"
            />
            <p
              className="mt-2 text-xs leading-5 text-muted-foreground"
              id="site-search-help"
            >
              Searches active storefront product names only.
            </p>
          </div>
          <Button className="mt-3 w-full sm:mt-0 sm:w-auto" type="submit">
            <Search aria-hidden="true" className="size-4" />
            Search
          </Button>
        </form>
        <div className="mt-8">
          {results ? (
            <>
              <ProductGrid
                emptyDescription="No active products match this search. Try a different product name."
                products={results.products}
              />
              <Pagination
                page={results.page}
                query={params.query}
                sort={params.sort}
                totalPages={results.totalPages}
              />
            </>
          ) : (
            <EmptyState
              description="Enter a product name to search the active storefront catalog."
              icon={Search}
              title="Search the catalog"
            />
          )}
        </div>
      </main>
    </StoreShell>
  );
}

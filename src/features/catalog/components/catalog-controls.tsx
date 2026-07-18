import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import type {
  CatalogCategory,
  CatalogSort,
} from "@/features/catalog/types/catalog";
import { buildCatalogHref } from "@/features/catalog/utils/params";
import { cn } from "@/lib/utils/cn";

type CatalogControlsProps = {
  categories: CatalogCategory[];
  productCount?: number;
  selectedCategory?: string;
  query?: string;
  sort: CatalogSort;
  totalProducts?: number;
};

const sortOptions: { label: string; value: CatalogSort }[] = [
  { label: "Featured", value: "featured" },
  { label: "Name", value: "name-asc" },
  { label: "Price low to high", value: "price-asc" },
  { label: "Price high to low", value: "price-desc" },
  { label: "Newest", value: "newest" },
];

export function CatalogControls({
  categories,
  productCount,
  query,
  selectedCategory,
  sort,
  totalProducts,
}: CatalogControlsProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium">Catalog filters</p>
        {typeof totalProducts === "number" ? (
          <p aria-live="polite" className="text-sm text-muted-foreground">
            Showing {productCount ?? 0} of {totalProducts} active products
          </p>
        ) : null}
      </div>
      <form
        action="/shop"
        className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem_12rem_auto]"
      >
        <div>
          <label className="text-sm font-medium" htmlFor="catalog-query">
            Search products
          </label>
          <input
            className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-base placeholder:text-muted-foreground/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            defaultValue={query}
            id="catalog-query"
            maxLength={80}
            name="q"
            placeholder="Search by product name"
            type="search"
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="catalog-category">
            Category
          </label>
          <select
            className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            defaultValue={selectedCategory ?? ""}
            id="catalog-category"
            name="category"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="catalog-sort">
            Sort
          </label>
          <select
            className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            defaultValue={sort}
            id="catalog-sort"
            name="sort"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex md:items-end">
          <Button type="submit">Apply</Button>
          <Button asChild variant="outline">
            <Link href="/shop">Reset</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

export function Pagination({
  category,
  page,
  query,
  sort,
  totalPages,
}: {
  category?: string;
  page: number;
  query?: string;
  sort: CatalogSort;
  totalPages: number;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const previousDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <nav
      aria-label="Product pages"
      className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6"
    >
      {previousDisabled ? (
        <span
          aria-disabled="true"
          className={cn(buttonVariants({ variant: "outline" }), "opacity-50")}
        >
          Previous
        </span>
      ) : (
        <Button asChild variant="outline">
          <Link
            href={buildCatalogHref({ category, page: page - 1, query, sort })}
          >
            Previous
          </Link>
        </Button>
      )}
      <p aria-live="polite" className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      {nextDisabled ? (
        <span
          aria-disabled="true"
          className={cn(buttonVariants({ variant: "outline" }), "opacity-50")}
        >
          Next
        </span>
      ) : (
        <Button asChild variant="outline">
          <Link
            href={buildCatalogHref({ category, page: page + 1, query, sort })}
          >
            Next
          </Link>
        </Button>
      )}
    </nav>
  );
}

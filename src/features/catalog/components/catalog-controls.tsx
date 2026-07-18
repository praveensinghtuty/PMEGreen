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
  selectedCategory?: string;
  query?: string;
  sort: CatalogSort;
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
  query,
  selectedCategory,
  sort,
}: CatalogControlsProps) {
  return (
    <form
      action="/shop"
      className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-sm md:grid-cols-[1fr_14rem_12rem_auto]"
    >
      <div>
        <label className="text-sm font-medium" htmlFor="catalog-query">
          Search products
        </label>
        <input
          className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
      <div className="flex items-end gap-2">
        <Button className="flex-1 md:flex-none" type="submit">
          Apply
        </Button>
        <Button asChild variant="outline">
          <Link href="/shop">Reset</Link>
        </Button>
      </div>
    </form>
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
      className="mt-8 flex items-center justify-between gap-3"
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
      <p className="text-sm text-muted-foreground">
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

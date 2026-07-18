import { StoreShell } from "@/components/layout/store-shell";
import { PageHeader } from "@/components/storefront/page-header";
import {
  CatalogControls,
  Pagination,
} from "@/features/catalog/components/catalog-controls";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import {
  getPublicCategories,
  getPublicProductCards,
} from "@/features/catalog/queries/catalog";
import { parseCatalogSearchParams } from "@/features/catalog/utils/params";

export const metadata = {
  title: "Shop",
  description: "Browse products from the storefront catalog.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = parseCatalogSearchParams(await searchParams);
  const [categories, catalogPage] = await Promise.all([
    getPublicCategories(),
    getPublicProductCards({
      categorySlug: params.category,
      page: params.page,
      query: params.query,
      sort: params.sort,
    }),
  ]);

  return (
    <StoreShell>
      <PageHeader
        description="Browse active storefront products. Draft and inactive products are excluded by query filters and database RLS."
        eyebrow="Shop"
        title="All products"
      />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <CatalogControls
          categories={categories}
          query={params.query}
          selectedCategory={params.category}
          sort={params.sort}
        />
        <div className="mt-8">
          <ProductGrid
            emptyDescription="No active products match the current filters. Try a different category or search term."
            products={catalogPage.products}
          />
        </div>
        <Pagination
          category={params.category}
          page={catalogPage.page}
          query={params.query}
          sort={params.sort}
          totalPages={catalogPage.totalPages}
        />
      </main>
    </StoreShell>
  );
}

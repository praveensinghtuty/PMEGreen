import { StoreShell } from "@/components/layout/store-shell";
import { storefrontMain } from "@/components/storefront/layout-classes";
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
import { getWishlistProductIds } from "@/features/wishlist/queries/wishlist";
import { canonicalMetadata } from "@/lib/seo/metadata";

export const metadata = {
  title: "Shop",
  description: "Browse products from the storefront catalog.",
  ...canonicalMetadata("/shop"),
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = parseCatalogSearchParams(await searchParams);
  const [categories, catalogPage, wishlistedProductIds] = await Promise.all([
    getPublicCategories(),
    getPublicProductCards({
      categorySlug: params.category,
      page: params.page,
      query: params.query,
      sort: params.sort,
    }),
    getWishlistProductIds(),
  ]);

  return (
    <StoreShell>
      <PageHeader
        description="Browse active storefront products. Draft and inactive products are excluded by query filters and database RLS."
        eyebrow="Shop"
        title="All products"
      />
      <main className={storefrontMain} id="main-content">
        <CatalogControls
          categories={categories}
          productCount={catalogPage.products.length}
          query={params.query}
          selectedCategory={params.category}
          sort={params.sort}
          totalProducts={catalogPage.total}
        />
        <div className="mt-8">
          <ProductGrid
            emptyDescription="No active products match the current filters. Try a different category or search term."
            products={catalogPage.products}
            returnPath="/shop"
            wishlistedProductIds={wishlistedProductIds}
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

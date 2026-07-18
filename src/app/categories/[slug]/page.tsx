import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StoreShell } from "@/components/layout/store-shell";
import { storefrontMain } from "@/components/storefront/layout-classes";
import { PageHeader } from "@/components/storefront/page-header";
import { Pagination } from "@/features/catalog/components/catalog-controls";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import {
  getPublicCategoryBySlug,
  getPublicProductCards,
} from "@/features/catalog/queries/catalog";
import {
  parseCatalogSearchParams,
  parseSlug,
} from "@/features/catalog/utils/params";
import { getWishlistProductIds } from "@/features/wishlist/queries/wishlist";
import { canonicalMetadata } from "@/lib/seo/metadata";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsedSlug = parseSlug(slug);

  if (!parsedSlug.success) {
    return { title: "Category not found" };
  }

  const category = await getPublicCategoryBySlug(parsedSlug.data);

  if (!category) {
    return { title: "Category not found" };
  }

  return {
    title: category.name,
    description:
      category.description ?? `Browse active products in ${category.name}.`,
    openGraph: {
      description:
        category.description ?? `Browse active products in ${category.name}.`,
      title: category.name,
    },
    ...canonicalMetadata(`/categories/${category.slug}`),
  };
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const parsedSlug = parseSlug(slug);

  if (!parsedSlug.success) {
    notFound();
  }

  const category = await getPublicCategoryBySlug(parsedSlug.data);

  if (!category) {
    notFound();
  }

  const catalogParams = parseCatalogSearchParams((await searchParams) ?? {});
  const [catalogPage, wishlistedProductIds] = await Promise.all([
    getPublicProductCards({
      category,
      page: catalogParams.page,
      sort: catalogParams.sort,
    }),
    getWishlistProductIds(),
  ]);

  return (
    <StoreShell>
      <PageHeader
        description={
          category.description ?? "Browse active products in this category."
        }
        eyebrow="Category"
        title={category.name}
      />
      <main className={storefrontMain} id="main-content">
        <ProductGrid
          emptyDescription="No active products are available in this category yet."
          products={catalogPage.products}
          returnPath={`/categories/${category.slug}`}
          wishlistedProductIds={wishlistedProductIds}
        />
        <Pagination
          category={category.slug}
          page={catalogPage.page}
          sort={catalogParams.sort}
          totalPages={catalogPage.totalPages}
        />
      </main>
    </StoreShell>
  );
}

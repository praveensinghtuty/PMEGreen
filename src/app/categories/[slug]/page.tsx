import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StoreShell } from "@/components/layout/store-shell";
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
  const catalogPage = await getPublicProductCards({
    categorySlug: category.slug,
    page: catalogParams.page,
    sort: catalogParams.sort,
  });

  return (
    <StoreShell>
      <PageHeader
        description={
          category.description ?? "Browse active products in this category."
        }
        eyebrow="Category"
        title={category.name}
      />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <ProductGrid
          emptyDescription="No active products are available in this category yet."
          products={catalogPage.products}
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

import { StoreShell } from "@/components/layout/store-shell";
import { CategoryCard } from "@/components/storefront/category-card";
import { EmptyState } from "@/components/storefront/empty-state";
import {
  categoryGridClasses,
  storefrontMain,
} from "@/components/storefront/layout-classes";
import { PageHeader } from "@/components/storefront/page-header";
import { getPublicCategories } from "@/features/catalog/queries/catalog";
import { canonicalMetadata } from "@/lib/seo/metadata";

export const metadata = {
  title: "Categories",
  description: "Browse storefront categories.",
  ...canonicalMetadata("/categories"),
};

export default async function CategoriesPage() {
  const categories = await getPublicCategories();

  return (
    <StoreShell>
      <PageHeader
        description="Browse active storefront categories. Inactive categories are not shown publicly."
        eyebrow="Categories"
        title="Browse by category"
      />
      <main className={storefrontMain} id="main-content">
        {categories.length > 0 ? (
          <div className={categoryGridClasses}>
            {categories.map((category) => (
              <CategoryCard
                description={
                  category.description ??
                  "Browse active products in this category."
                }
                href={`/categories/${category.slug}`}
                imageSrc={category.imageSrc ?? undefined}
                key={category.id}
                name={category.name}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            description="No active categories are available yet. Category data will appear here after it is added through approved workflows."
            title="No categories available yet"
          />
        )}
      </main>
    </StoreShell>
  );
}

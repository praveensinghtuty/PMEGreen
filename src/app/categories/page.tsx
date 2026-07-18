import { StoreShell } from "@/components/layout/store-shell";
import { CategoryCard } from "@/components/storefront/category-card";
import { EmptyState } from "@/components/storefront/empty-state";
import { PageHeader } from "@/components/storefront/page-header";
import { getPublicCategories } from "@/features/catalog/queries/catalog";

export const metadata = {
  title: "Categories",
  description: "Browse storefront categories.",
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
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {categories.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

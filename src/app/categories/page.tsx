import { StoreShell } from "@/components/layout/store-shell";
import { CategoryCard } from "@/components/storefront/category-card";
import { EmptyState } from "@/components/storefront/empty-state";
import { PageHeader } from "@/components/storefront/page-header";

export const metadata = {
  title: "Categories",
  description: "Browse storefront categories.",
};

const placeholderCategories = [
  {
    name: "Oils",
    description:
      "A placeholder category for oil products after catalog verification.",
    href: "/shop",
  },
  {
    name: "Health Mixes",
    description:
      "A placeholder category for mixes and powders after catalog verification.",
    href: "/shop",
  },
  {
    name: "Snacks",
    description:
      "A placeholder category for laddus and snacks after catalog verification.",
    href: "/shop",
  },
  {
    name: "Personal Care",
    description:
      "A placeholder category for soaps and care products after catalog verification.",
    href: "/shop",
  },
];

export default function CategoriesPage() {
  return (
    <StoreShell>
      <PageHeader
        description="Category browsing structure is in place. Final taxonomy will be confirmed from source catalog data in a later phase."
        eyebrow="Categories"
        title="Browse by category"
      />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {placeholderCategories.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {placeholderCategories.map((category) => (
              <CategoryCard key={category.name} {...category} />
            ))}
          </div>
        ) : (
          <EmptyState
            description="Categories will appear after the catalog taxonomy is reviewed and implemented."
            title="No categories available yet"
          />
        )}
      </main>
    </StoreShell>
  );
}

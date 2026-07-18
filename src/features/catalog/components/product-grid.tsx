import Link from "next/link";

import { EmptyState } from "@/components/storefront/empty-state";
import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import type { CatalogProductCard } from "@/features/catalog/types/catalog";
import { formatMoney } from "@/features/catalog/utils/format";

export function ProductGrid({
  emptyDescription,
  products,
}: {
  emptyDescription: string;
  products: CatalogProductCard[];
}) {
  if (products.length === 0) {
    return (
      <EmptyState
        action={
          <Button asChild variant="outline">
            <Link href="/categories">Browse categories</Link>
          </Button>
        }
        description={emptyDescription}
        title="No products found"
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          categoryLabel={product.category.name}
          href={`/products/${product.slug}`}
          imageAlt={product.primaryImage?.alt}
          imageSrc={product.primaryImage?.src}
          key={product.id}
          name={product.name}
          priceLabel={
            product.startingPrice
              ? `From ${formatMoney(product.startingPrice)}`
              : undefined
          }
          unavailable={!product.isAvailable}
          variantSummary={product.variantSummary}
        />
      ))}
    </div>
  );
}

import Link from "next/link";

import { EmptyState } from "@/components/storefront/empty-state";
import { productGridClasses } from "@/components/storefront/layout-classes";
import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import type { CatalogProductCard } from "@/features/catalog/types/catalog";
import { formatMoney } from "@/features/catalog/utils/format";
import { WishlistToggleForm } from "@/features/wishlist/components/wishlist-toggle-form";

export function ProductGrid({
  emptyDescription,
  products,
  returnPath = "/shop",
  wishlistedProductIds = new Set<string>(),
}: {
  emptyDescription: string;
  products: CatalogProductCard[];
  returnPath?: string;
  wishlistedProductIds?: Set<string>;
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
    <div className={productGridClasses}>
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
          wishlistAction={
            <WishlistToggleForm
              isWishlisted={wishlistedProductIds.has(product.id)}
              productId={product.id}
              returnPath={returnPath}
            />
          }
        />
      ))}
    </div>
  );
}

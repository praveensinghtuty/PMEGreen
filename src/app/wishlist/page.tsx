import Link from "next/link";

import { StoreShell } from "@/components/layout/store-shell";
import { EmptyState } from "@/components/storefront/empty-state";
import {
  productGridClasses,
  storefrontMain,
} from "@/components/storefront/layout-classes";
import { PageHeader } from "@/components/storefront/page-header";
import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/features/catalog/utils/format";
import { WishlistToggleForm } from "@/features/wishlist/components/wishlist-toggle-form";
import { getWishlistSummary } from "@/features/wishlist/queries/wishlist";

export const metadata = {
  title: "Wishlist",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function WishlistPage() {
  const wishlist = await getWishlistSummary();
  const wishlistedProductIds = new Set(
    wishlist.products.map((product) => product.id),
  );

  return (
    <StoreShell>
      <PageHeader
        description="Saved active products appear here. Products that are no longer public are hidden without exposing unpublished details."
        eyebrow="Wishlist"
        title="Your wishlist"
      />
      <main className={storefrontMain} id="main-content">
        {wishlist.hiddenItemCount > 0 ? (
          <p
            className="mb-4 rounded-md border border-border bg-muted px-4 py-3 text-sm text-muted-foreground"
            role="status"
          >
            {wishlist.hiddenItemCount} saved product
            {wishlist.hiddenItemCount === 1 ? "" : "s"} no longer appear in the
            public catalog.
          </p>
        ) : null}
        {wishlist.products.length > 0 ? (
          <div className={productGridClasses}>
            {wishlist.products.map((product) => (
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
                    returnPath="/wishlist"
                  />
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            action={
              <Button asChild>
                <Link href="/shop">Browse products</Link>
              </Button>
            }
            description="Save active products from the shop or product detail pages."
            title="Your wishlist is empty"
          />
        )}
      </main>
    </StoreShell>
  );
}

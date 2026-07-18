import { ArrowRight, Leaf, PackageSearch, Sprout, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { StoreShell } from "@/components/layout/store-shell";
import { CategoryCard } from "@/components/storefront/category-card";
import { EmptyState } from "@/components/storefront/empty-state";
import {
  categoryGridClasses,
  productGridClasses,
} from "@/components/storefront/layout-classes";
import { ProductCard } from "@/components/storefront/product-card";
import { Section } from "@/components/storefront/section";
import { Button } from "@/components/ui/button";
import {
  getPublicCategories,
  getPublicProductCards,
} from "@/features/catalog/queries/catalog";
import { formatMoney } from "@/features/catalog/utils/format";
import { WishlistToggleForm } from "@/features/wishlist/components/wishlist-toggle-form";
import { getWishlistProductIds } from "@/features/wishlist/queries/wishlist";
import { placeholderAssets, placeholderCopy } from "@/lib/placeholders/content";
import { canonicalMetadata } from "@/lib/seo/metadata";

const trustHighlights = [
  {
    title: "Tamil Nadu focused",
    description:
      "The v1 storefront is designed around the confirmed delivery region.",
    icon: Truck,
  },
  {
    title: "Honest content",
    description:
      "No invented claims, certifications, reviews, or product facts are shown.",
    icon: Leaf,
  },
  {
    title: "Ready to grow",
    description:
      "Reusable sections and cards keep browsing consistent across the storefront.",
    icon: Sprout,
  },
];

export const metadata = {
  ...canonicalMetadata("/"),
};

export default async function HomePage() {
  const [categories, catalogPage, wishlistedProductIds] = await Promise.all([
    getPublicCategories(),
    getPublicProductCards({
      page: 1,
      sort: "featured",
    }),
    getWishlistProductIds(),
  ]);
  const featuredProducts = catalogPage.products.slice(0, 4);

  return (
    <StoreShell>
      <main id="main-content">
        <section className="border-b border-border bg-muted">
          <div className="mx-auto grid min-h-[calc(100svh-7rem)] max-w-6xl content-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-secondary">
                Traditional products storefront
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                {placeholderCopy.storefrontHeadline}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {placeholderCopy.storefrontIntro}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/shop">
                    Browse shop
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/categories">View categories</Link>
                </Button>
              </div>
            </div>

            <div className="relative min-h-80 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <Image
                alt="Placeholder banner for future store photography"
                className="object-cover"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                src={placeholderAssets.banner}
              />
              <div className="absolute inset-x-0 bottom-0 bg-background/92 p-5 backdrop-blur">
                <p className="text-sm font-semibold text-primary">
                  Real photography pending
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Product and brand assets are centralized placeholders until
                  the owner supplies final media.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Section
          description="Browse active categories currently available in the storefront catalog."
          eyebrow="Explore"
          title="Shop by category"
        >
          {categories.length > 0 ? (
            <div className={categoryGridClasses}>
              {categories.slice(0, 4).map((category) => (
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
              action={
                <Button asChild variant="outline">
                  <Link href="/shop">Browse shop</Link>
                </Button>
              }
              description="Active categories will appear here after approved catalog data is added."
              title="No categories available yet"
            />
          )}
        </Section>

        <Section
          className="bg-muted"
          description="A quick view of active storefront products. Draft and inactive products stay hidden."
          eyebrow="Catalog"
          title="Featured products"
        >
          {featuredProducts.length > 0 ? (
            <div className={productGridClasses}>
              {featuredProducts.map((product) => (
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
                      returnPath="/"
                    />
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              action={
                <Button asChild variant="outline">
                  <Link href="/shop">Open shop page</Link>
                </Button>
              }
              description="Active products will appear here after approved catalog data is added."
              icon={PackageSearch}
              title="No products available yet"
            />
          )}
        </Section>

        <Section eyebrow="Principles" title="Built for a careful first launch">
          <div className="grid gap-4 md:grid-cols-3">
            {trustHighlights.map((item) => (
              <article
                className="rounded-lg border border-border bg-card p-5 shadow-sm"
                key={item.title}
              >
                <item.icon aria-hidden="true" className="size-6 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </Section>

        <Section
          className="border-t border-border bg-muted"
          title="Brand story"
        >
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <Leaf aria-hidden="true" className="size-7 text-primary" />
              <h2 className="mt-4 text-xl font-semibold">Content pending</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The final business story, sourcing details, ingredients, and
                claims must come from verified owner-provided content.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <h2 className="text-xl font-semibold">Contact preview</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Public phone, email, address, social links, and ordering details
                will be configured later. This section reserves the layout
                without publishing placeholder contact facts.
              </p>
            </div>
          </div>
        </Section>
      </main>
    </StoreShell>
  );
}

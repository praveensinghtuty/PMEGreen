import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StoreShell } from "@/components/layout/store-shell";
import { PageHeader } from "@/components/storefront/page-header";
import { Section } from "@/components/storefront/section";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProductGallery } from "@/features/catalog/components/product-gallery";
import { ProductInformation } from "@/features/catalog/components/product-information";
import { VariantSelector } from "@/features/catalog/components/variant-selector";
import { getPublicProductBySlug } from "@/features/catalog/queries/catalog";
import {
  formatMoney,
  isVariantAvailable,
} from "@/features/catalog/utils/format";
import { parseSlug } from "@/features/catalog/utils/params";
import { absoluteUrl, canonicalMetadata } from "@/lib/seo/metadata";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsedSlug = parseSlug(slug);

  if (!parsedSlug.success) {
    return { title: "Product not found" };
  }

  const product = await getPublicProductBySlug(parsedSlug.data);

  if (!product) {
    return { title: "Product not found" };
  }

  return {
    title: product.name,
    description:
      product.shortDescription ??
      `View active variants and details for ${product.name}.`,
    ...canonicalMetadata(`/products/${product.slug}`),
    openGraph: {
      description:
        product.shortDescription ??
        `View active variants and details for ${product.name}.`,
      images: product.primaryImage ? [product.primaryImage.src] : undefined,
      title: product.name,
      url: absoluteUrl(`/products/${product.slug}`),
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const parsedSlug = parseSlug(slug);

  if (!parsedSlug.success) {
    notFound();
  }

  const product = await getPublicProductBySlug(parsedSlug.data);

  if (!product) {
    notFound();
  }

  const availableVariants = product.variants.filter(isVariantAvailable);
  const structuredData =
    product.startingPrice && availableVariants.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          category: product.category.name,
          description: product.shortDescription ?? undefined,
          image: product.primaryImage ? [product.primaryImage.src] : undefined,
          name: product.name,
          offers: {
            "@type": "AggregateOffer",
            availability: "https://schema.org/InStock",
            lowPrice: product.startingPrice,
            offerCount: availableVariants.length,
            priceCurrency: "INR",
            url: absoluteUrl(`/products/${product.slug}`),
          },
          url: absoluteUrl(`/products/${product.slug}`),
        }
      : null;

  return (
    <StoreShell>
      <PageHeader
        description={product.shortDescription ?? "Active storefront product"}
        eyebrow={product.category.name}
        title={product.name}
      />
      <main id="main-content">
        <Section>
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <ProductGallery
              images={product.images}
              productName={product.name}
            />
            <div className="space-y-6">
              <div>
                <Link
                  className="text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                  href={`/categories/${product.category.slug}`}
                >
                  {product.category.name}
                </Link>
                <p className="mt-4 text-3xl font-semibold">
                  {product.startingPrice
                    ? `From ${formatMoney(product.startingPrice)}`
                    : "Price pending"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {product.variantSummary}
                </p>
              </div>
              <VariantSelector variants={product.variants} />
              <Card className="bg-muted">
                <CardHeader>
                  <h2 className="text-lg font-semibold">Ordering note</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Cart, checkout, payment, and order creation are implemented
                    in later phases. This page only supports browsing and
                    variant review.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </Section>
        {structuredData ? (
          <script
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData),
            }}
            type="application/ld+json"
          />
        ) : null}

        <Section className="bg-muted" title="Product information">
          <ProductInformation
            details={[
              { label: "Description", value: product.description },
              { label: "Benefits", value: product.benefits },
              { label: "Ingredients", value: product.ingredients },
              { label: "Usage", value: product.usageInstructions },
              { label: "Storage", value: product.storageInstructions },
              { label: "Shelf life", value: product.shelfLife },
            ]}
          />
        </Section>
      </main>
    </StoreShell>
  );
}

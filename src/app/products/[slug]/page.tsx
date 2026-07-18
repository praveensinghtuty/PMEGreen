import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StoreShell } from "@/components/layout/store-shell";
import { EmptyState } from "@/components/storefront/empty-state";
import { PageHeader } from "@/components/storefront/page-header";
import { Section } from "@/components/storefront/section";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProductGallery } from "@/features/catalog/components/product-gallery";
import { VariantSelector } from "@/features/catalog/components/variant-selector";
import { getPublicProductBySlug } from "@/features/catalog/queries/catalog";
import { formatMoney } from "@/features/catalog/utils/format";
import { parseSlug } from "@/features/catalog/utils/params";

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
    openGraph: {
      images: product.primaryImage ? [product.primaryImage.src] : undefined,
      title: product.name,
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

  return (
    <StoreShell>
      <PageHeader
        description={product.shortDescription ?? "Active storefront product"}
        eyebrow={product.category.name}
        title={product.name}
      />
      <main>
        <Section>
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
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
              <Card>
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

        <Section className="bg-muted" title="Product information">
          {[
            product.description,
            product.benefits,
            product.ingredients,
            product.usageInstructions,
            product.storageInstructions,
            product.shelfLife,
          ].some(Boolean) ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Description", product.description],
                ["Benefits", product.benefits],
                ["Ingredients", product.ingredients],
                ["Usage", product.usageInstructions],
                ["Storage", product.storageInstructions],
                ["Shelf life", product.shelfLife],
              ].map(([label, value]) =>
                value ? (
                  <Card key={label}>
                    <CardHeader>
                      <h2 className="text-lg font-semibold">{label}</h2>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {value}
                      </p>
                    </CardContent>
                  </Card>
                ) : null,
              )}
            </div>
          ) : (
            <EmptyState
              description="Additional product information has not been provided yet. No claims or details are invented."
              title="Details pending"
            />
          )}
        </Section>
      </main>
    </StoreShell>
  );
}

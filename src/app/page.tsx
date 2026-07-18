import { ArrowRight, Leaf, PackageSearch, Sprout, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { StoreShell } from "@/components/layout/store-shell";
import { CategoryCard } from "@/components/storefront/category-card";
import { EmptyState } from "@/components/storefront/empty-state";
import { Section } from "@/components/storefront/section";
import { Button } from "@/components/ui/button";
import { placeholderAssets, placeholderCopy } from "@/lib/placeholders/content";

const categoryPlaceholders = [
  {
    name: "Oils",
    description:
      "Cold-pressed and traditional oils will be organized here after catalog import.",
    href: "/categories",
  },
  {
    name: "Traditional Snacks",
    description:
      "Laddus and snacks from the verified catalog source will appear in a later phase.",
    href: "/categories",
  },
  {
    name: "Personal Care",
    description:
      "Soaps, hair oils, and care products will use real product data when available.",
    href: "/categories",
  },
];

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
      "Reusable sections and cards are ready for catalog data in Phase 3B.",
    icon: Sprout,
  },
];

export default function HomePage() {
  return (
    <StoreShell>
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
                Product and brand assets are centralized placeholders until the
                owner supplies final media.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Section
        description="These are structural placeholders only. Final taxonomy and catalog data will come from the approved import flow later."
        eyebrow="Explore"
        title="Shop by category"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryPlaceholders.map((category) => (
            <CategoryCard key={category.name} {...category} />
          ))}
        </div>
      </Section>

      <Section
        className="bg-muted"
        description="The database is ready, but products are not imported in Phase 3A."
        eyebrow="Catalog"
        title="Featured products"
      >
        <EmptyState
          action={
            <Button asChild variant="outline">
              <Link href="/shop">Open shop page</Link>
            </Button>
          }
          description="Product cards will appear here after Phase 3B adds public catalog queries and approved product data."
          icon={PackageSearch}
          title="No products available yet"
        />
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

      <Section className="border-t border-border bg-muted" title="Brand story">
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
              will be configured later. This section reserves the layout without
              publishing placeholder contact facts.
            </p>
          </div>
        </div>
      </Section>
    </StoreShell>
  );
}

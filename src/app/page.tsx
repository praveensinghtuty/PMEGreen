import { ArrowRight, Leaf, PackageSearch, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { StoreShell } from "@/components/layout/store-shell";
import { Button } from "@/components/ui/button";
import { placeholderCopy } from "@/lib/placeholders/content";

const foundationHighlights = [
  {
    title: "Mobile-first storefront shell",
    description:
      "Responsive navigation and page structure are ready for catalog work in a later phase.",
    icon: Leaf,
  },
  {
    title: "Placeholder asset strategy",
    description:
      "Branding, product, category, banner, and UPI placeholders are centralized for replacement.",
    icon: PackageSearch,
  },
  {
    title: "Security-aware foundation",
    description:
      "Environment validation and Supabase client boundaries are prepared without starting auth or database schema work.",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <StoreShell>
      <section className="border-b border-border bg-muted">
        <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl content-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-secondary">
              Foundation phase
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              {placeholderCopy.storefrontHeadline}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {placeholderCopy.storefrontIntro}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/admin">
                  View admin shell
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/account">View account shell</Link>
              </Button>
            </div>
          </div>

          <div
            aria-label="Placeholder product photography area"
            className="grid min-h-80 place-items-center rounded-lg border border-border bg-card p-6 shadow-sm"
          >
            <div className="w-full max-w-sm rounded-md border border-dashed border-border bg-background p-6 text-center">
              <div className="mx-auto grid size-24 place-items-center rounded-full bg-primary text-primary-foreground">
                <Leaf aria-hidden="true" className="size-10" />
              </div>
              <h2 className="mt-5 text-xl font-semibold">
                Product imagery placeholder
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Real product, banner, category, and logo assets will replace
                centralized placeholders in a later phase.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="foundation-heading" className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 id="foundation-heading" className="text-2xl font-semibold">
            Phase 1 foundation
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {foundationHighlights.map((item) => (
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
        </div>
      </section>
    </StoreShell>
  );
}

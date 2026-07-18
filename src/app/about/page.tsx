import { Leaf } from "lucide-react";

import { StoreShell } from "@/components/layout/store-shell";
import { PageHeader } from "@/components/storefront/page-header";
import { Section } from "@/components/storefront/section";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const metadata = {
  title: "About",
  description: "About the storefront.",
};

export default function AboutPage() {
  return (
    <StoreShell>
      <PageHeader
        description="This page reserves space for the real business story without inventing sourcing claims, certifications, or history."
        eyebrow="About"
        title="A storefront for a small traditional products business"
      />
      <main id="main-content">
        <Section>
          <Card>
            <CardHeader>
              <Leaf aria-hidden="true" className="size-7 text-primary" />
              <h2 className="mt-4 text-xl font-semibold">
                Owner-provided content pending
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                Final business name, story, sourcing details, preparation notes,
                product claims, and imagery must be supplied and reviewed before
                this page presents them publicly.
              </p>
            </CardContent>
          </Card>
        </Section>
      </main>
    </StoreShell>
  );
}

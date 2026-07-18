import { Mail } from "lucide-react";

import { StoreShell } from "@/components/layout/store-shell";
import { EmptyState } from "@/components/storefront/empty-state";
import { PageHeader } from "@/components/storefront/page-header";

export const metadata = {
  title: "Contact",
  description: "Contact information for the store.",
};

export default function ContactPage() {
  return (
    <StoreShell>
      <PageHeader
        description="The contact layout is ready. Verified public phone, email, address, and social links will be configured later."
        eyebrow="Contact"
        title="Contact the store"
      />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          description="No public contact details are shown until the owner supplies confirmed business information."
          icon={Mail}
          title="Contact details pending"
        />
      </main>
    </StoreShell>
  );
}

import Link from "next/link";

import { StoreShell } from "@/components/layout/store-shell";
import { EmptyState } from "@/components/storefront/empty-state";
import { storefrontMain } from "@/components/storefront/layout-classes";
import { PageHeader } from "@/components/storefront/page-header";
import { Button } from "@/components/ui/button";
import { AddressCard } from "@/features/addresses/components/address-card";
import { AddressForm } from "@/features/addresses/components/address-form";
import { getCustomerAddresses } from "@/features/addresses/queries/addresses";

export const metadata = {
  title: "Addresses",
  robots: {
    index: false,
    follow: false,
  },
};

const addressErrors: Record<string, string> = {
  "default-failed": "Unable to update the default address.",
  "delete-blocked": "This address is linked to an order and cannot be deleted.",
  "delete-failed": "Unable to delete that address.",
  invalid: "Check the address details and try again.",
  "save-failed": "Unable to save the address. Tamil Nadu delivery only.",
};

export default async function AddressesPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = (await searchParams) ?? {};
  const error =
    typeof params.addressError === "string"
      ? addressErrors[params.addressError]
      : undefined;
  const addresses = await getCustomerAddresses("/addresses");

  return (
    <StoreShell>
      <PageHeader
        description="Saved shipping addresses are restricted to Tamil Nadu for this storefront."
        eyebrow="Account"
        title="Saved addresses"
      />
      <main className={storefrontMain} id="main-content">
        {error ? (
          <p
            className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
          <section
            aria-labelledby="saved-addresses-heading"
            className="space-y-4"
          >
            <h2 className="sr-only" id="saved-addresses-heading">
              Saved addresses
            </h2>
            {addresses.length > 0 ? (
              addresses.map((address) => (
                <AddressCard address={address} key={address.id} />
              ))
            ) : (
              <EmptyState
                action={
                  <Button asChild variant="outline">
                    <Link href="/checkout">Return to checkout</Link>
                  </Button>
                }
                description="Add a Tamil Nadu shipping address before placing an order."
                title="No saved addresses"
              />
            )}
          </section>
          <aside aria-labelledby="add-address-heading">
            <h2 className="mb-3 text-lg font-semibold" id="add-address-heading">
              Add address
            </h2>
            <AddressForm />
          </aside>
        </div>
      </main>
    </StoreShell>
  );
}
